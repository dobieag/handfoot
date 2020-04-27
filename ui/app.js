/*eslint-env es6*/ // Enables es6 error checking for that file
/*eslint-env jquery*/ // Enables error checking for jquery functions
/*eslint-env browser*/ // Lets you use document and other standard browser functions
/*eslint no-console: 0*/ // Lets you use console (for example to log something)

/*global settings, WebSocket, $, console */
/* exported goHome getScore startGame startJoin joinGame deal draw cancelStaged undoStaged playStaged saveTeams displayScores */

//var params={};location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(s,k,v){params[k]=v});
var params = {};
var socket, ignoreReorder, gameState = null,
    player = null,
    players = null,
    myTeam = null,
    trackMeld = false,
    isActive = false,
    //stageHistory = [],
    lastMessage = null,
    names = [],
    doKeepalive = true,
    lastKeepalive,
    keepaliveTime = 30000;

function cleanLocal() {
    var keys = Object.keys(localStorage);
    for (var i=0; i<keys.length; i++) {
        if (keys[i].indexOf(params.game) === -1) {
            localStorage.removeItem(keys[i]);
        }
    }
}

function getLocal(suffix) {
    var rslt = JSON.parse(localStorage.getItem(params.game + "_" + params.userid + "_" + suffix));
    return rslt;
}

function setLocal(suffix, data) {
    localStorage.setItem(params.game + "_" + params.userid + "_" + suffix, JSON.stringify(data));
}

function hasStaged(){
    var stage_history = getLocal(STAGE_HISTORY);
    if (stage_history.length > 0) {
        return true;
    }
    return false;
}

const CARDS = "CARDS",
      STAGED = "STAGED",
      STAGE_HISTORY = "STAGE_HISTORY";

/***************************************
/  SOCKET SETUP
***************************************/
function callSocket(action, value) {
    "use strict";
    if (typeof socket !== "undefined" && socket.readyState === 1) {
        socket.send(JSON.stringify({
            "message": "doaction",
            "game": params.game,
            "userid": params.userid,
            "action": action,
            "value": value
        }));
    }
}

