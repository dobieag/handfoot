//var params={};location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(s,k,v){params[k]=v});
var params = {};
var socket, _ignoreReorder, _gameState = null,
    _player = null,
    _players = null,
    _team = null,
    _trackMeld = false,
    _isActive = false,
    _stageHistory = [],
    _names = [],
    _reorderTimeout = null,
    doKeepalive = true,
    lastKeepalive,
    keepaliveTime = 30000;
var _staged = {
    "4": [],
    "5": [],
    "6": [],
    "7": [],
    "8": [],
    "9": [],
    "10": [],
    "J": [],
    "Q": [],
    "K": [],
    "A": [],
    "W": []
};

window.onhashchange = function () {
    setupGameFromParams();
}

$(function () {
    $("#gameHeader").addClass("ui-widget-header ui-helper-clearfix");
    $("button").button();
    $("#discard").droppable({
        drop: discardDrop
    });

    $("#startJoin").dialog({
        autoOpen: false,
        modal: true,
        minWidth: 336,
        title: "Start or Join"
    });
    $("#startJoin").siblings(".ui-dialog-titlebar").children("button").hide();
    $("#startJoin").siblings(".ui-dialog-titlebar").removeClass("ui-draggable-handle");

    $("#join").dialog({
        autoOpen: false,
        modal: true,
        minWidth: 336,
        title: "Join Game"
    });
    $("#join").siblings(".ui-dialog-titlebar").children("button").hide();
    $("#join").siblings(".ui-dialog-titlebar").removeClass("ui-draggable-handle");
    $("#btnJoinPlayer").button("disable");

    $("#setupGame").dialog({
        autoOpen: false,
        modal: true,
        minWidth: 400,
        title: "Teams"
    });
    $("#setupGame").siblings(".ui-dialog-titlebar").children("button").hide();
    $("#setupGame").siblings(".ui-dialog-titlebar").removeClass("ui-draggable-handle");

    $("#txtGameName").on("input", function (evt, ui) {
        var game = $(this).val().replace("-", "");
        $("#btnJoinPlayer").button("disable");
        if (game.length >= 6) {
            game = game.toLowerCase().substring(0, 3) + "-" + game.toLowerCase().substring(3, 6);
            $(this).val(game);
            var url = "wss://" + _settings.apiId + ".execute-api.us-east-2.amazonaws.com/Prod?game=" + game + "&action=test";
            var testSocket = new WebSocket(url);
            testSocket.onopen = function(event){
                this.close();
                $("#btnJoinPlayer").button("enable");
                //callSocket("getPlayers");
                params.game = $("#txtGameName").val();
                setupSocket($("#txtGameName").val(), params.userid, null, params.action);
            }.bind(testSocket);
            testSocket.onerror = function (error) {
                alert("game NOT started");
                // GAME NOT STARTED
            };
        }
    });
    
    $("#txtPlayerName").autocomplete();

    for (var i = 0; i < 4; i++) {
        addTeamSelect();
    }
    $(".teamSetup select").selectmenu({
        width: 100
    });
    setupGameFromParams();
    if (doKeepalive) {
        keepalive();
    }
});

function keepalive() {
    setTimeout(function () {
        if (lastKeepalive) {
            var gap = Date.now() - lastKeepalive;
            console.log("keepalive: " + gap);
            if (gap > keepaliveTime + 3000) {
                //alert("keepalive didn't return fast enought!");
                if (params.hasOwnProperty("game") && params.hasOwnProperty("userid") && params.hasOwnProperty("name") && params.hasOwnProperty("action")) {
                    console.log("reconnecting...");
                    setupSocket(params.game.toLowerCase(), params.userid.toLowerCase(), params.name, params.action.toLowerCase());
                }
            }
        }
        callSocket("keepalive");
        keepalive();
    }, keepaliveTime);
}

function goHome() {
    var url = location.origin + location.pathname;
    location.href = url;
}

