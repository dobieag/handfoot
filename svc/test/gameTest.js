const game = require("../src/handfoot/game");
const team = require("../src/handfoot/team");
const db = require("../src/handfoot/db");
const player = require("../src/handfoot/player");

async function doTest() {
    // var gameId = "123-456";
    // var userId = "p-765-432";
    // var connectionId = "12341723472314";
    // var name;
    // var action = "start";

    // await game.connect(gameId, userId, connectionId, name, action);
    // name = "Bob";
    // await game.connect(gameId, userId, connectionId, name);

    // var tables = await game.getGameData(gameId);
    // console.log(tables);

    // var data = await game.getState(gameId);
    // console.log(data);

    var eventData, postDatas;
    // var eventData = {"message":"doaction","game":"123-456","userid":"o-24d-7db","action":"saveTeams","value":[{"index":0,"teamid":"t-dbd-1b0","ids":[{"index":0,"id":"p-6af-aff"},{"index":1,"id":"p-28f-aa9"}]}]};
    // var teams = await team.save(eventData.game, eventData.value);
    // postDatas = [{ "info": "teams", "to": "all", "data": teams }];
    // var state = await game.getState(eventData.game);
    // postDatas.push({ "info": "state", "to": "all", "data": state });
    // console.log(postDatas);

    //eventData = {"message":"doaction","game":"debug","action":"_DELETE_GAME_","value":"123-456"};
    //await game.deleteGameData(eventData.value);

    /** CREATE SNAPSHOT */
    // var gameId = "8d3-a4b";
    // eventData = { "message": "doaction", "game": "debug", "action": "_SNAPSHOT_", "value": gameId };
    // var n = await game.createSnapshot(eventData.value);
    // console.log(n);

    /** GET SNAPSHOT DATA */
    // var d = await db.getData(gameId, n.toString());
    // console.log(JSON.stringify(d.data));

    /** SET GAME DATA */
    // var d ;
    // await game.setGameData(d);

    /** DISCARD */
    // eventData = { "message": "doaction", "game": "308-1d9", "userid": "p-707-6ba", "action": "discard", "value": { "name": "5", "id": 84, "suit": "C" } };
    // var hand = await player.discard(eventData.game, eventData.userid, eventData.value);
    // //console.log(hand);
    // postDatas = [{ "info": "playerHand", "to": eventData.userid, "data": hand }];
    // var state = await game.getState(eventData.game);
    // console.log(state);
    // if (state.playerOut == null) {
    //     //console.log("player NOT out");
    //     var t = await team.getByPlayer(eventData.game, eventData.userid);
    //     postDatas.push({ "info": "team", "to": "all", "data": t });
    // } else {
    //     //console.log("player IS out");
    //     postDatas.push({ "info": "state", "to": "all", "data": state });
    // }
    // //console.log(postDatas);



    /** SET GAME DATA */
    // d = [{ "gameId": "123-456", "subId": "tables", "tables": ["tables", "123-456", "o-4d5-1ea", "p-869-5b6", "p-995-09f", "t-a07-60a"] }, { "subId": "123-456", "gameId": "123-456", "drawPile": [{ "name": "A", "id": 0, "suit": "H" }, { "name": "10", "id": 89, "suit": "C" }, { "name": "10", "id": 143, "suit": "C" }, { "name": "4", "id": 29, "suit": "C" }, { "name": "J", "id": 53, "suit": null }, { "name": "Q", "id": 145, "suit": "C" }, { "name": "5", "id": 4, "suit": "H" }, { "name": "A", "id": 67, "suit": "D" }, { "name": "6", "id": 72, "suit": "D" }, { "name": "A", "id": 108, "suit": "H" }, { "name": "J", "id": 107, "suit": null }, { "name": "A", "id": 54, "suit": "H" }, { "name": "10", "id": 156, "suit": "S" }, { "name": "Q", "id": 78, "suit": "D" }, { "name": "9", "id": 129, "suit": "D" }, { "name": "2", "id": 14, "suit": "D" }, { "name": "J", "id": 131, "suit": "D" }, { "name": "10", "id": 48, "suit": "S" }, { "name": "Q", "id": 65, "suit": "H" }, { "name": "7", "id": 60, "suit": "H" }, { "name": "J", "id": 77, "suit": "D" }, { "name": "2", "id": 40, "suit": "S" }, { "name": "J", "id": 10, "suit": "H" }, { "name": "8", "id": 128, "suit": "D" }, { "name": "A", "id": 80, "suit": "C" }, { "name": "K", "id": 159, "suit": "S" }, { "name": "8", "id": 61, "suit": "H" }, { "name": "A", "id": 39, "suit": "S" }, { "name": "6", "id": 5, "suit": "H" }, { "name": "7", "id": 99, "suit": "S" }, { "name": "Q", "id": 132, "suit": "D" }, { "name": "A", "id": 13, "suit": "D" }, { "name": "7", "id": 114, "suit": "H" }, { "name": "7", "id": 6, "suit": "H" }, { "name": "Q", "id": 11, "suit": "H" }, { "name": "5", "id": 43, "suit": "S" }, { "name": "Q", "id": 50, "suit": "S" }, { "name": "4", "id": 57, "suit": "H" }, { "name": "8", "id": 74, "suit": "D" }, { "name": "8", "id": 20, "suit": "D" }, { "name": "J", "id": 160, "suit": null }, { "name": "6", "id": 85, "suit": "C" }, { "name": "K", "id": 92, "suit": "C" }, { "name": "K", "id": 25, "suit": "D" }, { "name": "2", "id": 94, "suit": "S" }, { "name": "J", "id": 23, "suit": "D" }, { "name": "3", "id": 41, "suit": "S" }, { "name": "10", "id": 102, "suit": "S" }, { "name": "J", "id": 157, "suit": "S" }, { "name": "9", "id": 101, "suit": "S" }, { "name": "4", "id": 42, "suit": "S" }, { "name": "2", "id": 1, "suit": "H" }, { "name": "10", "id": 117, "suit": "H" }, { "name": "A", "id": 147, "suit": "S" }, { "name": "6", "id": 152, "suit": "S" }, { "name": "6", "id": 98, "suit": "S" }, { "name": "3", "id": 69, "suit": "D" }, { "name": "J", "id": 36, "suit": "C" }, { "name": "K", "id": 120, "suit": "H" }, { "name": "7", "id": 32, "suit": "C" }, { "name": "4", "id": 137, "suit": "C" }, { "name": "8", "id": 115, "suit": "H" }, { "name": "J", "id": 52, "suit": null }, { "name": "6", "id": 139, "suit": "C" }, { "name": "J", "id": 144, "suit": "C" }, { "name": "4", "id": 70, "suit": "D" }, { "name": "A", "id": 121, "suit": "D" }, { "name": "5", "id": 97, "suit": "S" }, { "name": "6", "id": 113, "suit": "H" }, { "name": "J", "id": 64, "suit": "H" }, { "name": "10", "id": 63, "suit": "H" }, { "name": "8", "id": 46, "suit": "S" }, { "name": "3", "id": 28, "suit": "C" }, { "name": "6", "id": 31, "suit": "C" }], "state": { "activePlayerName": "Mark", "firstPlayer": "p-869-5b6", "ready": true, "playerOut": "p-869-5b6", "shuffled": true, "activePlayer": "p-869-5b6", "teamsReady": true, "activePlayerInFoot": true }, "created": 1586110960581, "playOrder": ["p-869-5b6", "p-995-09f"] }, { "gameId": "123-456", "subId": "o-4d5-1ea", "connectionId": "KiKizelkiYcAbeQ=" }, { "subId": "p-869-5b6", "gameId": "123-456", "partner": "p-995-09f", "teamIdx": 0, "teamid": "t-a07-60a", "name": "Mark", "connectionId": "KiKhhelWCYcAbeQ=", "foot": [], "didDraw": false, "inFoot": true, "hand": [] }, { "subId": "p-995-09f", "gameId": "123-456", "partner": "p-869-5b6", "teamIdx": 0, "teamid": "t-a07-60a", "name": "Bob", "connectionId": "KiKiFeL8CYcCIlw=", "foot": [], "didDraw": false, "inFoot": true, "hand": [{ "name": "Q", "id": 158, "suit": "S" }, { "name": "Q", "id": 24, "suit": "D" }] }, { "subId": "t-a07-60a", "gameId": "123-456", "score": 0, "cards": { "4": { "played": [{ "name": "4", "id": 111, "suit": "H" }, { "name": "4", "id": 150, "suit": "S" }, { "name": "2", "id": 55, "suit": "H" }, { "name": "4", "id": 96, "suit": "S" }, { "name": "4", "id": 3, "suit": "H" }, { "name": "4", "id": 124, "suit": "D" }, { "name": "4", "id": 16, "suit": "D" }, { "name": "4", "id": 83, "suit": "C" }], "staged": [] }, "5": { "played": [{ "name": "5", "id": 125, "suit": "D" }, { "name": "5", "id": 151, "suit": "S" }, { "name": "5", "id": 84, "suit": "C" }, { "name": "5", "id": 138, "suit": "C" }, { "name": "5", "id": 112, "suit": "H" }, { "name": "5", "id": 17, "suit": "D" }, { "name": "5", "id": 58, "suit": "H" }, { "name": "5", "id": 30, "suit": "C" }, { "name": "5", "id": 71, "suit": "D" }], "staged": [] }, "6": { "played": [{ "name": "6", "id": 126, "suit": "D" }, { "name": "6", "id": 44, "suit": "S" }, { "name": "6", "id": 59, "suit": "H" }], "staged": [] }, "7": { "played": [{ "name": "7", "id": 153, "suit": "S" }, { "name": "7", "id": 86, "suit": "C" }, { "name": "7", "id": 19, "suit": "D" }, { "name": "7", "id": 45, "suit": "S" }, { "name": "7", "id": 127, "suit": "D" }, { "name": "7", "id": 140, "suit": "C" }, { "name": "J", "id": 106, "suit": null }], "staged": [] }, "8": { "played": [{ "name": "8", "id": 33, "suit": "C" }, { "name": "8", "id": 87, "suit": "C" }, { "name": "2", "id": 148, "suit": "S" }], "staged": [] }, "9": { "played": [{ "name": "9", "id": 47, "suit": "S" }, { "name": "9", "id": 8, "suit": "H" }, { "name": "9", "id": 21, "suit": "D" }, { "name": "9", "id": 88, "suit": "C" }, { "name": "9", "id": 34, "suit": "C" }, { "name": "9", "id": 62, "suit": "H" }, { "name": "9", "id": 142, "suit": "C" }, { "name": "9", "id": 75, "suit": "D" }, { "name": "9", "id": 116, "suit": "H" }, { "name": "9", "id": 155, "suit": "S" }], "staged": [] }, "10": { "played": [{ "name": "10", "id": 9, "suit": "H" }, { "name": "10", "id": 130, "suit": "D" }, { "name": "2", "id": 135, "suit": "C" }, { "name": "10", "id": 22, "suit": "D" }, { "name": "10", "id": 35, "suit": "C" }, { "name": "2", "id": 122, "suit": "D" }, { "name": "2", "id": 81, "suit": "C" }, { "name": "10", "id": 76, "suit": "D" }], "staged": [] }, "Q": { "played": [{ "name": "Q", "id": 37, "suit": "C" }, { "name": "Q", "id": 104, "suit": "S" }, { "name": "J", "id": 161, "suit": null }], "staged": [] }, "A": { "played": [{ "name": "A", "id": 26, "suit": "C" }, { "name": "A", "id": 93, "suit": "S" }, { "name": "2", "id": 109, "suit": "H" }, { "name": "A", "id": 134, "suit": "C" }, { "name": "2", "id": 68, "suit": "D" }], "staged": [] }, "W": { "played": [], "staged": [] }, "J": { "played": [], "staged": [] }, "K": { "played": [{ "name": "K", "id": 133, "suit": "D" }, { "name": "K", "id": 38, "suit": "C" }, { "name": "2", "id": 27, "suit": "C" }, { "name": "K", "id": 66, "suit": "H" }, { "name": "K", "id": 79, "suit": "D" }, { "name": "K", "id": 105, "suit": "S" }, { "name": "K", "id": 51, "suit": "S" }, { "name": "K", "id": 146, "suit": "C" }, { "name": "K", "id": 12, "suit": "H" }], "staged": [] } }, "scores": [], "index": 0, "cardCt": [0, 2], "playerNames": ["Mark", "Bob"], "playerIds": ["p-869-5b6", "p-995-09f"], "melded": true, "inFoot": ["p-995-09f", "p-869-5b6"] }];
    // await game.setGameData(d);

    /** UPDATE SCORES */
    // eventData = { "message": "doaction", "game": "123-456", "userid": "p-869-5b6", "action": "updateScores", "value": null };
    // await game.updateScores(eventData.game);
    // var players = await player.getAll(eventData.game);
    // postDatas = [];
    // for (var i = 0, ct = players.length; i < ct; i++) {
    //     postDatas.push({ "info": "playerInfo", "to": players[i].userid, "data": player });
    // }
    // var teams = await team.getAll(eventData.game);
    // postDatas.push({ "info": "teams", "to": "all", "data": teams });
    // var state = await game.getState(eventData.game);
    // postDatas.push({ "info": "state", "to": "all", "data": state });


    // eventData = { "message": "doaction", "game": "123-456", "userid": "p-bee-c94", "action": "play", "value": { "4": { "played": [], "staged": [] }, "5": { "played": [{ "name": "5", "id": 125, "suit": "D" }, { "name": "5", "id": 138, "suit": "C" }, { "name": "5", "id": 4, "suit": "H" }], "staged": [] }, "6": { "played": [], "staged": [] }, "7": { "played": [], "staged": [] }, "8": { "played": [{ "name": "8", "id": 115, "suit": "H" }, { "name": "8", "id": 87, "suit": "C" }, { "name": "2", "id": 81, "suit": "C" }], "staged": [] }, "9": { "played": [], "staged": [] }, "10": { "played": [], "staged": [] }, "Q": { "played": [], "staged": [] }, "A": { "played": [{ "name": "A", "id": 134, "suit": "C" }, { "name": "A", "id": 93, "suit": "S" }, { "name": "A", "id": 54, "suit": "H" }], "staged": [] }, "W": { "played": [], "staged": [] }, "J": { "played": [], "staged": [{ "name": "J", "id": 77, "suit": "D" }, { "name": "J", "id": 157, "suit": "S" }, { "name": "J", "id": 36, "suit": "C" }] }, "K": { "played": [], "staged": [] } } };
    // var hand = await player.play(eventData.game, eventData.userid, eventData.value)
    // postDatas = [{ "info": "playerHand", "to": eventData.userid, "data": hand }];
    // var t = await team.getByPlayer(eventData.game, eventData.userid);
    // postDatas.push({ "info": "team", "to": "all", "data": t });
    // console.log(postDatas);

    // eventData = { "message": "doaction", "game": "debug", "action": "_GET_GAMES_" };
    // var games = await game.getGames();
    // postDatas = [{ "info": "_games_", "to": "all", "data": games }];
    // console.log(postDatas);

    // eventData = { "message": "doaction", "game": "debug", "userid": "o-debug", "action": "_DELETE_GAME_", "value": "123-456" };
    // await game.deleteGameData(eventData.value);
    // postDatas = [{ "info": "_game_deleted_", "to": "all", "data": eventData.value + " DELETED!" }];
    // console.log(postDatas);

    // eventData = { "message": "doaction", "game": "fa0-6b7", "userid": "p-c9e-0bd", "action": "saveTeams", "value": [{ "index": 0, "teamid": "t-ab7-bf1", "ids": [{ "index": 0, "id": "p-c9e-0bd" }] }, { "index": 1, "teamid": "t-1a9-09b", "ids": [{ "index": 0, "id": "p-cd8-d0d" }] }] };
    // var teams = await team.save(eventData.game, eventData.value);
    // postDatas = [{ "info": "teams", "to": "all", "data": teams }];
    // var state = await game.getState(eventData.game);
    // postDatas.push({ "info": "state", "to": "all", "data": state });

    // wss://l6xhw95zuk.execute-api.us-east-2.amazonaws.com/Prod?game=48b-697&action=test
    var gameId = "8d3-a4b";
    var userId;
    var connectionId;
    var name;
    var action = "test";
    //await game.connect(gameId, userId, connectionId, name, action);
    // await game.shuffle(gameId);
    console.log(await game.getState(gameId));
}

doTest();