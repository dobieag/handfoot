const db = require("../src/handfoot/db");

async function doTest() {
    var gameId = "123-456";
    var userId = "p-765-432";
    var connectionId = "12341723472314";
    var name;
    var action = "start";

    //await db.setDataByItem({"gameId":gameId, "subId":"event", "data":"some data goes here"});
    var players = await db.getFilteredData(gameId, "p-");
    console.log("PLAYERS: ", players);

    var observers = await db.getFilteredData(gameId, "o-");
    console.log("OBSERVERS: ", observers);
    
    var connections = await db.getConnections(gameId);
    console.log("CONNECTIONS: ", connections);
}

doTest();