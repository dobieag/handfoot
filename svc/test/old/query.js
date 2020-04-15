// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'us-east-2'});

// Create DynamoDB service object
//var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region:"us-east-2" });

async function doAction_UpdateScores(gameId) {
  var rslt = [];
  var cardScore = function(card, isFoot) {
    if (card == "J") {
      return 50;
    } else if (card.charAt(0) == 3) {
      if (isFoot) {
        if (card.charAt(1) == "H" || card.charAt(1) == "D") {
          return 300;
        } else return 100;
      } else {
        if (card.charAt(1) == "H" || card.charAt(1) == "D") {
          return 100;
        } else return 5;
      }
    } else {
      card = card.substring(0, card.length-1); // strip off suit
      if (["8","9","10","J","Q","K"].indexOf(card) > -1) return 10;
      else if (card == "2") return 20;
      else return 5;
    }
  };

  var teams = await getTeams(gameId);
  teams.map(async (team) => {
    var handScore = 0;
    for (var key in team.cards) {
      var card = team.cards[key];
      var clean = true;
      for (var i=0,ct=card.played.length; i<ct; i++) {
        var c = card.played[i];
        handScore += cardScore(c, false);
        if ((c.charAt(0) == "2" || c == "J") && card != "W") { // The wild book is going to always mark as dirty
          clean = false;
        }
      }
      if (card.played.length >= 7) {
        if (card == "W") handScore += 1500;  // wild book is another 1000
        else if (clean) handScore += 500;
        else if (!clean) handScore += 300;
      }
      /** Clean out the remaining cards so they don't get rescored if UpdateScores is called again */
      card.played = [];
      card.staged = [];
    }
    team.scores.push(handScore);
    team.score += handScore;
    team.inFoot = [];
    await setDataByItem(team);
    rslt.push({"info":"team", "to":"table", "data":team})
  });

  var players = await getPlayers(gameId);
  players.map(async (player) => {
    if (player.userid != "table" && player.hasOwnProperty("teamid")) {
      console.log("PLAYER: ", player);
      var team = await getData(gameId, player.teamid);
      console.log("TEAM: ", team);

      var negScore = 0;
      if (player.hasOwnProperty("hand")) {
        for (var i=0,ct=player.hand.length; i<ct; i++) {
          negScore -= cardScore(player.hand[i], false);
        }
      }
      if (player.hasOwnProperty("foot")) {
        for (var i=0,ct=player.foot.length; i<ct; i++) {
          negScore -= cardScore(player.foot[i], true);
        }
      }
      
      team.scores.push(negScore);
      team.score += negScore;
      delete player["hand"];
      delete player["foot"];
      player.inFoot = false;

      var pData = {};
      for (var attrib in player){
        if (attrib != "foot") {
          pData[attrib] = player[attrib];
        }
      }
      await setDataByItem(team);
      await setDataByItem(player);

      rslt.push({"info":"playerInfo", "to":player.userid, "data":pData});
      rslt.push({"info":"team", "to":player.userid, "data":team});
    }
  });

  var gameData = await getData(gameId, gameId);
  gameData.state.activePlayer = null;
  gameData.state.playerOut = null;
  gameData.state.ready = false;
  gameData.state.shuffled = false;
  await setDataByItem(gameData);
  rslt.push({"info":"state", "to":"all", "data":gameData.state});
  return rslt;
}


async function doAction_Play(gameid, userid, cards) {
  var rslt = [], partnerId;
  //await ddb.put({TableName: process.env.TABLE_NAME,Item: {gameName: "_LOG_",_info_: {"msg":"doAction_Play called", "gameData":gameData, "userid":userid, "cards":cards}}}).promise();
  //try{
    var log = "";
    var p = await getData(gameid, userid);
    console.log(p);
    var t = await getData(gameid, p.teamid);
    t.melded = true;
    for (var key in cards) {
      console.log(key);
      for (var c=0,cct=cards[key].staged.length; c<cct; c++) {
        var card = cards[key].staged[c];
        t.cards[key].played.push(card);
        p.hand.splice( p.hand.indexOf(card), 1);
        log += "Switched card to played: " + card + "\n";
      }
    }
    if (p.hand.length == 0) {
      p.hand = p.foot;
      p.foot = [];
      p.inFoot = true;
      t.inFoot.push(p.subId);
    }
    rslt.push({"info":"team", "to":p.partner, "data":t});
    //await ddb.put({TableName: process.env.TABLE_NAME,Item: {gameName: "_LOG_",_info_: {"msg":"Looped through players", "data":log}}}).promise();
  //} catch (e) {
    //return([{"info":"error", "to":"all", "data":e}]);
    //await ddb.put({TableName: process.env.TABLE_NAME,Item: {gameName: "ERROR",_info_: e}}).promise();
  //}
  rslt.push({"info":"team", "to":userid, "data":t});
  rslt.push({"info":"team", "to":"table", "data":t});
  rslt.push({"info":"playerHand", "to":userid, "data":p.hand});
  return rslt;
}

