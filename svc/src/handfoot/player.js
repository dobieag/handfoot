const db = require("./db");

exports.getAllNames = async (gameId) => {
    let names = [];
    var players = await module.exports.getAll(gameId);

    for (let i = 0, ct = players.length; i < ct; i++) {
        let p = players[i];
        if (p.hasOwnProperty("name")) {
            names.push({ "name": p.name, "id": p.subId });
        }
    }
    return names;
}

exports.getAll = async (gameId) => {
    var players = await db.getFilteredData(gameId, "p-");
    return players;
}

exports.get = async (gameId, userId) => {
    var player = await db.getData(gameId, userId);
    var pData = {};
    for (var attrib in player) {
        if (attrib != "foot") {
            pData[attrib] = player[attrib];
        }
    }
    return pData;
}

exports.delete = async (gameId, userId) => {
    await db.deleteData(gameId, userId);

    var tables = await db.getData(gameId, "tables");
    tables.tables.splice(tables.tables.indexOf(userId), 1);
    await db.setDataByItem(tables);
}

exports.deal = async (gameid, userid) => {
    var gameData = await db.getData(gameid, gameid);
    var drawPile = gameData.drawPile;
    var hand = [];
    var foot = [];
    for (var i = 0; i < 11; i++) {
        hand.push(drawPile.shift());
        foot.push(drawPile.shift());
    }
    
    var players = await module.exports.getAll(gameid);
    for (var i = 0, ct = players.length; i < ct; i++) {
        var player = players[i];
        if (player.subId === userid) {
            if (gameData.state.didDeal.indexOf(player.subId) == -1) {
                player.hand = hand;
                player.foot = foot;
                player.didDraw = false;
                player.canDraw = false;
                gameData.state.didDeal.push(player.subId);
                await db.setDataByItem(player);

                var t = await db.getData(gameid, player.teamid);
                t.cardCt[t.playerIds.indexOf(player.subId)] = player.hand.length;
                await db.setDataByItem(t);
            }
        }
    };
    await db.setDataByItem(gameData);

    if (gameData.state.didDeal.length == gameData.playOrder.length) {
        gameData = await db.getData(gameid, gameid);
        gameData.state.activePlayer.id = gameData.state.firstPlayer;
        var activePlayer = await db.getData(gameid, gameData.state.activePlayer.id);
        gameData.state.activePlayer.name = activePlayer.name;
        gameData.state.activePlayer.inFoot = false;
        gameData.state.activeDrawer = gameData.state.firstPlayer;
        gameData.state.lastDrawer = gameData.state.firstPlayer;
        gameData.state.ready = true;
        await db.setDataByItem(gameData);
    }

    return hand;
}

exports.draw = async (gameid, userid) => {
    var gameData = await db.getData(gameid, gameid);
    var drawPile = gameData.drawPile;
    var player = await db.getData(gameid, userid);
    player.didDraw = true;
    player.hand.push(drawPile.shift());
    var last = drawPile.shift();
    player.hand.push(last);
    player.lastDrawIndex = last.idx;
    await db.setDataByItem(player);

    var nextDrawerId = gameData.playOrder[(gameData.playOrder.indexOf(gameData.state.lastDrawer) + 1) % gameData.playOrder.length];
    var nextDrawer = await db.getData(gameid, nextDrawerId);
    console.log(nextDrawer);
    if (nextDrawer.hasOwnProperty("partner")) {
        if (nextDrawer.partner != gameData.state.activePlayer.id) {
            gameData.state.activeDrawer = nextDrawerId;
            gameData.state.lastDrawer = nextDrawerId;
        } else {
            gameData.state.activeDrawer = null;
        }
    } else {
        // single player teams
        if (nextDrawer.subId != gameData.state.activePlayer.id && !nextDrawer.didDraw) {
            gameData.state.activeDrawer = nextDrawerId;
            gameData.state.lastDrawer = nextDrawerId;
        } else {
            gameData.state.activeDrawer = null;
        }
    }
    console.log(gameData.state);
    await db.setDataByItem(gameData);
    
    var t = await db.getData(gameid, player.teamid);
    t.cardCt[t.playerIds.indexOf(player.subId)] = player.hand.length;
    await db.setDataByItem(t);
    
    return player.hand;
}

