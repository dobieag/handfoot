const db = require("./db");
const game = require("./game");

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
    var players = await module.exports.getAll(gameid);
    for (var i = 0, ct = players.length; i < ct; i++) {
        var player = players[i];
        if (player.subId === userid) {
            if (player.dealTime === 0) {
                // player hasn't dealt
                player.didDeal = true;
                player.dealTime = new Date().getTime();
                await db.setDataByItem(player);
            }
        }
    }
    
    var dealCt = 0;
    players = await module.exports.getAll(gameid);
    for (var i = 0, ct = players.length; i < ct; i++) {
        var player = players[i];
        if (player.dealTime !== 0) {
            //console.log(player.dealTime);
            dealCt++;
        }
    }

    //console.log("dealCt: " + dealCt);
    var didDeal = false;
    if (dealCt > 0) {
        if (dealCt == players.length) {
            players.sort(function(a, b) {
                return a.dealTime - b.dealTime;
            });
            // check if the last user to deal is the current one and then deal
            if (players[players.length-1].subId === userid) {
            //if (players[0].subId === userid) {
                //console.log("Dealing starting...");
                didDeal = true;
                var gameData = await db.getData(gameid, gameid);
                var drawPile = await db.getData(gameid, "drawPile");
                //console.log(players);
                for (var i=0, ct = players.length; i < ct; i++) {
                    var player = players[i];
                    //console.log("Dealing: " + player.name);
                    var hand = [];
                    var foot = [];
                    for (var j = 0; j < 11; j++) {
                        hand.push(drawPile.drawPile.shift());
                        foot.push(drawPile.drawPile.shift());
                    }
                    player.hand = hand;
                    player.foot = foot;
                    player.didDraw = false;
                    player.didDeal = true;
                    await db.setDataByItem(player);

                    var t = await db.getData(gameid, player.teamid);
                    t.cardCt[t.playerIds.indexOf(player.subId)] = player.hand.length;
                    await db.setDataByItem(t);
                }
                await db.setDataByItem(drawPile);

                //console.log("Dealing all done!");
                gameData.state.ready = true;
                await db.setDataByItem(gameData);
            }
        }
    }
    return didDeal;
}

exports.draw = async (gameid, userid) => {
    //console.log("  DRAWING!");
    var gameData = await db.getData(gameid, gameid);
    var drawPile = await db.getData(gameid, "drawPile");
    var players = await module.exports.getAll(gameid);
    var player = null;
    var activePlayer = null;
    for (var pIdx in players){
        var p = players[pIdx];
        //console.log("p.subId: " + p.subId + "  ==  " + userid);
        if (p.subId == userid) {
            player = p;
        }
        if (p.isActivePlayer) {
            activePlayer = p;
        }
    }
    
    player.didDraw = true;
    player.lastDrawTime = new Date().getTime();
    player.hand.push(drawPile.drawPile.shift());
    var last = drawPile.drawPile.shift();
    player.hand.push(last);
    player.isActiveDrawer = false
    player.lastDrawIndex = last.idx;
    await db.setDataByItem(player);
    await db.setDataByItem(drawPile);

    //console.log("  Player drawing is moving activeDrawer");
    var nextDrawerId = gameData.playOrder[(gameData.playOrder.indexOf(player.subId) + 1) % gameData.playOrder.length];
    var nextDrawer = await db.getData(gameid, nextDrawerId);
    //console.log(nextDrawer);
    if (nextDrawer.hasOwnProperty("partner")) {
        if (nextDrawer.partner != activePlayer.subId) {
            nextDrawer.isActiveDrawer = true;
        } else {
            nextDrawer.isActiveDrawer = false;
        }
    } else {
        // single player teams
        if (nextDrawer.subId != activePlayer.subId && !nextDrawer.didDraw) {
            nextDrawer.isActiveDrawer = true;
        } else {
            nextDrawer.isActiveDrawer = false;
        }
    }
    //console.log(gameData.state);
    await db.setDataByItem(nextDrawer);
    
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
    player.isActivePlayer = false;
    await db.setDataByItem(player);

    //console.log("player.js: player IS out: " + gameData.state.playerOut);
    if (gameData.state.playerOut == null) {
        // console.log("setting up active player...");
        var activeIdx = gameData.playOrder.indexOf(player.subId);
        activeIdx = (activeIdx + 1) % gameData.playOrder.length;
        var activePlayerId = gameData.playOrder[activeIdx];
        var activePlayer = await db.getData(gameid, activePlayerId);
        activePlayer.isActivePlayer = true;
        await db.setDataByItem(activePlayer);

        var players = await module.exports.getAll(gameid);
        var lastDrawTime = -1;
        var lastDrawer = null;
        var activeDrawer = null;
        for (var pIdx in players){
            var p = players[pIdx];
            if (p.isActiveDrawer) {
                activeDrawer = p;
            }
            if (typeof p.lastDrawTime !== "undefined") {
                //console.log(p.subId + " => " + p.lastDrawTime);
                if (p.lastDrawTime > lastDrawTime) {
                    lastDrawTime = p.lastDrawTime;
                    lastDrawer = p;
                }
            }
        }
        // The discard moving the activeDrawer should only happen if activeDrawer is null.
        // Normally a player drawing will increment the activeDrawer
        if (lastDrawer.didDraw && activeDrawer == null) {
            //console.log("  Player discarding is moving activeDrawer");
            var nextDrawerId = gameData.playOrder[(gameData.playOrder.indexOf(lastDrawer.subId) + 1) % gameData.playOrder.length];
            // console.log(nextDrawerId);
            var nextDrawer = await db.getData(gameid, nextDrawerId);
            if (nextDrawer.hasOwnProperty("partner")) {
                if (nextDrawer.partner != activePlayer.subId) {
                    nextDrawer.isActiveDrawer = true;
                } else {
                    nextDrawer.isActiveDrawer = false;
                }
            } else {
                // single player teams
                if (nextDrawer.subId != activePlayer.subId && !nextDrawer.didDraw) {
                    nextDrawer.isActiveDrawer = true;
                } else {
                    nextDrawer.isActiveDrawer = false;
                }
            }
            await db.setDataByItem(nextDrawer);
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

