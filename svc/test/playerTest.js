const player = require("../src/handfoot/player");
const game = require("../src/handfoot/game");
const action = require("../src/handfoot/action");

async function doTest() {
    var gameId = "123-456";
    var userId = "p-6af-aff";
    var connectionId = "12341723472314";
    var name;
    var eventData;

    //await db.setDataByItem({"gameId":gameId, "subId":"event", "data":"some data goes here"});
    // var players = await player.getAllNames(gameId);
    // console.log("PLAYERS: ", players);

    // var p = await player.get(gameId, userId);
    // console.log("PLAYER", p);

    /** DISCARD */
    // eventData = { "message": "doaction", "game": "123-456", "userid": "p-e98-af0", "action": "discard", "value": { "name": "3", "id": 136, "suit": "C" } };
    // var hand = await player.discard(eventData.game, eventData.userid, eventData.value);
    // postDatas = [{ "info": "playerHand", "to": eventData.userid, "data": hand }];
    // var state = await game.getState(eventData.game);
    // if (state.playerOut = null) {
    //     var t = await team.getByPlayer(eventData.game, eventData.userid);
    //     postDatas.push({ "info": "team", "to": "all", "data": t });
    // } else {
    //     postDatas.push({ "info": "state", "to": "all", "data": state });
    // }
    // console.log("postDatas: ", postDatas);

    /** REORDER */
    // eventData = {"message":"doaction","game":"123-456","userid":"p-869-5b6","action":"reorder","value":[{"name":"4","id":96,"suit":"S"},{"name":"5","id":151,"suit":"S"},{"name":"5","id":84,"suit":"C"},{"name":"5","id":138,"suit":"C"},{"name":"5","id":125,"suit":"D"},{"name":"8","id":7,"suit":"H"},{"name":"9","id":34,"suit":"C"},{"name":"10","id":9,"suit":"H"},{"name":"J","id":118,"suit":"H"},{"name":"Q","id":91,"suit":"C"},{"name":"3","id":15,"suit":"D"},{"name":"K","id":66,"suit":"H"},{"name":"3","id":95,"suit":"S"}]}
    // var hand = await player.reorder(eventData.game, eventData.userid, eventData.value);
    // postDatas = [{ "info": "playerHand", "to": eventData.userid, "data": hand }];
    // console.log(postDatas);

    // var evt = {"message":"doaction","game":{},"userid":"p-861-317","action":"getPlayers"};
    // var datas = await action.doAction(evt);
    // console.log(datas);

    var evt = {"message":"doaction","game":"488-190","userid":"p-755-613","action":"play","value":{"4":[{"name":"2","id":122,"suit":"D","idx":44}],"5":[],"6":[],"7":[],"8":[],"9":[],"10":[],"J":[],"Q":[],"K":[],"A":[],"W":[]}};
    var datas = await action.doAction(evt);
    console.log(datas);
}

doTest();