function setupGameFromParams() {
    params = {};
    location.hash.replace(/[#&]+([^=&]+)=([^&]*)/gi, function (s, k, v) {
        params[k] = v
    });
    if (!params.hasOwnProperty("game")) {
        if (!params.hasOwnProperty("userid")) {
            // LOAD PAGE
            $("#startJoin").dialog("open");
            $("#join").dialog("close");
        } else {
            $("#startJoin").dialog("close");
            $("#join").dialog("open");
            $("#txtGameName").val("");
            ////$("#txtGameName").focus();
        }
        return;
    } else if (!params.hasOwnProperty("userid")) {
        $("#lblGameName").text("You do not have a user ID. Please go back to the main site and join first.");
        $("#lblGameName").show();
        return;
    }

    if (!params.hasOwnProperty("name")) {
        if (params.action == "start") {
            //$("#setupGame").show();
            $("#txtGameName").val(params.game);
            $("#join").dialog("open");
            ////$("#txtPlayerName").focus();
            $("#btnJoinPlayer").button("enable");
        }
        //setupSocket(params.game.toLowerCase(), params.userid.toLowerCase(), null, params.action.toLowerCase());
    } else {
        $("#lblPlayerName").html(params.name).show();
        if (params.action == "start") {
            $("#join").dialog("close");
            $("#setupGame").dialog("open");
            $("#setupGame").dialog("option", "title", "Teams: " + params.game);
        } else if (params.action == "join") {
            $("#startJoin").dialog("close");
            $("#join").dialog("close");
            $("#game").show();
        }
        setupSocket(params.game.toLowerCase(), params.userid.toLowerCase(), params.name, params.action.toLowerCase());
    }
    $("#lblGameName").show();
    $("#lblGameName").text("Game Name: " + params.game.toUpperCase());
}

function startGame() {
    $("#startJoin").dialog("close");
    var gameid = basicUUID();
    //gameid = "123-456";
    var url = location.origin + location.pathname + "#game=" + gameid + "&userid=p-" + basicUUID() + "&action=start";
    location.href = url;
}

function startJoin() {
    var userid = basicUUID();
    var url = location.origin + location.pathname + "#userid=p-" + userid + "&action=join";
    location.href = url;
}

function joinGame() {
    var action = "join";
    if (params.hasOwnProperty("action")) {
        action = params.action + "&sendName=1";
    }
    var gameName = $("#txtGameName").val().toLowerCase();
    //alert(gameName);
    if (gameName.indexOf("-") == -1) {
        gameName = gameName.substring(0, 3) + "-" + gameName.substring(3, 6);
    }
    var name = $("#txtPlayerName").val();
    var userid = params.userid;
    if (_players != null) {
        for (var i=0,ct=_players.length; i<ct; i++) {
            if (_players[i].name == $("#txtPlayerName").val()) {
                //alert("chose name " + _players[i].id);
                callSocket("deletePlayer", params.userid);
                userid = _players[i].id;
                action = params.action; // remove sendName parameter so it doesn't create another user
            }
        }
    }
    var url = location.origin + location.pathname + "#game=" + gameName + "&userid=" + userid + "&name=" + name + "&action=" + action;
    location.href = url;
}

/***************************************
/*  PLAYER FUNCTIONS
/***************************************/
function storeName() {
    var name = $("#txtPlayerName").val();
    name = name.trim();
    var url = location.origin + location.pathname + "#game=" + params.game + "&userid=" + params.userid + "&name=" + name + "&action=" + params.action + "#sendName";
    location.href = url;
}

function deal() {
    callSocket("deal");
}

function draw() {
    _player.didDraw = true;
    $("#btnDraw").hide();
    //$("#discard").show();
    callSocket("draw");
}