function setupSocket(game, userid, name, action) {
    "use strict";
    var key, url = "wss://" + settings.apiId + ".execute-api.us-east-2.amazonaws.com/Prod?game=" + game + "&userid=" + userid;
    if (typeof name !== "undefined" && name !== null) {
        url += "&name=" + name;
    }
    if (typeof action !== "undefined" && action !== null) {
        url += "&action=" + action;
    }
    socket = new WebSocket(url);
    socket.onopen = function () {
        if (!params.hasOwnProperty("name")) {
            callSocket("getPlayers");
        } else {
            callSocket("getPlayer");
        }
        if (params.hasOwnProperty("sendName")) {
            callSocket("getPlayers"); // triggers the server to send the list of players to everyone
            var hash = "#";
            for (key in params) {
                if (key !== "sendName") {
                    hash += "&" + key + "=" + params[key];
                }
            }
            location.hash = hash;
        }
    };
    socket.onerror = function () {
        $("#error").show();
        $("#game").hide();
        $("#start").hide();
        $("#lblError").text("Unable to connect to game: " + params.game);
    };
    socket.onmessage = function (event) {
        var i, ct, names, data = JSON.parse(event.data);
        console.log(data.info);
        /** START VIEW **/
        if (params.action === "start") {
            switch (data.info) {
            case "state":
                gameState = data.data;
                $("#startJoin").dialog("close");
                if (!data.data.teamsReady) {
                    $("#setupGame").dialog("open");
                    $("#setupGame").dialog("option", "title", "Teams: " + params.game);
                    callSocket("getPlayers");
                } else {
                    $("#setupGame").dialog("close");
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
            players = data.data;
            names = [];
            for (i = 0, ct = players.length; i < ct; i = i + 1) {
                names.push(players[i].name);
            }
            $("#txtPlayerName").autocomplete({
                source: names
            });
            break;
        case "state":
            gameState = data.data;
            if (data.data.hasOwnProperty("teams")) {
                updateTeams(data.data.teams);
            }
            if (!gameState.ready && gameState.didDeal.indexOf(params.userid) === -1) {  // Empty deal list means a new game
                $("#playerHand").children().each((idx, ui) => {
                    $(ui).remove();
                });
                clearTable();
            }
            if (data.data.shuffled) {
                if (player != null && !player.hasOwnProperty("hand")) {
                    $("#btnDeal").show();
                }
            }
            if (gameState.activePlayer.id != null && gameState.activeDrawer == params.userid) {
                $("#btnDraw").show();
            } else {
                $("#btnDraw").hide();
            }
            if (gameState.activePlayer.id == params.userid && gameState.playerOut == null && player.didDraw) {
                // It's this user's turn!
                isActive = true;
                if (!hasStaged()) {
                    $("#discard").show();
                }
                $("#btnPlay").show();
            } else {
                isActive = false;
                $("#discard").hide();
            }
            if (data.data.playerOut != null) {
                console.log(data.data.playerOut + " is out of cards!");
                $("[data-id='" + gameState.playerOut + "']").addClass("playerOut");
                $("#btnDraw").hide();
                $("#discard").hide();
                $("#btnDeal").hide();
            }
            if (data.data.lastMessage) {
                $("#lastPlay").html(data.data.lastMessage);
                if (data.data.lastMessage.indexOf("into their foot") > -1 && data.data.lastMessage != lastMessage) {
                    $("#tadaF").trigger('play');
                }
                lastMessage = data.data.lastMessage;
            }
            if (data.data.activePlayer.id != null) {
                $(".activePlayer").removeClass("activePlayer");
                $('[data-id="' + data.data.activePlayer.id + '"]').addClass("activePlayer");
            }
            break;
        case "playerInfo":
            player = data.data;
            callSocket("getState");
            $("#lblPlayerName").html(player.name);
            if (data.data.hasOwnProperty("hand")) {
                $("#btnDeal").hide();
                var staged = getLocal(STAGED);
                
                if (player.didDraw && !hasStaged()) {
                    $("#discard").show();
                }
                var cards = getLocal(CARDS);
                if (cards === null) {
                    setLocal(CARDS, data.data.hand);
                } else {
                    cards = updateLocalCards(data.data.hand);
                    data.data.hand = cards;
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
            var hand = updateLocalCards(data.data);
            player.hand = hand;
            displayHand(hand);
            break;
        case "scores":
            displayScores(data.data);
            break;
        }
        return;
    };
}

function setupGameFromParams() {
    params = {};
    location.hash.replace(/[#&]+([^=&]+)=([^&]*)/gi, function (s, k, v) {
        params[k] = v;
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

    // params.game exists so it's a good time to set up some of the base local data:
    cleanLocal();
    var staged = getLocal(STAGED);
    if (staged == null) {
        setLocal(STAGED, {
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
        });
    }
    var stageHistory = getLocal(STAGE_HISTORY);
    if (stageHistory == null) {
        setLocal(STAGE_HISTORY, []);
    } else if (hasStaged()) {
        $("#playButtons").show();
        $("#discard").hide();
    }
    
    if (!params.hasOwnProperty("name")) {
        if (params.action === "start") {
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
            $("#startJoin").dialog("close");
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

window.onhashchange = function () {
    setupGameFromParams();
};

$(function () {
    var i;
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

    $("#scoresDialog").dialog({
        autoOpen: false,
        modal: true,
        minWidth: 400,
        maxHeight: 400,
        title: "Scores"
    })
    
    $("#txtGameName").on("input", function () {
        var game = $(this).val().replace("-", "");
        $("#btnJoinPlayer").button("disable");
        if (game.length >= 6) {
            game = game.toLowerCase().substring(0, 3) + "-" + game.toLowerCase().substring(3, 6);
            $(this).val(game);
            var url = "wss://" + settings.apiId + ".execute-api.us-east-2.amazonaws.com/Prod?game=" + game + "&action=test";
            var testSocket = new WebSocket(url);
            testSocket.onopen = function(){
                this.close();
                $("#btnJoinPlayer").button("enable");
                //callSocket("getPlayers");
                params.game = $("#txtGameName").val();
                setupSocket($("#txtGameName").val(), params.userid, null, params.action);
            }.bind(testSocket);
            testSocket.onerror = function () {
                alert("game NOT started");
                // GAME NOT STARTED
            };
        }
    });
    
    $("#txtPlayerName").autocomplete();

    for (i = 0; i < 4; i++) {
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

function getScore() {
    callSocket("getScores");
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
    if (players != null) {
        for (var i=0,ct=players.length; i<ct; i++) {
            if (players[i].name == $("#txtPlayerName").val()) {
                //alert("chose name " + players[i].id);
                callSocket("deletePlayer", params.userid);
                userid = players[i].id;
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
/*
function storeName() {
    var name = $("#txtPlayerName").val();
    name = name.trim();
    var url = location.origin + location.pathname + "#game=" + params.game + "&userid=" + params.userid + "&name=" + name + "&action=" + params.action + "#sendName";
    location.href = url;
}
*/

function deal() {
    $("#btnDeal").hide();
    callSocket("deal");
}

function draw() {
    player.didDraw = true;
    $("#btnDraw").hide();
    //$("#discard").show();
    callSocket("draw");
}

function displayHand(data) {
    ignoreReorder = false;
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
        var stageHistory = getLocal("STAGE_HISTORY");
        for (var i = 0, ct = stageHistory.length; i < ct; i++) {
            if (stageHistory[i].dropped.id == card.id) {
                c.addClass("staged");
                break;
            }
        }
        setLocal("STAGE_HISTORY", stageHistory);
    });
    $("#playerHand").sortable({
        //start: (event, ui) => {
        //    console.log("starting to drag: " + $(ui.item).data("value") );
        //},
        placeholder: "ui-state-highlight",
        start: () => {
        },
        update: () => {
            var vals = [];
            $("#playerHand").children().each((idx, el) => {
                vals.push($(el).data("value"));
            });
            //console.log(vals);
            if (!ignoreReorder) {
                if (typeof(Storage) !== "undefined") {
                    // store data in local storage instead
                    setLocal(CARDS, vals);
                }
            } else {
                var hand = getLocal(CARDS);
                displayHand(hand);
            }
            ignoreReorder = false;
        }
    });
    $("#playerHand").disableSelection();
}

function cardDropped(event, ui) {
    if (player.inFoot) {
        if ($(".card").length - $(".card.staged").length == 1) {
            $("#dialog").text("You can't play the last card from your foot. You need to discard it.").dialog();
            return;
        }
    }
    if (!player.didDraw) {
        $("#dialog").text("You can't play cards because you haven't drawn yet.").dialog();
        return;
    } else if (!player.didDraw) {
        $("#dialog").text("Please draw first.").dialog();
        return;
    }
    ignoreReorder = true;
    var dropped = $(ui.draggable).data("value");
    if ($(ui.draggable).hasClass("staged")) {
        // user is re-dragging a previously staged card :(
        return;
    }
    var droppedOn = $(this).data("value");
    var staged = getLocal(STAGED);
    if (dropped.name == droppedOn || dropped.name == "2" || (dropped.name == "J" && dropped.suit == null)) {
        if (droppedOn != "W") {
            if (dropped.name == "2" || (dropped.name == "J" && dropped.suit == null)) {
                var playedCards = ([]).concat(staged[droppedOn]);
                var nonWild = myTeam.played[droppedOn].clean;
                var wild = myTeam.played[droppedOn].wild;
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
        if (isActive) {
            $("#playButtons").show();
            $("#btnPlay").show();
        } else {
            $("#playButtons").show();
            $("#btnPlay").hide();
        }
        var stageHistory = getLocal(STAGE_HISTORY);
        stageHistory.push({
            "dropped": dropped,
            "on": droppedOn
        });
        setLocal(STAGE_HISTORY, stageHistory);

        $(ui.draggable).addClass("staged");
        var tl = $($(this).children(".spaceTL")[0]);
        if (tl.text() == "") {
            tl.text("1");
        } else {
            tl.text(parseInt(tl.text()) + 1);
        }
        staged[droppedOn].push(dropped);
        setLocal(STAGED, staged);
        updateCards(myTeam.played);
        $("#discard").hide();
    }
    //console.log(myTeam.cards);
}

function updateLocalCards(fromServer) {
    var hand = getLocal(CARDS);
    if (hand === null) {
        setLocal(CARDS, fromServer);
        return fromServer;
    }
    for (var i=0,ct=fromServer.length; i<ct; i++) {
        var foundInHand = false;
        for (var j=0; j<hand.length; j++) {
            if (fromServer[i].id == hand[j].id) {
                foundInHand = true;
                break;
            }
        }
        if (!foundInHand) {
            hand.push(fromServer[i]);
        }
    }
    for (i=0; i<hand.length; i++) {
        var foundOnServer = false;
        for (j=0; j<fromServer.length; j++) {
            if (fromServer[j].id == hand[i].id) {
                foundOnServer = true;
                break;
            }
        }
        if (!foundOnServer) {
            hand.splice(i, 1);
            i--;
        }
    }
    setLocal(CARDS, hand);
    return hand;
}

function updateCards(played) {
    var staged = getLocal(STAGED);
    for (var key in played) {
        //var space = $("#space_" + key);
        var space = $("#yourTeam").find(".space_" + key);
        var sCt = staged[key].length != 0 ? staged[key].length : "";
        var pCt = played[key].clean + played[key].wild;
        pCt = pCt != 0 ? pCt : "";
        $(space.children(".spaceTL")[0]).text(sCt);
        $(space.children(".spaceTR")[0]).text(pCt);
        space.removeClass("clean dirty cleanClosed dirtyClosed");

        //var allCards = [].concat(staged[key]).concat(played[key].played);
        var allCards = [].concat(staged[key]);
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

        if (trackMeld) {
            updateMelding();
        }
    }
}

function updateMelding() {
    var score = 0;
    var staged = getLocal(STAGED);
    for (var key in staged) {
        for (var i = 0, ct = staged[key].length; i < ct; i++) {
            var cardScore = 5;
            var card = staged[key][i];
            if (card.name == "J" && card.suit == null) {
                score += 50;
            } else {
                if (["8", "9", "10", "J", "Q", "K"].indexOf(card.name) > -1) cardScore = 10;
                else if (card.name == "2" || card.name == "A") cardScore = 20;
                score += cardScore;
            }
        }
    }
    var meldAmt = 50;
    if (myTeam.score > 1995) meldAmt = 90;
    if (myTeam.score > 3995) meldAmt = 120;
    if (myTeam.score > 5995) meldAmt = 150;
    if (myTeam.score > 7995) meldAmt = 190;
    $("#melding").text("Melding: " + score + "/" + meldAmt);
}

function cancelStaged() {
    //stageHistory = [];
    setLocal(STAGE_HISTORY, []);
    var staged = getLocal(STAGED);
    $("#playButtons").hide();
    $("#discard").show();
    for (var key in staged) {
        if (staged[key].length > 0) {
            $("#yourTeam").find(".space_" + key).removeClass("clean dirty cleanClosed dirtyClosed");
            staged[key] = [];
            $("#yourTeam").find(".space_" + key + " .spaceBottom").html("&nbsp;");
        }
    }
    setLocal(STAGED, staged);
    updateCards(myTeam.played);
    $(".staged").removeClass("staged");
}

function undoStaged() {
    var stageHistory = getLocal(STAGE_HISTORY);
    var staged = getLocal(STAGED);
    var last = stageHistory.pop();
    var dropped = staged[last.on].pop();
    var stagedDiv = $(".card.staged");
    for (var i = 0, ct = stagedDiv.length; i < ct; i++) {
        if ($(stagedDiv[i]).data("value").id == dropped.id) {
            $(stagedDiv[i]).removeClass("staged");
            break;
        }
    }
    setLocal(STAGED, staged);
    setLocal(STAGE_HISTORY, stageHistory);

    var space = $("#yourTeam").find(".space_" + last.on);
    space.removeClass("clean dirty cleanClosed dirtyClosed");
    updateCards(myTeam.played);
    if (stageHistory.length == 0) {
        $("#discard").show();
        $("#playButtons").hide();
    }
}

function playStaged() {
    var hasClean = false;
    var hasDirty = false;
    var staged = getLocal(STAGED);
    for (var key in staged) {
        var allCards = [].concat(staged[key]);
        var cardLen = allCards.length + myTeam.played[key].clean + myTeam.played[key].wild;
        if (cardLen > 0 && cardLen < 3) {
            $("#dialog").text("Card " + key + " must have more than 3 cards to start the book.").dialog();
            return;
        }
    }
    if (player.inFoot && ($(".card").length - $(".card.staged").length == 1)) {
        // User has one card left from foot that's not staged
        // check if there's a closed clean and dirty book
        for (key in staged) {
            allCards = [].concat(staged[key]);
            var cardCount = allCards.length + myTeam.played[key].clean + myTeam.played[key].wild;
            if (cardCount >= 7) {
                var isClean = myTeam.played[key].wild == 0;
                if (key === "W") {
                    isClean = true;
                } else if (key !== "W" && isClean) {
                    // Check to make sure a wild wasn't put on a previously clean book to try to close it
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
    if (trackMeld) {
        var score = 0;
        for (key in staged) {
            if (staged[key].length > 0) {
                isClean = true;
                for (i = 0, ct = staged[key].length; i < ct; i++) {
                    c = staged[key][i];
                    var cardScore = 5;
                    if (((c.name == "J" && c.suit == null) || c.name == "2") && (key != "W")) {
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
        if (myTeam.score > 1995) meldAmt = 90;
        if (myTeam.score > 3995) meldAmt = 120;
        if (myTeam.score > 5995) meldAmt = 150;
        if (myTeam.score > 7995) meldAmt = 190;
        if (score < meldAmt) {
            $("#dialog").text("You only have " + score + " points and did not meet the minimum score of " + meldAmt + " to meld.").dialog();
            return;
        }
    }
    setLocal(STAGE_HISTORY, []);
    $("#playButtons").hide();
    $("#discard").show();
    callSocket("play", staged);
    for (key in staged){
        staged[key] = [];
    }
    setLocal(STAGED, staged);
    $(".spaceTL").text("");
}

/***************************************
/*  TEAM SETUP
/***************************************/
function addTeamSelect() {
    var teamCt = $(".teamSetup").length;
    var teamIdx = teamCt + 1;
    var t = $("<div class='teamSetup'></div>");
    t.append("<div>Team " + teamIdx + "</div>");
    t.append("<label>Name: </label>");
    var sel = $("<select class='cbPlayer'></select>").appendTo(t);
    sel.selectmenu({
        width: 100
    });
    t.append("<label>Name: </label>");
    sel = $("<select class='cbPlayer'></select>").appendTo(t);
    sel.selectmenu({
        width: 100
    });
    $("#setupTeams").append(t);
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

/*
function doShuffle() {
    callSocket("shuffle");
}
*/

function updatePersonList(allNames) {
    //names = names;
    for (var i = 0, ct = allNames.length; i < ct; i++) {
        var found = false;
        for (var j = 0, jCt = names.length; j < jCt; j++) {
            if (names[j].id == allNames[i].id) {
                found = true;
                break;
            }
        }
        if (!found) {
            names.push(allNames[i]);
        }
    }
    $(".cbPlayer option").each(function () {
        $(this).remove();
    });
    var tNames = [{
        "name": "",
        id: "0"
    }];
    for (i = 0, ct = names.length; i < ct; i++) {
        tNames.push(names[i]);
    }
    for (i = 0, ct = tNames.length; i < ct; i++) {
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
    delete player.hand;
}



function updateTeams(teams) {
    var ts = [];
    for (var key in teams) {
        ts.push(teams[key]);
    }
    ts.sort((a, b) => (a.index > b.index) ? 1 : -1)
    for (var i = 0, ct = ts.length; i < ct; i++) {
        var t = ts[i];
        updateTeam(t);
    }
}

function updateTeam(team) {
    //var t = $(".team")[team.index];
    var t = $('[data-tid="' + team.subId + '"]')
    var staged = getLocal(STAGED);
    var playerTeam, placeTeamIn;
    if (player == null) {
        alert("player is null!");
    }
    if (player != null && team.ids.indexOf(player.subId) > -1) {
        placeTeamIn = "#yourTeam";
        playerTeam = true;
        myTeam = team;
        if (!myTeam.melded) {
            trackMeld = true;
            $("#melding").show();
            updateMelding();
        } else {
            trackMeld = false;
            $("#melding").hide();
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
                var tl = staged[spaces[s]].length;
                tl = tl == 0 ? "" : tl;
                $("<div>" + tl + "</div>").addClass("spaceTL").appendTo(item);
            }
            $("<div></div>").addClass("spaceTR").appendTo(item);
            $("<div>" + spaces[s] + "</div>").addClass("spaceMain").appendTo(item);
            $("<div></div>").html("&nbsp;").addClass("spaceBottom").appendTo(item);
            tSpaces.append(item);
        } else {
            tl = staged[spaces[s]].length;
            tl = tl == 0 ? "" : tl;
            $(tableSpaces).children(".space_" + spaces[s] + " .spaceTL").text(tl);
            $(tableSpaces).children(".space_" + spaces[s] + " .spaceTR").text(team.played[spaces[s]].clean + team.played[spaces[s]].wild);
        }
    }
    updateTeamCards(team, team.played);
    updateTeamLabels(team);
}

function updateTeamCards(team, cards) {
    var staged = getLocal(STAGED);
    var t = $($('[data-tid="' + team.subId + '"]').children(".tableSpaces")[0]);
    for (var key in cards) {
        if (cards[key] == null) {
            break;
        }
        var space = $(t.children(".space_" + key)[0]);
        var pCt = cards[key].clean + cards[key].wild;
        pCt = pCt != 0 ? pCt : "";
        if (cards[key].clean > 0) {
            var clean = true;
            var stagedClean = staged[key].length;
            var stagedWild = 0;
            var suffix = staged[key].length + cards[key].clean + cards[key].wild >= 7 ? "Closed" : "";
            if (cards[key].wild > 0) clean = false;
            if (key === "W") {
                clean = true;
            } else {
                for (var i=0,ct = staged[key].length; i<ct; i++) {
                    var card = staged[key][i];
                    if (card.name == "2" || (card.name == "J" && card.suit == null)) {
                        clean = false;
                        stagedClean--;
                        stagedWild++;
                    }
                }
            }
            
            space.removeClass("clean dirty cleanClosed dirtyClosed");
            if (clean) {
                space.addClass("clean" + suffix);
            } else {
                space.addClass("dirty" + suffix);
                space.children(".spaceBottom").text((cards[key].clean + stagedClean) + "/" + (cards[key].wild + stagedWild));
            }
        }

        $(space.children(".spaceTR")[0]).text(pCt);
    }
}

function updateTeamLabels(team) {
    if (gameState.playerOut != null) {
        $("[data-id='" + gameState.playerOut + "']").addClass("playerOut");
    }
    $('[data-tid="' + team.subId + '"]').children(".infoot").removeClass("infoot");
    for (var i = 0, ct = team.inFoot.length; i < ct; i++) {
        $('[data-id="' + team.inFoot[i] + '"]').addClass("infoot");
    }
    for (i = 0, ct = team.ids.length; i < ct; i++) {
        $('[data-cardCt="' + team.ids[i] + '"]').text(team.cardCt[i]);
    }
    $(".activePlayer").removeClass("activePlayer");
    $('[data-id="' + gameState.activePlayer.id + '"]').addClass("activePlayer");
}

function discardDrop(event, ui) {
    $("#discard").hide();
    ignoreReorder = true;
    player.didDraw = false;
    $(ui.draggable).hide();
    var discarded = $(ui.draggable).data("value");
    callSocket("discard", discarded);
}

function displayScores(data) {
    $("#scoresDialog").children().each((idx, ui) => {
        $(ui).remove();
    });
    for (var i=0, ct=data.length; i<ct; i++) {
        var t = data[i];
        var tName = "<h2>";
        for (var j=0, jCt=t.playerNames.length; j<jCt; j++) {
            tName += t.playerNames[j];
            if (j < jCt-1 && jCt > 1) {
                tName += " & ";
            }
        }
        tName += " : " + t.score;
        tName += "</h2>";
        $("#scoresDialog").append(tName);
        
        var roundDiv = $("<div></div>").addClass("round");
        for (j=t.scores.length-1; j>=0; j--) {
            var round = t.scores[j];
            var roundScore = round.scores[0].score + round.scores[1].score;
            $("<h3>Round: " + round.round + "</h3>").appendTo(roundDiv);
            $("<div>Base: " + round.scores[0].score + "</div>").appendTo(roundDiv);
            $("<div>Cards: " + round.scores[1].score + "</div>").appendTo(roundDiv);
            for (var k=2, kCt=round.scores.length; k<kCt; k++) {
                $("<div>" + round.scores[k].type.split("-").join(" ") + ": " + round.scores[k].score + "</div>").appendTo(roundDiv);
                roundScore += round.scores[k].score;
            }
            $("<div><b>Round Score: " + roundScore + "</b></div>").appendTo(roundDiv);
        }
        $("#scoresDialog").append(roundDiv);
    }
    $("#scoresDialog").dialog("open");
}

function basicUUID() {
    return 'xxx-xxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 10 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