async function doAction_SaveTeams(gameid, teamList) {
  var rslt = [];
  var teams = [];
  var players = await getPlayers(gameid);
  for (var i=0,ct=teamList.length; i<ct; i++) {
    var index = teamList[i].index;
    var teamid = teamList[i].teamid;
    var names = teamList[i].names;
    try{
      var team = {
        "gameId":gameid,
        "subId":teamid,
        "score":0,
        "scores":[],
        "melded":false,
        "inFoot":[],
        "names":names,
        "index":index,
        "cards":{
          "4":{"played":[]},
          "5":{"played":[]},
          "6":{"played":[]},
          "7":{"played":[]},
          "8":{"played":[]},
          "9":{"played":[]},
          "10":{"played":[]},
          "J":{"played":[]},
          "Q":{"played":[]},
          "K":{"played":[]},
          "A":{"played":[]},
          "W":{"played":[]}
        }
      };
      teams.push(team);
      await setDataByItem(team);
      for (var j=0,jct=players.length; j<jct; j++) {
        if (players[j].name == names[0]) {
          players[j].partner = names[1];
          players[j].teamIdx = index;
          players[j].teamid = teamid;
          players[j].inFoot = false;
          await setDataByItem(players[j]);
        }
        if (players[j].name == names[1]) {
          players[j].partner = names[0];
          players[j].teamIdx = index;
          players[j].teamid = teamid;
          players[j].inFoot = false;
          await setDataByItem(players[j]);
        }
      }
    } catch (e) {
      return [{"info":"error", "to":"all", "data":"Unable to put names onto teams list."}];
    }
  }

  var gameData = await getData(gameid, gameid);
  gameData.Item.state.teamsReady = true;
  rslt.push({"info":"state", "to":"all", "data":gameData.Item.state});

  try {
    gameData.Item.playOrder = [];
    for (var i=0; i<2; i++) {
      for (var j=0,ct=teams.length; j<ct; j++) {
        var team = teams[j];
        gameData.Item.playOrder.push(team.names[i]);
      }
    }
    await setDataByItem(gameData.Item);
  } catch(e) {
    return [{"info":"error", "to":"all", "data":"Error building playOrder"}];
  }
  rslt.push({"info":"teams", "to":"all", "data":teams});
  return rslt;
}

async function getData(gameId, subId) {
  var getParams = {
    Key: {
      gameId: gameId,
      subId: subId
    },
    TableName: 'handfoot'
  };
  
  try {
    var data = await ddb.get(getParams).promise();
  } catch (err) {
    return { statusCode: 500, body: 'Unable to get gameData: ' + JSON.stringify(err) };
  }
  if (data.hasOwnProperty("Item"))
    return data.Item;
  else
    return data;
}

  async function getPlayers(gameId) {
    var players = await getFilteredData(gameId, "p-");
    return players.Items;
  }

  async function getTeams(gameId) {
    var teams = await getFilteredData(gameId, "t-");
    return teams.Items;
  }
  

async function setData(data) {
    console.log(data);
    await ddb.put(data).promise();
}

async function setDataByItem(item) {
  await setData({Item:item, TableName:'handfoot'})
}

async function getGameData(gameId) {
    var params = {
      TableName :  'handfoot',
      FilterExpression: "#gi = :gameId",
      ExpressionAttributeNames:{
          "#gi": "gameId"
      },
      ExpressionAttributeValues: {
          ":gameId": gameId
      }
    };
    var data = await ddb.scan(params).promise();
    return data;
}

