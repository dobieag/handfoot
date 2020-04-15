// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'us-east-2'});
process.env.TABLE_NAME = "handfoot";

// Create DynamoDB service object
//var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region:"us-east-2" });

  async function getTableData(gameId, userId) {
    var tableData = await getData(gameId, "tables");
    if (Object.keys(tableData).length === 0) {
      tableData = {
        gameId: gameId,
        subId: "tables",
        tables: []
      }
    }
    if (tableData.tables.indexOf(userId) == -1) {
      tableData.tables.push(userId);
      setDataByItem(tableData);
    }
    return tableData;
  }

  async function doTest(){
    var gameId = "e19-d2c";
    var userId = "p-765-432";
    
    var data = await getTableData(gameId, userId);
    console.log("TABLE DATA:", data);
  }
  
  doTest();