function displayHand(data) {
    $("#playerHand").children().each((id, el) => {
        $(el).remove();
    });
    data.map(card => {
        //var cardVal = card.suit != null ? card.name + card.suit : card.name;
        var cardVal = card.name;
        var c = $("<li><span>" + cardVal + "</span></li>")
            .addClass("card ui-state-default ui-corner-all")
            .data("value", card)
            .appendTo("#playerHand");
        if (card.suit == "H") {
            $('<i class="em em-hearts" aria-role="presentation" aria-label="BLACK CLUB SUIT"></i>').appendTo(c);
        } else if (card.suit == "D") {
            $('<i class="em em-diamonds" aria-role="presentation" aria-label="BLACK CLUB SUIT"></i>').appendTo(c);
        } else if (card.suit == "C") {
            $('<i class="em em-clubs" aria-role="presentation" aria-label="BLACK CLUB SUIT"></i>').appendTo(c);
        } else if (card.suit == "S") {
            $('<i class="em em-spades" aria-role="presentation" aria-label="BLACK CLUB SUIT"></i>').appendTo(c);
        }
        if ((card.name == "J" && card.suit == null) || card.name == "2")
            c.addClass("wild");
        else if (card.suit == "H" || card.suit == "D")
            c.addClass("red");
        else
            c.addClass("black");
        if (card.name == "3")
            c.addClass("three");
        for (var i = 0, ct = _stageHistory.length; i < ct; i++) {
            if (_stageHistory[i].dropped.id == card.id) {
                c.addClass("staged");
                break;
            }
        }
    });
    $("#playerHand").sortable({
        //start: (event, ui) => {
        //    console.log("starting to drag: " + $(ui.item).data("value") );
        //},
        placeholder: "ui-state-highlight",
        start: (event, ui) => {
            if (_reorderTimeout != null) {
                clearTimeout(_reorderTimeout);
                console.log("clearing old timeout");
            }
        },
        update: (event, ui) => {
            var vals = [];
            var items = $("#playerHand").children().each((idx, el) => {
                vals.push($(el).data("value"));
            });
            //console.log(vals);
            if (!_ignoreReorder) {
                callSocket("reorder", vals);
            }
            _ignoreReorder = false;
        }
    });
    $("#playerHand").disableSelection();
}

function cardDropped(event, ui) {
    if (_player.inFoot) {
        if ($(".card").length - $(".card.staged").length == 1) {
            $("#dialog").text("You can't play the last card from your foot. You need to discard it.").dialog();
            return;
        }
    }
    if (!_player.didDraw) {
        $("#dialog").text("You can't play cards because you haven't drawn yet.").dialog();
        return;
    } else if (!_player.didDraw) {
        $("#dialog").text("Please draw first.").dialog();
        return;
    }
    _ignoreReorder = true;
    var dropped = $(ui.draggable).data("value");
    if ($(ui.draggable).hasClass("staged")) {
        // user is re-dragging a previously staged card :(
        return;
    }
    var droppedOn = $(this).data("value");
    if (dropped.name == droppedOn || dropped.name == "2" || (dropped.name == "J" && dropped.suit == null)) {
        if (droppedOn != "W") {
            if (dropped.name == "2" || (dropped.name == "J" && dropped.suit == null)) {
                var playedCards = ([]).concat(_staged[droppedOn]);
                var nonWild = _team.played[droppedOn].clean;
                var wild = _team.played[droppedOn].wild;
                for (var i = 0, ct = playedCards.length; i < ct; i++) {
                    if (playedCards[i].name == droppedOn) {
                        nonWild++;
                    } else {
                        wild++;
                    }
                }
                if (nonWild <= 2 && wild == 1) {
                    $("#dialog").text("You need to play another non-wild before you can play another wild on this stack.").dialog();
                    return;
                }
            }
        }
        if (_isActive) {
            $("#playButtons").show();
            $("#btnPlay").show();
        } else {
            $("#playButtons").show();
            $("#btnPlay").hide();
        }
        _stageHistory.push({
            "dropped": dropped,
            "on": droppedOn
        });

        $(ui.draggable).addClass("staged");
        var tl = $($(this).children(".spaceTL")[0]);
        if (tl.text() == "") {
            tl.text("1");
        } else {
            tl.text(parseInt(tl.text()) + 1);
        }
        _staged[droppedOn].push(dropped);
        updateCards(_team.played);
        $("#discard").hide();
    }
    //console.log(_team.cards);
}

