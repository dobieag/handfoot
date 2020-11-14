const action = require("../src/handfoot/action");
const db = require("../src/handfoot/db");

async function doTest() {
    var gameId = "053-687";

    //await action.shuffle({"game":gameId});
    //console.log("SHUFFLED");
    
    /* *
    setTimeout(async function(){
        await action.deal({"game":gameId, "userid":"p-771-517"});
    }, 500);
    setTimeout(async function(){
        await action.deal({"game":gameId, "userid":"p-885-239"});
    }, 2500);
    setTimeout(async function(){
        await action.deal({"game":gameId, "userid":"p-610-729"});
    }, 2500);
    setTimeout(async function(){
        await action.deal({"game":gameId, "userid":"p-517-825"});
        console.log("DONE Dealing");
    }, 2500);
    /* */

    //var snapData = await action._SNAPSHOT_({"value":gameId});
    //console.log("Snapshot ID: " + snapData[0].data);

    await action._RESTORE_SNAPSHOT_({"game":gameId, "snapId":"1605388500454"});
    console.log("Done restoring");
}

doTest();