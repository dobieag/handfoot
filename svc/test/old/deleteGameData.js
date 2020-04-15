// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'us-east-2'});

// Create DynamoDB service object
//var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region:"us-east-2" });

async function deleteGameData(gameId) {
  var gameData = await getGameData(gameId);
  
  for (var i=0,ct=gameData.Items.length; i<ct; i++) {
    var item = gameData.Items[i];
    var params = {
      TableName : "handfoot",
      FilterExpression: "#gi = :gameId",
      Key:{
        "gameId":gameId,
        "subId":item.subId
      }
    };
    await ddb.delete(params).promise();
  }

  var games = await getData("_GAMES_","_GAMES_");
  games.games.splice( games.games.indexOf(gameId), 1);
  await setDataByItem(games);
}

async function setDataByItem(item) {
  await setData({Item:item, TableName:"handfoot"});
}

async function setData(data) {
  await ddb.put(data).promise();
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

/** GET DATA */
async function getData(gameId, subId) {
  var getParams = {
    Key: {
      gameId: gameId,
      subId: subId
    },
    TableName: "handfoot"
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

  async function doTest(){
    var gameId = "19c-ad7";
    
    var data = await deleteGameData(gameId);
    console.log(data);
  }
  
  doTest();