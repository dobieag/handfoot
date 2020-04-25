// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({ region: 'us-east-2' });
if (!process.env.hasOwnProperty("TABLE_NAME")) {
  process.env.TABLE_NAME = "handfoot";
}
// Create DynamoDB service object
const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: "us-east-2" });

exports.getData = async (gameId, subId) => {
  var getParams = {
    Key: {
      gameId: gameId,
      subId: subId
    },
    TableName: process.env.TABLE_NAME
  };

  try {
    var data = await ddb.get(getParams).promise();
  } catch (err) {
    console.log(err);
    return { statusCode: 500, body: 'Unable to get gameData: ' + JSON.stringify(err) };
  }
  if (data.hasOwnProperty("Item"))
    return data.Item;
  else
    return data;
};

exports.setDataByItem = async (item) => {
  await module.exports.setData({ Item: item, TableName: process.env.TABLE_NAME });
};

exports.setData = async (data) => {
  //if (data.Item.gameId != "debug") {
  await ddb.put(data).promise();
  //}
}

/** GET FILTERED DATA */
exports.getFilteredData = async (gameId, name) => {
  var rslt = [];
  var tables = await module.exports.getData(gameId, "tables");
  //console.log("TABLES", tables);
  if (tables.hasOwnProperty("tables")) {
    for (var i = 0, ct = tables.tables.length; i < ct; i++) {
      if (tables.tables[i].indexOf(name) > -1) {
        rslt.push(await module.exports.getData(gameId, tables.tables[i]));
      }
    }
  }
  return rslt;
}

exports.delete = async (params) => {
  await ddb.delete(params).promise();
}

exports.deleteData = async (gameId, subId) => {
  var params = {
    TableName: process.env.TABLE_NAME,
    FilterExpression: "#gi = :gameId",
    Key: {
      "gameId": gameId,
      "subId": subId
    }
  };
  await module.exports.delete(params);
}