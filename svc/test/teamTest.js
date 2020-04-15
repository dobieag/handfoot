const game = require("../src/handfoot/game");
const team = require("../src/handfoot/team");

async function doTest() {
    var gameId = "123-456";
    var userId = "p-765-432";
    var connectionId = "12341723472314";
    var name;
    var action = "start";

    var eventData = {"message":"doaction","game":"123-456","userid":"o-24d-7db","action":"getTeams"};
    var teams = await team.getAll(eventData.game);
    console.log(teams);
}

doTest();