const game = require("../src/handfoot/game");
const action = require("../src/handfoot/action");
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
    // var gameId = "629-198";
    // eventData = { "message": "doaction", "game": "debug", "action": "_SNAPSHOT_", "value": gameId };
    // var n = await game.createSnapshot(eventData.value);
    // console.log(n);

    /** GET SNAPSHOT DATA */
    // var d = await db.getData(gameId, n.toString());
    // console.log(JSON.stringify(d.data));
    // await db.deleteData(gameId, n.toString());
    
    /** SET GAME DATA */
    var d = [{"gameId":"629-198","subId":"tables","tables":["tables","629-198","p-707-212","p-857-780","t-555-129","t-281-393"]},{"subId":"629-198","gameId":"629-198","drawPile":[{"name":"6","id":98,"suit":"S","idx":48},{"name":"2","id":68,"suit":"D","idx":49},{"name":"J","id":103,"suit":"S","idx":50},{"name":"9","id":116,"suit":"H","idx":51},{"name":"J","id":157,"suit":"S","idx":52},{"name":"J","id":77,"suit":"D","idx":53},{"name":"2","id":27,"suit":"C","idx":54},{"name":"8","id":115,"suit":"H","idx":55},{"name":"6","id":152,"suit":"S","idx":56},{"name":"4","id":111,"suit":"H","idx":57},{"name":"2","id":81,"suit":"C","idx":58},{"name":"10","id":102,"suit":"S","idx":59},{"name":"10","id":22,"suit":"D","idx":60},{"name":"K","id":38,"suit":"C","idx":61},{"name":"K","id":12,"suit":"H","idx":62},{"name":"7","id":114,"suit":"H","idx":63},{"name":"K","id":105,"suit":"S","idx":64},{"name":"J","id":144,"suit":"C","idx":65},{"name":"10","id":48,"suit":"S","idx":66},{"name":"K","id":66,"suit":"H","idx":67},{"name":"Q","id":91,"suit":"C","idx":68},{"name":"K","id":92,"suit":"C","idx":69},{"name":"5","id":97,"suit":"S","idx":70},{"name":"5","id":4,"suit":"H","idx":71},{"name":"9","id":8,"suit":"H","idx":72},{"name":"8","id":7,"suit":"H","idx":73},{"name":"Q","id":50,"suit":"S","idx":74},{"name":"10","id":143,"suit":"C","idx":75},{"name":"6","id":31,"suit":"C","idx":76},{"name":"4","id":137,"suit":"C","idx":77},{"name":"8","id":20,"suit":"D","idx":78},{"name":"10","id":89,"suit":"C","idx":79},{"name":"K","id":133,"suit":"D","idx":80},{"name":"8","id":100,"suit":"S","idx":81},{"name":"8","id":74,"suit":"D","idx":82},{"name":"6","id":126,"suit":"D","idx":83},{"name":"J","id":131,"suit":"D","idx":84},{"name":"7","id":19,"suit":"D","idx":85},{"name":"J","id":90,"suit":"C","idx":86},{"name":"A","id":147,"suit":"S","idx":87},{"name":"9","id":75,"suit":"D","idx":88},{"name":"Q","id":119,"suit":"H","idx":89},{"name":"J","id":10,"suit":"H","idx":90},{"name":"J","id":106,"suit":null,"idx":91},{"name":"10","id":156,"suit":"S","idx":92},{"name":"Q","id":11,"suit":"H","idx":93},{"name":"3","id":95,"suit":"S","idx":94},{"name":"J","id":160,"suit":null,"idx":95},{"name":"2","id":148,"suit":"S","idx":96},{"name":"3","id":56,"suit":"H","idx":97},{"name":"K","id":120,"suit":"H","idx":98},{"name":"A","id":39,"suit":"S","idx":99},{"name":"9","id":129,"suit":"D","idx":100},{"name":"10","id":117,"suit":"H","idx":101},{"name":"A","id":13,"suit":"D","idx":102},{"name":"Q","id":104,"suit":"S","idx":103},{"name":"10","id":76,"suit":"D","idx":104},{"name":"7","id":45,"suit":"S","idx":105},{"name":"4","id":57,"suit":"H","idx":106},{"name":"J","id":107,"suit":null,"idx":107},{"name":"5","id":138,"suit":"C","idx":108},{"name":"K","id":146,"suit":"C","idx":109},{"name":"5","id":58,"suit":"H","idx":110},{"name":"5","id":84,"suit":"C","idx":111},{"name":"J","id":36,"suit":"C","idx":112},{"name":"Q","id":65,"suit":"H","idx":113},{"name":"7","id":153,"suit":"S","idx":114},{"name":"7","id":32,"suit":"C","idx":115},{"name":"4","id":3,"suit":"H","idx":116},{"name":"3","id":149,"suit":"S","idx":117},{"name":"Q","id":158,"suit":"S","idx":118},{"name":"Q","id":37,"suit":"C","idx":119},{"name":"7","id":60,"suit":"H","idx":120},{"name":"Q","id":78,"suit":"D","idx":121},{"name":"6","id":113,"suit":"H","idx":122},{"name":"J","id":161,"suit":null,"idx":123},{"name":"2","id":122,"suit":"D","idx":124},{"name":"4","id":29,"suit":"C","idx":125},{"name":"5","id":71,"suit":"D","idx":126},{"name":"2","id":135,"suit":"C","idx":127},{"name":"5","id":151,"suit":"S","idx":128},{"name":"A","id":26,"suit":"C","idx":129},{"name":"4","id":42,"suit":"S","idx":130},{"name":"5","id":112,"suit":"H","idx":131},{"name":"J","id":23,"suit":"D","idx":132},{"name":"9","id":88,"suit":"C","idx":133},{"name":"3","id":110,"suit":"H","idx":134},{"name":"4","id":16,"suit":"D","idx":135},{"name":"9","id":21,"suit":"D","idx":136},{"name":"6","id":18,"suit":"D","idx":137},{"name":"7","id":140,"suit":"C","idx":138},{"name":"J","id":118,"suit":"H","idx":139},{"name":"9","id":34,"suit":"C","idx":140},{"name":"7","id":73,"suit":"D","idx":141},{"name":"9","id":142,"suit":"C","idx":142},{"name":"3","id":41,"suit":"S","idx":143},{"name":"2","id":1,"suit":"H","idx":144},{"name":"A","id":0,"suit":"H","idx":145},{"name":"A","id":67,"suit":"D","idx":146},{"name":"8","id":141,"suit":"C","idx":147},{"name":"6","id":5,"suit":"H","idx":148},{"name":"7","id":99,"suit":"S","idx":149},{"name":"7","id":86,"suit":"C","idx":150},{"name":"4","id":70,"suit":"D","idx":151},{"name":"A","id":108,"suit":"H","idx":152},{"name":"6","id":59,"suit":"H","idx":153},{"name":"8","id":46,"suit":"S","idx":154},{"name":"3","id":69,"suit":"D","idx":155},{"name":"6","id":85,"suit":"C","idx":156},{"name":"A","id":121,"suit":"D","idx":157},{"name":"5","id":30,"suit":"C","idx":158},{"name":"3","id":136,"suit":"C","idx":159},{"name":"3","id":15,"suit":"D","idx":160},{"name":"5","id":43,"suit":"S","idx":161}],"state":{"activeDrawer":"p-707-212","firstPlayer":"p-707-212","teams":{},"lastDrawer":"p-707-212","didDeal":["p-707-212","p-857-780"],"ready":true,"playerOut":null,"drawIndex":0,"shuffled":true,"lastMessage":"Mark discarded 3D","activePlayer":{"name":"Bob","id":"p-857-780","inFoot":false},"teamsReady":true},"created":1587417298061,"playOrder":["p-707-212","p-857-780"]},{"subId":"p-707-212","gameId":"629-198","teamIdx":0,"teamid":"t-555-129","name":"Mark","connectionId":"LTeQ5f2PCYcCIJQ=","canDraw":false,"foot":[{"name":"J","id":49,"suit":"S","idx":1},{"name":"A","id":54,"suit":"H","idx":3},{"name":"7","id":6,"suit":"H","idx":5},{"name":"2","id":40,"suit":"S","idx":7},{"name":"8","id":33,"suit":"C","idx":9},{"name":"10","id":63,"suit":"H","idx":11},{"name":"4","id":83,"suit":"C","idx":13},{"name":"3","id":28,"suit":"C","idx":15},{"name":"J","id":52,"suit":null,"idx":17},{"name":"4","id":124,"suit":"D","idx":19},{"name":"K","id":159,"suit":"S","idx":21}],"didDraw":false,"inFoot":false,"hand":[{"name":"Q","id":132,"suit":"D","idx":0},{"name":"5","id":125,"suit":"D","idx":2},{"name":"A","id":93,"suit":"S","idx":4},{"name":"9","id":155,"suit":"S","idx":6},{"name":"6","id":72,"suit":"D","idx":8},{"name":"9","id":101,"suit":"S","idx":10},{"name":"J","id":64,"suit":"H","idx":14},{"name":"Q","id":24,"suit":"D","idx":16},{"name":"10","id":9,"suit":"H","idx":18},{"name":"5","id":17,"suit":"D","idx":20},{"name":"K","id":25,"suit":"D","idx":44},{"name":"6","id":44,"suit":"S","idx":45}]},{"subId":"p-857-780","gameId":"629-198","teamIdx":1,"teamid":"t-281-393","name":"Bob","connectionId":"LTedCeQlCYcCHKQ=","canDraw":false,"foot":[{"name":"10","id":130,"suit":"D","idx":23},{"name":"A","id":134,"suit":"C","idx":25},{"name":"2","id":94,"suit":"S","idx":27},{"name":"K","id":51,"suit":"S","idx":29},{"name":"2","id":55,"suit":"H","idx":31},{"name":"7","id":127,"suit":"D","idx":33},{"name":"3","id":82,"suit":"C","idx":35},{"name":"4","id":150,"suit":"S","idx":37},{"name":"6","id":139,"suit":"C","idx":39},{"name":"8","id":61,"suit":"H","idx":41},{"name":"J","id":53,"suit":null,"idx":43}],"didDraw":true,"inFoot":false,"hand":[{"name":"8","id":87,"suit":"C","idx":22},{"name":"10","id":35,"suit":"C","idx":24},{"name":"9","id":62,"suit":"H","idx":26},{"name":"9","id":47,"suit":"S","idx":28},{"name":"8","id":128,"suit":"D","idx":30},{"name":"4","id":96,"suit":"S","idx":32},{"name":"K","id":79,"suit":"D","idx":34},{"name":"Q","id":145,"suit":"C","idx":36},{"name":"8","id":154,"suit":"S","idx":38},{"name":"2","id":14,"suit":"D","idx":40},{"name":"A","id":80,"suit":"C","idx":42},{"name":"2","id":109,"suit":"H","idx":46},{"name":"3","id":2,"suit":"H","idx":47}]},{"subId":"t-555-129","gameId":"629-198","score":0,"cards":{"4":[],"5":[],"6":[],"7":[],"8":[],"9":[],"10":[],"Q":[],"A":[],"W":[],"J":[],"K":[]},"scores":[],"index":0,"cardCt":[12],"playerNames":["Mark"],"playerIds":["p-707-212"],"melded":false,"inFoot":[]},{"subId":"t-281-393","gameId":"629-198","score":0,"cards":{"4":[],"5":[],"6":[],"7":[],"8":[],"9":[],"10":[],"Q":[],"A":[],"W":[],"J":[],"K":[]},"scores":[],"index":1,"cardCt":[13],"playerNames":["Bob"],"playerIds":["p-857-780"],"melded":false,"inFoot":[]}];
    await game.setGameData(d);

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
    var gameId = "023-500";
    var userId;
    var connectionId;
    var name;
    //var action = "test";
    //await game.connect(gameId, userId, connectionId, name, action);
    // await game.shuffle(gameId);
    //console.log(await action.doAction({"message":"doaction","game":"023-500","userid":"p-281-974","action":"getScores"}));
    //await action.doAction({"message":"doaction", "game":"399-184", "userid":"p-248-660","action":"updateScores"});
}

doTest();