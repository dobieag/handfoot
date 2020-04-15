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
                "4": { "played": [] },
                "5": { "played": [] },
                "6": { "played": [] },
                "7": { "played": [] },
                "8": { "played": [] },
                "9": { "played": [] },
                "10": { "played": [] },
                "J": { "played": [] },
                "Q": { "played": [] },
                "K": { "played": [] },
                "A": { "played": [] },
                "W": { "played": [] }
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

        gameData.state.teams[teamid] = {
            "played":{
                "4":null,
                "5":null,
                "6":null,
                "7":null,
                "8":null,
                "9":null,
                "10":null,
                "J":null,
                "K":null,
                "Q":null,
                "A":null,
                "W":null
            },
            subId: teamid,
            cardCt: cardCt,
            ids: ids,
            melded: false,
            names: names,
            index: index,
            score: 0,
            inFoot: []
        };
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