function updateCards(played) {
    var score = 0;
    for (var key in played) {
        //var space = $("#space_" + key);
        var space = $("#yourTeam").find(".space_" + key);
        var sCt = _staged[key].length != 0 ? _staged[key].length : "";
        var pCt = played[key].clean + played[key].wild;
        pCt = pCt != 0 ? pCt : "";
        $(space.children(".spaceTL")[0]).text(sCt);
        $(space.children(".spaceTR")[0]).text(pCt);
        space.removeClass("clean dirty cleanClosed dirtyClosed");

        //var allCards = [].concat(_staged[key]).concat(played[key].played);
        var allCards = [].concat(_staged[key]);
        if (allCards.length + played[key].clean + played[key].wild > 0) {
            var clean = played[key].wild == 0;
            var cCt = played[key].clean;
            var dCt = played[key].wild;
            var suffix = allCards.length + cCt + dCt >= 7 ? "Closed" : "";
            for (var i = 0, ct = allCards.length; i < ct; i++) {
                var c = allCards[i];
                if ((c.name == "J" && c.suit == null) || c.name == "2") {
                    clean = false;
                    dCt++;
                } else {
                    cCt++;
                }
            }
            if (key === "W") clean = true;
            space.removeClass("clean dirty cleanClosed dirtyClosed");
            if (clean) {
                space.addClass("clean" + suffix);
            } else {
                space.addClass("dirty" + suffix);
                space.children(".spaceBottom").text(cCt + "/" + dCt);
            }
        }

        if (_trackMeld) {
            for (var i = 0, ct = _staged[key].length; i < ct; i++) {
                var cardScore = 5;
                var card = _staged[key][i];
                if (card.name == "J" && card.suit == null) {
                    score += 50;
                } else {
                    if (["8", "9", "10", "J", "Q", "K"].indexOf(card.name) > -1) cardScore = 10;
                    else if (card.name == "2" || card.name == "A") cardScore = 20;
                    score += cardScore;
                }
            }
            updateMelding(score);
        }
    }
}

function updateMelding(score) {
    var meldAmt = 50;
    if (_team.score > 1995) meldAmt = 90;
    if (_team.score > 3995) meldAmt = 120;
    if (_team.score > 5995) meldAmt = 150;
    if (_team.score > 7995) meldAmt = 190;
    $("#melding").text("Melding: " + score + "/" + meldAmt);
}

function cancelStaged() {
    _stageHistory = [];
    $("#playButtons").hide();
    $("#discard").show();
    for (var key in _staged) {
        if (_staged[key].length > 0) {
            $("#space_" + key).removeClass("clean dirty cleanClosed dirtyClosed");
            _staged[key] = [];
            $("#space_" + key + " .spaceBottom").html("&nbsp;");
        }
    }
    updateCards(_team.played);
    $(".staged").removeClass("staged");
}

function undoStaged() {
    var last = _stageHistory.pop();
    var dropped = _staged[last.on].pop();
    var staged = $(".card.staged");
    for (var i = 0, ct = staged.length; i < ct; i++) {
        if ($(staged[i]).data("value").id == dropped.id) {
            $(staged[i]).removeClass("staged");
            break;
        }
    }
    var space = $("#space_" + last.on);
    space.removeClass("clean dirty cleanClosed dirtyClosed");
    updateCards(_team.played);
    if (_stageHistory.length == 0) {
        $("#discard").show();
        $("#playButtons").hide();
    }
}

