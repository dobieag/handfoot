const action = require("../src/handfoot/action");

async function doTest() {
    var gameId = "163-119";
    //var data = await action.doAction({"message":"doaction","game":"163-119","userid":"p-398-660","action":"getState"});
    //console.log(JSON.stringify(data));
    var data = await action.doAction({"message":"doaction","game":"163-119","userid":"p-716-597","action":"saveTeams","value":[{"index":0,"teamid":"t-674-995","ids":[{"index":0,"id":"p-716-597"},{"index":1,"id":"p-477-782"}]},{"index":1,"teamid":"t-764-711","ids":[{"index":0,"id":"p-852-905"},{"index":1,"id":"p-398-660"}]}]});
    console.log(JSON.stringify(data));
    
    /*
    console.log("\nDealing: " + data[0].data.activeDealer);
    data = await action.doAction({"message":"doaction","game":"163-119","userid":data[0].data.activeDealer,"action":"deal"});
    console.log(JSON.stringify(data));

    console.log("\nDealing: " + data[1].data.activeDealer);
    data = await action.doAction({"message":"doaction","game":"163-119","userid":data[1].data.activeDealer,"action":"deal"});
    console.log(JSON.stringify(data));

    console.log("\nDealing: " + data[1].data.activeDealer);
    data = await action.doAction({"message":"doaction","game":"163-119","userid":data[1].data.activeDealer,"action":"deal"});
    console.log(JSON.stringify(data));

    console.log("\nDealing: " + data[1].data.activeDealer);
    data = await action.doAction({"message":"doaction","game":"163-119","userid":data[1].data.activeDealer,"action":"deal"});
    console.log(JSON.stringify(data));
    */
}

doTest();