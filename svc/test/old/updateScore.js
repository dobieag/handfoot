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
    if (card.name == "J") {
      return 50;
    } else if (card.name == "3") {
      if (isFoot) {
        if (card.suit == "H" || card.suit == "D") {
          return 300;
        } else return 100;
      } else {
        if (card.suit == "H" || card.suit == "D") {
          return 100;
        } else return 5;
      }
    } else {
      if (["8","9","10","J","Q","K"].indexOf(card.name) > -1) return 10;
      else if (card.name == "2" || card.name == "A") return 20;
      else return 5;
    }
  };

  var teams = await getTeams(gameId);
  for (var tIdx=0,tCt=teams.length; tIdx<tCt; tIdx++) {
    var team = teams[tIdx];
    var scoreLog = {"round":team.scores.length + 1, "scores":[]};
    team.scores.push(scoreLog);
    var handScore = 0;
    for (var key in team.cards) {
      var card = team.cards[key];
      var clean = true;
      for (var i=0,ct=card.played.length; i<ct; i++) {
        var c = card.played[i];
        if ((c.name == "2" || c.name == "J") && key != "W") { // Otherwise the wild book is going to always mark as dirty
          clean = false;
        }
      }
      if (card.played.length >= 7) {
        if (key == "W") handScore += 1500;  // wild book is another 1000
        else if (clean) handScore += 500;
        else if (!clean) handScore += 300;
      }
    }
    scoreLog.scores.push({"type":"base", "score":handScore});
    team.score += handScore;
    
    for (var key in team.cards) {
      var card = team.cards[key];
      for (var i=0,ct=card.played.length; i<ct; i++) {
        var c = card.played[i];
        handScore += cardScore(c, false);
      }
      /** Clean out the remaining cards so they don't get rescored if UpdateScores is called again */
      card.played = [];
      card.staged = [];
    }
    scoreLog.scores.push({"type":"playedCards", "score":handScore});
    team.score += handScore;
    

    for (var i=0,ct=team.playerIds.length; i<ct; i++) {
      var player = await getData(gameId, team.playerIds[i]);
      var negScore = 0;
      if (player.hasOwnProperty("hand")) {
        for (var j=0,jct=player.hand.length; j<jct; j++) {
          negScore -= cardScore(player.hand[j], false);
        }
      }
      if (player.hasOwnProperty("foot")) {
        for (var j=0,jct=player.foot.length; j<jct; j++) {
          negScore -= cardScore(player.foot[j], true);
        }
      }
      scoreLog.scores.push({"type":"hand_and_foot-" + player.name, "score":negScore});
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
      ////await setDataByItem(player);

      rslt.push({"info":"playerInfo", "to":player.userid, "data":pData});
      rslt.push({"info":"team", "to":player.userid, "data":team});
    }
    team.inFoot = [];
    team.melded = false;
    ////await setDataByItem(team);

    rslt.push({"info":"team", "to":"table", "data":team})
    console.log("SCORE LOG:", scoreLog);
  }
  
  var gameData = await getData(gameId, gameId);
  gameData.state.activePlayer = null;
  gameData.state.activePlayerName = null;
  gameData.state.activePlayerInFoot = false;
  gameData.state.playerOut = null;
  gameData.state.ready = false;
  gameData.state.shuffled = false;
  ////await setDataByItem(gameData);
  rslt.push({"info":"state", "to":"all", "data":gameData.state});
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
  
  
    async function getTeams(gameId) {
      var teams = await getFilteredData(gameId, "t-");
      return teams.Items;
    }
    
  
  async function setData(data) {
      //console.log(data);
      await ddb.put(data).promise();
  }
  
  async function setDataByItem(item) {
    await setData({Item:item, TableName:'handfoot'})
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
  


  async function doTest(){
    var gameId = "0f3-8b9";
    
    var data = await doAction_UpdateScores(gameId);
    //console.log(data);
  }
  
  doTest();