function playStaged() {
    var hasClean = false;
    var hasDirty = false;
    for (var key in _staged) {
        var allCards = [].concat(_staged[key]);
        var cardLen = allCards.length + _team.played[key].clean + _team.played[key].wild;
        if (cardLen > 0 && cardLen < 3) {
            $("#dialog").text("Card " + key + " must have more than 3 cards to start the book.").dialog();
            return;
        }
    }
    if (_player.inFoot && ($(".card").length - $(".card.staged").length == 1)) {
        // User has one card left from foot that's not staged
        // check if there's a closed clean and dirty book
        for (key in _staged) {
            allCards = [].concat(_staged[key]);
            var cardCount = allCards.length + _team.played[key].clean + _team.played[key].wild;
            if (cardCount >= 7) {
                var isClean = _team.played[key].wild == 0;
                if (isClean) {
                    for (var i = 0, ct = allCards.length; i < ct; i++) {
                        var c = allCards[i];
                        if ((c.name == "J" && c.suit == null) || c.name == "2") {
                            isClean = false;
                            continue;
                        }
                    }
                }
                if (isClean == true) hasClean = true;
                else hasDirty = true;
            }
        }
        if (!hasClean || !hasDirty) {
            $("#dialog").text("You need to have at least one clean and one dirty book closed.").dialog();
            return;
        }
    }
    // If rechead here then all started books have the correct number of cards
    hasClean = false;
    hasDirty = false;
    if (_trackMeld) {
        var score = 0;
        for (var key in _staged) {
            if (_staged[key].length > 0) {
                var isClean = true;
                for (var i = 0, ct = _staged[key].length; i < ct; i++) {
                    var c = _staged[key][i];
                    var cardScore = 5;
                    if ((c.name == "J" && c.suit == null) || c.name == "2") {
                        isClean = false;
                    }
                    if (c.name == "J" && c.suit == null) {
                        score += 50;
                    } else {
                        if (["8", "9", "10", "J", "Q", "K"].indexOf(c.name) > -1) cardScore = 10;
                        else if (c.name == "2" || c.name == "A") cardScore = 20;
                        score += cardScore;
                    }
                }
                if (isClean) hasClean = true;
                else hasDirty = true;
            }
        }
        if (!hasClean || !hasDirty) {
            $("#dialog").text("You need to have at least one clean and one dirty book to meld.").dialog();
            return;
        }
        var meldAmt = 50;
        if (_team.score > 1995) meldAmt = 90;
        if (_team.score > 3995) meldAmt = 120;
        if (_team.score > 5995) meldAmt = 150;
        if (_team.score > 7995) meldAmt = 190;
        if (score < meldAmt) {
            $("#dialog").text("You did not meet the minimum score to meld.").dialog();
            return;
        }
    }
    _stageHistory = [];
    $("#playButtons").hide();
    $("#discard").show();
    callSocket("play", _staged);
    for (var key in _staged){
        _staged[key] = [];
    }
    $(".spaceTL").text("");
}

/***************************************
/*  TEAM SETUP
/***************************************/
function addTeamSelect() {
    var teamCt = $(".teamSetup").length;
    var teamIdx = teamCt + 1;
    var team = $("<div class='teamSetup'></div>");
    team.append("<div>Team " + teamIdx + "</div>");
    team.append("<label>Name: </label>");
    var sel = $("<select class='cbPlayer'></select>").appendTo(team);
    sel.selectmenu({
        width: 100
    });
    team.append("<label>Name: </label>");
    sel = $("<select class='cbPlayer'></select>").appendTo(team);
    sel.selectmenu({
        width: 100
    });
    $("#setupTeams").append(team);
    //updatePersonList(_names);
}

function saveTeams() {
    var teams = [];
    for (var i = 0, ct = $(".teamSetup").length; i < ct; i++) {
        var pSel = $($(".teamSetup")[i]).children("select");
        var ids = [];
        if ($(pSel[0]).val() == "0" && $(pSel[1]).val() == "0")
            continue;
        if ($(pSel[0]).val() != "0")
            ids.push({
                "index": 0,
                "id": $(pSel[0]).val()
            });
        if ($(pSel[1]).val() != "0")
            ids.push({
                "index": 1,
                "id": $(pSel[1]).val()
            });
        teams.push({
            "index": i,
            "teamid": "t-" + basicUUID(),
            "ids": ids
        });
    }
    if (teams.length > 0)
        callSocket("saveTeams", teams);
}

