const db = require("./db");
const user = require("./user");
const player = require("./player");
const team = require("./team");

exports.connect = async (gameId, userId, connectionId, name, action) => {
    if (action == "test") {
        try {
            var games = await db.getData("_GAMES_", "_GAMES_");
            console.log(games.games);
            if (games.games.indexOf(gameId) == -1) {
                throw("Game not created");
            }
        } catch(e) {
            throw("Game not created");
        }
        return;  // only doing a test so do not continue
    }
    try {
        await module.exports.setBaseGameData(gameId, action);
    } catch (err) {
        //await ddb.put({TableName: process.env.TABLE_NAME,Item: {gameId: "ERROR",message: "Unable to set gameData"}}).promise();
        //await db.setDataByItem({"gameId":"msg", "subId":"error", "details":'Unable to set gameData: ' + JSON.stringify(err)});
        //return { statusCode: 500, body: 'Unable to create game: ' + JSON.stringify(err) };
        throw ("Unable to create game: " + JSON.stringify(err));
    }

    try {
        await module.exports.setGamesData(gameId);
    } catch (err) {
        //await db.setDataByItem({ "gameId": "msg", "subId": "error", "details": 'Unable to set userata: ' + JSON.stringify(err) });
        //return { statusCode: 500, body: 'Unable to set games data: ' + JSON.stringify(err) };
        throw ('Unable to set games data: ' + JSON.stringify(err));
    }

    try {
        await user.createUserData(gameId, userId, connectionId, name);
    } catch (err) {
        //await db.setDataByItem({ "gameId": "msg", "subId": "error", "details": 'Unable to set userata: ' + JSON.stringify(err) });
        //return { statusCode: 500, body: 'Unable to set user data: ' + JSON.stringify(err) };
        throw ('Unable to set user data: ' + JSON.stringify(err));
    }

    try {
        await module.exports.setTablesData(gameId, userId);
    } catch (err) {
        //await db.setDataByItem({ "gameId": "msg", "subId": "error", "details": 'Unable to set userata: ' + JSON.stringify(err) });
        //return { statusCode: 500, body: 'Unable to set tables data: ' + JSON.stringify(err) };
        throw ('Unable to set tables data: ' + JSON.stringify(err));
    }
};

exports.createSnapshot = async (gameId, snapId) => {
    var n = Date.now();
    if (typeof snapId != "undefined") {
        n = snapId;
    }
    var d = await module.exports.getGameData(gameId);
    await db.setDataByItem({ "gameId": gameId, "subId": n.toString(), "data": d });
    var tables = await db.getData(gameId, "tables");
    tables.tables.push(n.toString());
    await db.setDataByItem(tables);
    return n;
}

exports.setBaseGameData = async (gameId, action) => {
    //await db.setDataByItem({"gameId":gameId, "subId":"setBaseGameData", "data":"function called: " + gameId + "  " + action});
    var gameData = await db.getData(gameId, gameId);
    if (Object.keys(gameData).length === 0 && action != "start") {
        //throw("Game has not been started!");
        throw ("Game has not started");
    } else if (Object.keys(gameData).length === 0) {
        gameData = {
            gameId: gameId,
            subId: gameId,
            created: Date.now(),
            playOrder: [],
            state: {
                drawIndex: 0,
                activeDrawer: null,
                lastDrawer: null,
                firstPlayer: null,
                shuffled: false,
                activePlayer: {
                    id:null,
                    name: null,
                    inFoot: false
                },
                didDeal: [],
                lastMessage: null,
                ready: false,
                teamsReady: false,
                teams: {},
                playerOut: null,
            },
        };
        //await db.setDataByItem({"gameId":gameId, "subId":"setBaseGameData_gameData", "data":gameData});
    }

    //gameData.Item.connectionId = event.requestContext.connectionId;
    await db.setDataByItem(gameData);
    //await db.setDataByItem({"gameId":gameId, "subId":"setBaseGameData_DONE", "data":gameData});
};

exports.setGamesData = async (gameId) => {
    var gamesData = await db.getData("_GAMES_", "_GAMES_");
    if (Object.keys(gamesData).length === 0) {
        gamesData = {
            gameId: "_GAMES_",
            subId: "_GAMES_",
            games: [],
        };
    }
    if (gamesData.games.indexOf(gameId) == -1) {
        gamesData.games.push(gameId);
        await db.setDataByItem(gamesData);
    }
};

