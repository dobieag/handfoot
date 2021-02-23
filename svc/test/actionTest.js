const action = require("../src/handfoot/action");
const db = require("../src/handfoot/db");

async function doDealTest() {
    var gameId = "379-819";

    // await action.shuffle({"game":gameId});
    // console.log("SHUFFLED");
    
    /* */
    await action._RESTORE_SNAPSHOT_({"game":gameId, "snapId":"1614057019572"});
    console.log("Done restoring");

    await action.deal({"game":gameId, "userid":"p-651-177"});
    await action.deal({"game":gameId, "userid":"p-982-487"});
    await action.deal({"game":gameId, "userid":"p-776-085"});
    await action.deal({"game":gameId, "userid":"p-771-186"});
    console.log("DONE Dealing");

    console.log("p-651-177 Drawing ...");
    await action.draw({"game":gameId, "userid":"p-651-177"});
    console.log("p-651-177 Done Drawing");

    console.log("p-651-177 Discarding ...");
    await action.discard({"game":gameId, "userid":"p-651-177","value":{"name":"7","id":153,"suit":"S","idx":16}});
    console.log("p-651-177 Done Discarding");

    console.log("p-982-487 Drawing ...");
    await action.draw({"game":gameId, "userid":"p-982-487"});
    console.log("p-982-487 Done Drawing");

    console.log("p-982-487 Discarding ...");
    await action.discard({"game":gameId, "userid":"p-982-487","value":{"name":"5","id":30,"suit":"C","idx":91}});
    console.log("p-982-487 Done Discarding");
    
    console.log("p-776-085 Drawing ...");
    await action.draw({"game":gameId, "userid":"p-776-085"});
    console.log("p-776-085 Done Drawing");

    console.log("p-776-085 Discarding ...");
    action.discard({"game":gameId, "userid":"p-776-085","value":{"name":"6","id":72,"suit":"D","idx":92}});
    console.log("p-776-085 Done Discarding");
    
    console.log("p-771-186 Drawing ...");
    action.draw({"game":gameId, "userid":"p-771-186"});
    console.log("p-771-186 Done Drawing");

    /* */


    // var snapData = await action._SNAPSHOT_({"value":gameId});
    // console.log("Snapshot ID: " + snapData[0].data);

    //await action._RESTORE_SNAPSHOT_({"game":gameId, "snapId":"1605396058395"});
    //console.log("Done restoring");

    /* *
    await action._RESTORE_SNAPSHOT_({"game":gameId, "snapId":"1605396058395"});
    console.log("Done restoring");
    setTimeout(async function(){
        await action.discard({"game":gameId, "userid":"p-517-825", value:{"name":"5","id":166,"suit":"H","idx":83}}); // Discards 5H
    }, 500);
    setTimeout(async function(){
        await action.draw({"game":gameId, "userid":"p-610-729"});  // gets a 9S 4S
    }, 500);
    /* */
}

doDealTest();

