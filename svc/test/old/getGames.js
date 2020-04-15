// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'us-east-2'});

// Create DynamoDB service object
//var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region:"us-east-2" });

  async function getGames(gameId) {
    var params = {
      TableName :  'handfoot',
      FilterExpression: "#gi = :gameId and #si = :gameId",
      ExpressionAttributeNames:{
          "#gi": "gameId",
          "#si": "subId"
      },
      ExpressionAttributeValues: {
          ":gameId": gameId
      }
    };
    var data = await ddb.scan(params).promise();
    return data;
  }

  async function doTest(){
    var gameId = "71c-0ff";
    
    var data = await getGames(gameId);
    console.log(data);
  }
  
  doTest();