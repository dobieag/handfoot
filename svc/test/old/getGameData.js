const dbg = require("../svc/handfoot/debug");

  async function doTest(){
    var gameId = "123-456";
    
    var data = await dbg.getGameData(gameId);
    console.log("NEW DATA:", data);
  }
  
  doTest();