async function getFilteredData(gameId, name) {
    //try {
      var params = {
        TableName :  'handfoot',
        FilterExpression: "#gi = :gameId and contains (#si, :name)",
        ExpressionAttributeNames:{
            "#gi": "gameId",
            "#si": "subId"
        },
        ExpressionAttributeValues: {
            ":gameId": gameId,
            ":name": name
        }
      };
      var data = await ddb.scan(params).promise();
    //} catch(err) {
        //await setData({Item:{"gameId":"msg", "subId":"error", "details":'Unable to get userData: ' + JSON.stringify(err)}, TableName:'handfoot'});
    //}
    return data;
  }

  async function doAction_GetPlayer(gameid, userid) {
    var rslt = [];
    var player = await getData(gameid, userid);
    //await setData({Item:{"gameId":"msg", "subId":"info", "details":'Found Player: ' + JSON.stringify(player)}, TableName:process.env.TABLE_NAME});
    //await setData({Item:{"gameId":"msg", "subId":"info", "details":"gameid:" + gameid + "   userid:" + userid}, TableName:process.env.TABLE_NAME});
    var pData = {};
    for (var attrib in player.Item){
      if (attrib != "foot") {
        pData[attrib] = player.Item[attrib];
      }
    }
    rslt.push({"info":"playerInfo", "to":userid, "data":pData});
    //rslt.push({"info":"state", "to":userid, "data":gameData.state});
    return rslt;
  }

  async function doAction_GetPlayers(gameId) {
    let names = [];
    var players = await getFilteredData(gameId, "p-");
    console.log(players);
    //await setData({Item:{"gameId":"msg", "subId":"info", "details":'Found Players: ' + JSON.stringify(players)}, TableName:process.env.TABLE_NAME});
    for (let i=0,ct=players.Items.length; i<ct; i++) {
      let p = players.Items[i];

      if (p.hasOwnProperty("name")) {
        names.push(p.name);
      }
    }
    //await setData({Item:{"gameId":"msg", "subId":"info", "details":'Found Names: ' + JSON.stringify(names)}, TableName:process.env.TABLE_NAME});
    return [{"info":"players", "to":"all", "data":names}];
  }

async function doTest(){
  var gameId = "123-456";
  var userId = "p-654-321";

  var data = await doAction_UpdateScores(gameId);
  console.log(data);
  return;

  var data = await doAction_Play(gameId, "p-09d-aee", {"4":{"played":[],"staged":["4S","4S"]},"5":{"played":[],"staged":["5D","5C"]},"6":{"played":[],"staged":[]},"7":{"played":[],"staged":["7C"]},"8":{"played":[],"staged":[]},"9":{"played":[],"staged":["9H"]},"10":{"played":[],"staged":["10D"]},"Q":{"played":[],"staged":[]},"A":{"played":[],"staged":["AC","J","2S","AD","AC","AD"]},"W":{"played":[],"staged":[]},"J":{"played":[],"staged":[]},"K":{"played":[],"staged":["KH"]}});
  console.log(data);
  return;

  //var data = await doAction_SaveTeams(gameId, [{"index":0,"teamid":"t-dc9-231","names":["Bob","Mark"]}]);
  //console.log(data);
  //return;
  
  //var data = await doAction_GetPlayers(gameId);
  //console.log(data);
  //return;

  //var data = await getTeams(gameId);
  //console.log(data);
  //return;

  var data = await getData(gameId, gameId);
  data = await getData(gameId, userId);
  daat = await getData(gameId, "blah");
  console.log(data);
  return;

  //await setData({TableName:'handfoot', Item:{"gameId":"test", "subId":"subTest", "details":"hello world"}});
  
  var connections = await getFilteredData(gameId, "p-");
  connections = connections.Items;
  var observers = await getFilteredData(gameId, "o-");
  observers = observers.Items;
  
  for (var i=0,ct=observers.length; i<ct; i++) {
    connections.push(observers[i]);
  }
  //console.log(observers);
  console.log(connections);

  var allData = await getGameData(gameId);
  console.log("allData", allData);

  var player = await doAction_GetPlayer(gameId, userId);
  console.log("player: ", player);
}

doTest();
