const player = require("../src/handfoot/player");
const game = require("../src/handfoot/game");
const action = require("../src/handfoot/action");

async function doTest() {
    var gameId = "123-456";
    var userId = "p-6af-aff";
    var connectionId = "12341723472314";
    var name;
    var eventData;

    var evt = {"message":"doaction","game":"debug","userid":"o-debug","action":"_GET_GAMES_"};
    var datas = await action.doAction(evt);
    console.log(datas);
}

doTest();