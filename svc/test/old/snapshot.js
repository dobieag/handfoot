// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'us-east-2'});

// Create DynamoDB service object
//var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region:"us-east-2" });

  async function snapshot(eventData) {
    var d = await getGameData(eventData.game);
    var n = Date.now();
    await setData({Item:{"gameId":eventData.game, "subId":n.toString(), "data":d}, TableName:"handfoot"});
  }

  async function getGameData(gameId) {
    var params = {
      TableName : "handfoot",
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

  async function setData(data) {
    await ddb.put(data).promise();
  }

  async function doTest(){
    var gameId = "19c-ad7";
    
    await snapshot({"game":gameId});
  }
  
  doTest();