/***************************************
/*  SOCKET SETUP
/***************************************/
function setupSocket(game, userid, name, action) {
    //alert("setting up socket: " + userid + "  " + name);
    var url = "wss://" + _settings.apiId + ".execute-api.us-east-2.amazonaws.com/Prod?game=" + game + "&userid=" + userid;
    if (typeof name != "undefined" && name != null) {
        url += "&name=" + name;
    }
    if (typeof action != "undefined" && action != null) {
        url += "&action=" + action;
    }
    socket = new WebSocket(url);
    socket.onopen = (event) => {
        if (!params.hasOwnProperty("name")) {
            callSocket("getPlayers");
        } else {
            callSocket("getPlayer");
        }
        if (params.hasOwnProperty("sendName")) {
            callSocket("getPlayers"); // triggers the server to send the list of players to everyone
            var hash = "#";
            for (var key in params) {
                if (key != "sendName") {
                    hash += "&" + key + "=" + params[key];
                }
            }
            location.hash = hash;
        }
        if (params.action == "start") {

        } else if (params.action == "view") {

        }
    };
    socket.onerror = function (error) {
        $("#error").show();
        $("#game").hide();
        $("#start").hide();
        $("#lblError").text("Unable to connect to game: " + params.game)
    };
    socket.onmessage = function (event) {
        var data = JSON.parse(event.data);
        console.log(data.info);
        /** START VIEW **/
        if (params.action == "start") {
            switch (data.info) {
                case "state":
                    _gameState = data.data;
                    if (_gameState.playerOut != null) {
                        $("#btnUpdateScores").show();
                    }
                    if (data.data.shuffled) {
                        $("#btnShuffle").hide();
                    }
                    $("#startJoin").dialog("close");
                    if (!data.data.teamsReady) {
                        $("#startJoin").dialog("open");
                        //createTeamSelects();
                        callSocket("getPlayers");
                    } else {
                        $("#setupGame").dialog("close");
                        if (!data.data.shuffled && data.data.playerOut == null) {
                            $("#btnShuffle").show();
                        }
                        $("#game").show();
                    }
                    break;
                case "players":
                    /** This is the list of players that have joined */
                    updatePersonList(data.data);
                    break;
            }
        }

        /** Global handling of data from the server **/
        /** DO NOT callSocket in this section unless shared between start/view modes! **/
        switch (data.info) {
            case "keepalive":
                lastKeepalive = Date.now();
                break;
            case "players":
                _players = data.data;
                var names = [];
                for (var i=0, ct=_players.length; i<ct; i++) {
                    names.push(_players[i].name);
                }
                $("#txtPlayerName").autocomplete({
                    source: names
                });
                break;
            case "state":
                _gameState = data.data;
                if (data.data.hasOwnProperty("teams")) {
                    updateTeams(data.data.teams);
                }
                if (!_gameState.ready && _gameState.didDeal.indexOf(params.userid) == -1) {  // Empty deal list means a new game
                    $("#playerHand").children().each((idx, ui) => {
                        $(ui).remove();
                    });
                    clearTable();
                }
                if (data.data.shuffled) {
                    if (_player != null && !_player.hasOwnProperty("hand")) {
                        $("#btnDeal").show();
                    }
                }
                if (_gameState.activePlayer.id != null && _gameState.activeDrawer == params.userid) {
                    $("#btnDraw").show();
                } else {
                    $("#btnDraw").hide();
                }
                if (_gameState.activePlayer.id == params.userid && _gameState.playerOut == null && _player.didDraw) {
                    // It's this user's turn!
                    _isActive = true;
                    $("#discard").show();
                    $("#btnPlay").show();
                } else {
                    _isActive = false;
                    $("#discard").hide();
                }
                if (data.data.playerOut != null) {
                    console.log(data.data.playerOut + " is out of cards!");
                    $("[data-id='" + _gameState.playerOut + "']").addClass("playerOut");
                    $("#btnDraw").hide();
                    $("#discard").hide();
                    $("#btnDeal").hide();
                }
                if (data.data.lastMessage) {
                    $("#lastPlay").html(data.data.lastMessage);
                }
                if (data.data.activePlayer.id != null) {
                    $(".activePlayer").removeClass("activePlayer");
                    $('[data-id="' + data.data.activePlayer.id + '"]').addClass("activePlayer");
                }
                if (_gameState.teamsReady) {
                    //Teams are setup so get them
                    //callSocket("getTeams");
                }
                break;
                //            case "teams":
                //                $("#game").show();
                //                if (data.data.length > 0) {
                //                    updateTeams(data.data);
                //                }
                //                break;
                //            case "team":
                //                updateTeam(data.data);
                //                break;
            case "playerInfo":
                _player = data.data;
                callSocket("getState");
                $("#lblPlayerName").html(_player.name);
                if (data.data.hasOwnProperty("hand")) {
                    $("#btnDeal").hide();
                    if (_player.didDraw) {
                        $("#discard").show();
                    }
                    displayHand(data.data.hand);
                } else {
                    displayHand([]);
                }
                if (data.data.inFoot) {
                    $("#lblPlayerName").addClass("infoot");
                } else {
                    $("#lblPlayerName").removeClass("infoot");
                }
                break;
            case "playerHand":
                /** The player received a hand update */
                $("#btnDeal").hide();
                $("#playerHand").show();
                _player.hand = data.data;
                displayHand(data.data);
                break;
        }
        return;
    };
}