exports.setTablesData = async (gameId, subId) => {
    var tableData = await db.getData(gameId, "tables");
    if (Object.keys(tableData).length === 0) {
        tableData = {
            gameId: gameId,
            subId: "tables",
            tables: ["tables", gameId]  // Prep it with the tables and gameId values so they will get deleted correctly
        }
    }
    if (tableData.tables.indexOf(subId) == -1) {
        tableData.tables.push(subId);
        await db.setDataByItem(tableData);
    }
};

exports.getGameData = async (gameId) => {
    var rslt = [];
    var tables = await db.getData(gameId, "tables");
    //console.log(tables.tables);
    for (var i = 0, ct = tables.tables.length; i < ct; i++) {
        rslt.push(await db.getData(gameId, tables.tables[i]));
    }
    return rslt;
}

exports.setGameData = async (data) => {
    for (var i = 0, ct = data.length; i < ct; i++) {
        db.setDataByItem(data[i]);
    }
};

exports.getConnections = async (gameId) => {
    var connections = await db.getFilteredData(gameId, "p-");
    //await setData({Item:{"gameId":"msg", "subId":"info", "details":'Found players: ' + JSON.stringify(connections)}, TableName:process.env.TABLE_NAME});
    var observers = await db.getFilteredData(gameId, "o-");
    for (var i = 0, ct = observers.length; i < ct; i++) {
        connections.push(observers[i]);
    }
    return connections;
}

exports.getGames = async () => {
    var games = await db.getData("_GAMES_", "_GAMES_");
    var dbgIdx = games.games.indexOf("debug");
    if (dbgIdx > -1)
        games.games.splice(dbgIdx, 1);
    return games.games;
}

exports.deleteGameData = async (gameId) => {
    var gameData = await module.exports.getGameData(gameId);

    for (var i = 0, ct = gameData.length; i < ct; i++) {
        var item = gameData[i];
        await db.deleteData(gameId, item.subId);
    }

    var games = await db.getData("_GAMES_", "_GAMES_");
    games.games.splice(games.games.indexOf(gameId), 1);
    await db.setDataByItem(games);
}

exports.getState = async (gameid) => {
    var data = await db.getData(gameid, gameid);
    if (data.state.activePlayer.id != null) {
        var activePlayer = await db.getData(gameid, data.state.activePlayer.id);
        data.state.activePlayer.name = activePlayer.name;
        data.state.activePlayer.inFoot = activePlayer.inFoot;
    }
    console.log("getting Team Overview");
    data.state.teams = await team.getOverview(gameid);
    return data.state;
}

exports.shuffle = async (gameid) => {
    var gameData = await db.getData(gameid, gameid);
    var shuffle = function (array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i

            // swap elements array[i] and array[j]
            // we use "destructuring assignment" syntax to achieve that
            // you'll find more details about that syntax in later chapters
            // same can be written as:
            // let t = array[i]; array[i] = array[j]; array[j] = t
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    var suits = ["H", "D", "C", "S"];   // Hearts, Diamonds, Clubs, Spades
    var cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];  // Ace, 2,3,4,5,6,7,8,9,10, Jack, Queen, King
    var drawPile = [];
    var id = 0;
    for (var d = 0, dct = gameData.playOrder.length + 1; d < dct; d++) {
        for (var i = 0, sct = suits.length; i < sct; i++) {
            for (var j = 0, cct = cards.length; j < cct; j++) {
                drawPile.push({ "id": id++, "name": cards[j], "suit": suits[i] });
            }
        }
        drawPile.push({ "id": id++, "name": "J", "suit": null });
        drawPile.push({ "id": id++, "name": "J", "suit": null });  // push two Jokers onto the deck
    }
    shuffle(drawPile);
    for (i=0,ct=drawPile.length; i<ct; i++) {
        drawPile[i].idx = i;
    }
    gameData.drawPile = drawPile;
    gameData.state.shuffled = true;
    gameData.state.drawIndex = 0;
    gameData.state.didDeal = [];
    if (gameData.state.firstPlayer == null) {
        gameData.state.firstPlayer = gameData.playOrder[0];
    } else {
        gameData.state.firstPlayer = gameData.playOrder[(gameData.playOrder.indexOf(gameData.state.firstPlayer) + 1) % gameData.playOrder.length];
        var firstPlayer = await db.getData(gameid, gameData.state.firstPlayer);
        gameData.state.lastMessage = "NEW Round! " + firstPlayer.name + " starts!";
    }
    await db.setDataByItem(gameData);
    
    var players = await player.getAll(gameid);
    players.map(async (p) => {
        delete p["hand"];
        delete p["foot"];
        await db.setDataByItem(p);
    });

    return gameData.state;
}