exports.discard = async (gameid, userid, card) => {
    var getCardIndex = function (ary, card) {
        for (var i = 0, ct = ary.length; i < ct; i++) {
            if (ary[i].id == card.id) {
                return i;
            }
        }
    }
    var gameData = await db.getData(gameid, gameid);
    var player = await db.getData(gameid, userid);

    var t = await db.getData(gameid, player.teamid);
    player.hand.splice(getCardIndex(player.hand, card), 1);
    if (player.hand.length == 0 && player.foot.length == 0) {
        gameData.state.playerOut = player.subId;
        gameData.state.shuffled = false;

        gameData.state.lastMessage = player.name + " went out!";
    } else if (player.hand.length == 0) {
        player.hand = player.foot;
        player.foot = [];
        player.inFoot = true;
        t.inFoot.push(player.subId);

        gameData.state.lastMessage = player.name + " discarded " + card.name + (card.suit != null ? card.suit : "") + " and went into their foot!";
    } else {
        gameData.state.lastMessage = player.name + " discarded " + card.name + (card.suit != null ? card.suit : "");
    }
    
    t.cardCt[t.playerIds.indexOf(player.subId)] = player.hand.length;
    await db.setDataByItem(t);
    player.didDraw = false;
    await db.setDataByItem(player);

    //console.log("player.js: player IS out: " + gameData.state.playerOut);
    if (gameData.state.playerOut == null) {
        // console.log("setting up active player...");
        var activeIdx = gameData.playOrder.indexOf(player.subId);
        activeIdx = (activeIdx + 1) % gameData.playOrder.length;
        gameData.state.activePlayer.id = gameData.playOrder[activeIdx];
        var activePlayer = await db.getData(gameid, gameData.state.activePlayer.id);
        gameData.state.activePlayer.name = activePlayer.name;
        gameData.state.activePlayer.inFoot = activePlayer.inFoot;
        // console.log("done");

        //console.log(gameData.state);
        var lastDrawer = await db.getData(gameid, gameData.state.lastDrawer);
        //console.log(lastDrawer);
        if (lastDrawer.didDraw) {
            //console.log("lastDrawer did draw");
            var nextDrawerId = gameData.playOrder[(gameData.playOrder.indexOf(gameData.state.lastDrawer) + 1) % gameData.playOrder.length];
            // console.log(nextDrawerId);
            var nextDrawer = await db.getData(gameid, nextDrawerId);
            if (nextDrawer.hasOwnProperty("partner")) {
                if (nextDrawer.partner != gameData.state.activePlayer.id) {
                    gameData.state.activeDrawer = nextDrawerId;
                    gameData.state.lastDrawer = nextDrawerId;
                } else {
                    gameData.state.activeDrawer = null;
                }
            } else {
                // single player teams
                if (nextDrawer.subId != gameData.state.activePlayer.id && !nextDrawer.didDraw) {
                    gameData.state.activeDrawer = nextDrawerId;
                    gameData.state.lastDrawer = nextDrawerId;
                } else {
                    gameData.state.activeDrawer = null;
                }
            }
        }
    }
    //console.log(gameData);
    await db.setDataByItem(gameData);
    
    return player.hand;
}

exports.play = async (gameid, userid, cards) => {
    var getCardIndex = function (ary, card) {
        for (var i = 0, ct = ary.length; i < ct; i++) {
            if (ary[i].id == card.id) {
                return i;
            }
        }
    }
    var log = "";
    var gameData = await db.getData(gameid, gameid);
    var p = await db.getData(gameid, userid);
    console.log(cards);
    var t = await db.getData(gameid, p.teamid);
    t.melded = true;
    for (var key in cards) {
        console.log(key);
        for (var c = 0, cct = cards[key].length; c < cct; c++) {
            var card = cards[key][c];
            t.cards[key].push(card);
            p.hand.splice(getCardIndex(p.hand, card), 1);
            log += "Switched card to played: " + card + "\n";
        }
    }

    var playedIntoHand = false;
    if (p.hand.length == 0) {
        p.hand = p.foot;
        p.foot = [];
        p.inFoot = true;
        t.inFoot.push(p.subId);
        playedIntoHand = true;

        gameData.state.lastMessage = p.name + " played into their foot!";
    }
    t.cardCt[t.playerIds.indexOf(p.subId)] = p.hand.length;

    await db.setDataByItem(p);
    await db.setDataByItem(t);
    await db.setDataByItem(gameData);

    return p;
}

exports.reorder = async (gameid, userid, cards) => {
    var player = await db.getData(gameid, userid);
    player.hand = cards;
    await db.setDataByItem(player);
    return player.hand;
}