function callSocket(action, value) {
    if (typeof socket != "undefined" && socket.readyState == 1) {
        socket.send(JSON.stringify({
            "message": "doaction",
            "game": params.game,
            "userid": params.userid,
            "action": action,
            "value": value
        }));
    }
}

function doShuffle() {
    callSocket("shuffle");
}

function updatePersonList(names) {
    //_names = names;
    for (var i = 0, ct = names.length; i < ct; i++) {
        var found = false;
        for (var j = 0, jCt = _names.length; j < jCt; j++) {
            if (_names[j].id == names[i].id) {
                found = true;
                break;
            }
        }
        if (!found) {
            _names.push(names[i]);
        }
    }
    $(".cbPlayer option").each(function () {
        $(this).remove();
    });
    var tNames = [{
        "name": "",
        id: "0"
    }];
    for (var i = 0, ct = _names.length; i < ct; i++) {
        tNames.push(_names[i]);
    }
    for (var i = 0, ct = tNames.length; i < ct; i++) {
        $(".cbPlayer").each(function () {
            $(this).append($("<option value='" + tNames[i].id + "'>" + tNames[i].name + "</option>"));
        });
    }
    $(".teamSetup select").selectmenu("refresh");
}

function clearTable() {
    $(".tableSpaces .spaceItem").removeClass("clean dirty cleanClosed dirtyClosed");
    $(".tableSpaces .spaceItem .spaceTL").text("");
    $(".tableSpaces .spaceItem .spaceTR").text("");
    $(".tableSpaces .spaceItem .spaceBottom").text("");
    $(".infoot").removeClass("infoot");
    delete _player.hand;
}



function updateTeams(teams) {
    var ts = [];
    for (var key in teams) {
        ts.push(teams[key]);
    }
    ts.sort((a, b) => (a.index > b.index) ? 1 : -1)
    for (var i = 0, ct = ts.length; i < ct; i++) {
        var team = ts[i];
        updateTeam(team);
    }
    //for (i=teams.length; i<3; i++) {
    //    var t = $(".team")[i];
    //    $(t).remove();
    //}
}