exports.updateScores = async (gameId) => {
    var cardScore = function (card, isFoot) {
        if (card.name == "J" && card.suit == null) {
            return 50;
        } else if (card.name == "3") {
            if (isFoot) {
                if (card.suit == "H" || card.suit == "D") {
                    return 300;
                } else return 100;
            } else {
                if (card.suit == "H" || card.suit == "D") {
                    return 100;
                } else return 5;
            }
        } else {
            if (["8", "9", "10", "J", "Q", "K"].indexOf(card.name) > -1) return 10;
            else if (card.name == "2" || card.name == "A") return 20;
            else return 5;
        }
    };

    var teams = await team.getAll(gameId);
    var gameData = await db.getData(gameId, gameId);
    for (var tIdx = 0, tCt = teams.length; tIdx < tCt; tIdx++) {
        var t = teams[tIdx];
        var scoreLog = { "round": t.scores.length + 1, "scores": [] };
        t.scores.push(scoreLog);
        var handScore = 0;
        var cleanList = [];
        var dirtyList = [];
        for (var key in t.cards) {
            var card = t.cards[key];
            var clean = true;
            if (card.length >= 7) {
                for (var i = 0, ct = card.length; i < ct; i++) {
                    var c = card[i];
                    if ((c.name == "2" || c.name == "J") && key != "W") { // Otherwise the wild book is going to always mark as dirty
                        clean = false;
                    }
                }
                if (key == "W") {
                    handScore += 1500;  // wild book is 1500
                    cleanList.push("W");
                } else if (clean) {
                    handScore += 500;
                    cleanList.push(key);
                } else if (!clean) {
                    handScore += 300;
                    dirtyList.push(key);
                }
            }
        }
        scoreLog.scores.push({ "type": "base", "score": handScore, "clean": cleanList, "dirty": dirtyList });
        t.score += handScore;
        handScore = 0;

        var playedCards = [];
        for (var key in t.cards) {
            var card = t.cards[key];
            for (var i = 0, ct = card.length; i < ct; i++) {
                var c = card[i];
                handScore += cardScore(c, false);
                playedCards.push(c);
            }
            /** Clean out the remaining cards so they don't get rescored if UpdateScores is called again */
            t.cards[key] = [];
        }
        scoreLog.scores.push({ "type": "playedCards", "score": handScore, "cards": playedCards });
        t.score += handScore;

        var teamPlayers = [];
        for (var i = 0, ct = t.playerIds.length; i < ct; i++) {
            var player = await db.getData(gameId, t.playerIds[i]);
            teamPlayers.push(player);
            var negScore = 0;
            if (player.hasOwnProperty("hand")) {
                for (var j = 0, jct = player.hand.length; j < jct; j++) {
                    negScore -= cardScore(player.hand[j], false);
                }
            }
            scoreLog.scores.push({ "type": "hand-" + player.name, "score": negScore, "cards": player.hand });
            t.score += negScore;
            delete player["hand"];
        }
        for (var i = 0, ct = t.playerIds.length; i < ct; i++) {
            var player = teamPlayers[i];
            var negScore = 0;
            if (player.hasOwnProperty("foot")) {
                for (var j = 0, jct = player.foot.length; j < jct; j++) {
                    negScore -= cardScore(player.foot[j], true);
                }
            }
            scoreLog.scores.push({ "type": "foot-" + player.name, "score": negScore, "cards": player.foot });
            t.score += negScore;
            delete player["foot"];
            player.inFoot = false;
            await db.setDataByItem(player);
        }
        t.inFoot = [];
        t.melded = false;
        await db.setDataByItem(t);

        console.log("SCORE LOG:", scoreLog);
    }

    gameData.state.activePlayer.id = null;
    gameData.state.activePlayer.name = null;
    gameData.state.activePlayer.inFoot = false;
    gameData.state.playerOut = null;
    gameData.state.ready = false;
    gameData.state.shuffled = false;
    await db.setDataByItem(gameData);
}

exports.getScores = async (gameId) => {
    var teams = await team.getAll(gameId);
    for (var i=0, ct=teams.length; i<ct; i++) {
        var t = teams[i];
        for (var key in t) {
            //console.log(key);
            if (key != "playerNames" && key != "score" && key != "scores") {
                //console.log("DELETING KEY: " + key);
                delete t[key];
            }
        }
    }
    return teams;
}