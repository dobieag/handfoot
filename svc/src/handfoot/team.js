const db = require("./db");
const player = require("./player");
const game = require("./game");

exports.getAll = async (gameId) => {
    var teams = await db.getFilteredData(gameId, "t-");
    return teams;
}

exports.getByPlayer = async (gameId, userId) => {
    var player = await db.getData(gameId, userId);
    var t = await db.getData(gameId, player.teamid);
    return t;
}

exports.save = async (gameid, teamList) => {
    var teams = [];
    var players = await player.getAll(gameid);
    var gameData = await db.getData(gameid, gameid);
    for (var i = 0, ct = teamList.length; i < ct; i++) {
        var index = teamList[i].index;
        var teamid = teamList[i].teamid;
        await game.setTablesData(gameid, teamid);
        var tempIds = teamList[i].ids;
        var names = ["", ""];
        var ids = ["", ""];
        var cardCt = [0, 0];
        if (tempIds.length == 1) {
            console.log("shifting namdes and ids");
            names.shift();
            ids.shift();
            cardCt.shift();
        }
        for (var p = 0, pct = players.length; p < pct; p++) {
            for (var ii = 0, ict = tempIds.length; ii < ict; ii++) {
                var idx = tempIds[ii].index;
                var id = tempIds[ii].id;
                if (players[p].subId == id) {
                    names[idx] = players[p].name;
                    ids[idx] = id;
                }
            }
        }
        var team = {
            "gameId": gameid,
            "subId": teamid,
            "score": 0,
            "scores": [],
            "melded": false,
            "inFoot": [],
            "playerNames": names,
            "playerIds": ids,
            "cardCt": cardCt,
            "index": index,
            "cards": {
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
            }
        };
        teams.push(team);
        await db.setDataByItem(team);
        for (var j = 0, jct = players.length; j < jct; j++) {
            if (players[j].subId == ids[0]) {
                players[j].partner = ids[1];
                players[j].teamIdx = index;
                players[j].teamid = teamid;
                players[j].inFoot = false;
                await db.setDataByItem(players[j]);
            }
            if (players[j].subId == ids[1]) {
                players[j].partner = ids[0];
                players[j].teamIdx = index;
                players[j].teamid = teamid;
                players[j].inFoot = false;
                await db.setDataByItem(players[j]);
            }
        }
    }

    gameData.state.teamsReady = true;

    gameData.playOrder = [];
    for (var i = 0; i < teams[0].playerIds.length; i++) {
        for (var j = 0, ct = teams.length; j < ct; j++) {
            var team = teams[j];
            gameData.playOrder.push(team.playerIds[i]);
        }
    }
    await db.setDataByItem(gameData);

    return teams;
}

exports.getOverview = async (gameId) => {
    var rslt = {};
    var teams = await db.getFilteredData(gameId, "t-");
    for (var i=0,ct=teams.length; i<ct; i++) {
        var team = teams[i];
        var cardCt = [];
        var names = [];
        var inFoot = [];
        for (var pIdx=0,pCt=team.playerIds.length; pIdx<pCt; pIdx++) {
            var p = await player.get(gameId, team.playerIds[pIdx]);
            //console.log(p);
            if (p.hasOwnProperty("hand")) {
                cardCt.push(p.hand.length);
            } else {
                cardCt.push(0);
            }
            names.push(p.name);
            inFoot.push(p.inFoot ? p.subId : "");
        }
        rslt[team.subId] = {
            cardCt: cardCt,
            ids: team.playerIds,
            index: team.index,
            inFoot: inFoot,
            melded: team.melded,
            names: names,
            played: {},
            score: team.score,
            subId: team.subId
        };
        for (var cardName in team.cards) {
            rslt[team.subId].played[cardName] = {"clean":0, "wild":0};
            for (c=0,cct=team.cards[cardName].length; c<cct; c++) {
                var card = team.cards[cardName][c];
                if (card.name == "2" || (card.name == "J" && card.suit == null)) {
                    if (cardName == "W") {
                        rslt[team.subId].played[cardName].clean++;
                    } else {
                        rslt[team.subId].played[cardName].wild++
                    }
                } else {
                    rslt[team.subId].played[cardName].clean++;
                }
            }
        }
    }
    return rslt;
}