function updateTeam(team) {
    //var t = $(".team")[team.index];
    var t = $('[data-tid="' + team.subId + '"]')
    var playerTeam, placeTeamIn;
    if (_player == null) {
        alert("_player is null!");
    }
    if (_player != null && team.ids.indexOf(_player.subId) > -1) {
        placeTeamIn = "#yourTeam";
        playerTeam = true;
        _team = team;
        if (!_team.melded) {
            _trackMeld = true;
            $("#melding").show();
            updateMelding(0);
        } else {
            _trackMeld = false;
            $("#melding").hide();
        }
        if (_team.score != 0) {
            $("#btnShuffle").hide();
        }
    } else {
        playerTeam = false;
        placeTeamIn = "#opponents";
    }
    if (t.length == 0) {
        t = $("<div class='team' data-tid='" + team.subId + "'></div>");
        $(placeTeamIn).append(t);
    }
//    $(t).children().each((e, ui) => {
//        $(ui).remove();
//    });

    var h2 = $(t[0]).children("h2");
    var teamTitle = "";
    if (h2.length == 0) {
        teamTitle = "<h2>";
    }
    if (playerTeam) {
        teamTitle += "Your Team (" + (team.index + 1) + ")";
    } else {
        teamTitle += "Team " + (team.index + 1);
    }
    teamTitle += " - <span class='name' data-id='" + team.ids[0] + "'>" + team.names[0] + "</span> (<span data-cardCt='" + team.ids[0] + "'></span>)";
    if (team.ids.length > 1) {
        teamTitle += "& <span class='name' data-id='" + team.ids[1] + "'>" + team.names[1] + "</span> (<span data-cardCt='" + team.ids[1] + "'></span>)";
    }
    teamTitle += " (Score <span class='score'>" + team.score + "</span>)";
    if (h2.length == 0) {
        teamTitle += "</h2>";
        $(t).append(teamTitle);
    } else {
        $(h2[0]).html(teamTitle);
    }

    var tableSpaces = $(t[0]).children(".tableSpaces");
    var spaces = ["4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "W"];
    var tSpaces = $("<div></div>").addClass("tableSpaces").appendTo(t);
    for (var s = 0, sct = spaces.length; s < sct; s++) {
        if (tableSpaces.length == 0) {
            var item = $("<div></div>")
                .addClass("space_" + spaces[s] + " spaceItem ui-state-default");
            if (playerTeam) {
                item.data("value", spaces[s])
                    .droppable({
                        drop: cardDropped
                    });
            }
            if (playerTeam) {
                $("<div></div>").addClass("spaceTL").appendTo(item);
            }
            $("<div></div>").addClass("spaceTR").appendTo(item);
            $("<div>" + spaces[s] + "</div>").addClass("spaceMain").appendTo(item);
            $("<div></div>").html("&nbsp;").addClass("spaceBottom").appendTo(item);
            tSpaces.append(item);
        } else {
            var tl = _staged[spaces[s]].length;
            tl = tl == 0 ? "" : tl;
            $(tableSpaces).children(".space_" + spaces[s] + " .spaceTL").text(tl);
            $(tableSpaces).children(".space_" + spaces[s] + " .spaceTR").text(team.played[spaces[s]].clean + team.played[spaces[s]].wild);
        }
    }
    updateTeamCards(team, team.played);
    updateTeamLabels(team);
}

function updateTeamCards(team, cards) {
    var team = $($('[data-tid="' + team.subId + '"]').children(".tableSpaces")[0]);
    for (var key in cards) {
        if (cards[key] == null) {
            break;
        }
        var space = $(team.children(".space_" + key)[0]);
        var pCt = cards[key].clean + cards[key].wild;
        pCt = pCt != 0 ? pCt : "";
        if (cards[key].clean > 0) {
            var clean = true;
            var suffix = _staged[key].length + cards[key].clean + cards[key].wild >= 7 ? "Closed" : "";
            if (cards[key].wild > 0) clean = false;
            if (key === "W") {
                clean = true;
            } else {
                for (var i=0,ct = _staged[key].length; i<ct; i++) {
                    var card = _staged[key][i];
                    if (card.name == "2" || (card.name == "J" && card.suit == null)) {
                        clean = false;
                    }
                }
            }
            
            space.removeClass("clean dirty cleanClosed dirtyClosed");
            if (clean) {
                space.addClass("clean" + suffix);
            } else {
                space.addClass("dirty" + suffix);
                space.children(".spaceBottom").text(cards[key].clean + "/" + cards[key].wild);
            }
        }

        $(space.children(".spaceTR")[0]).text(pCt);
    }
}

function updateTeamLabels(team) {
    if (_gameState.playerOut != null) {
        $("[data-id='" + _gameState.playerOut + "']").addClass("playerOut");
    }
    var t = $('[data-tid="' + team.subId + '"]').children(".infoot").removeClass("infoot");
    for (var i = 0, ct = team.inFoot.length; i < ct; i++) {
        $('[data-id="' + team.inFoot[i] + '"]').addClass("infoot");
    }
    for (var i = 0, ct = team.ids.length; i < ct; i++) {
        $('[data-cardCt="' + team.ids[i] + '"]').text(team.cardCt[i]);
    }
    $(".activePlayer").removeClass("activePlayer");
    $('[data-id="' + _gameState.activePlayer.id + '"]').addClass("activePlayer");
}

function updateScores() {
    callSocket("updateScores");
    $("#btnUpdateScores").hide();
}

function discardDrop(event, ui) {
    $("#discard").hide();
    _ignoreReorder = true;
    _player.didDraw = false;
    $(ui.draggable).hide();
    var discarded = $(ui.draggable).data("value");
    callSocket("discard", discarded);
}

function createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function basicUUID() {
    return 'xxx-xxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 10 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
