const AWS = require('aws-sdk');
const db = require("./handfoot/db");
const action = require("./handfoot/action");
const game = require("./handfoot/game");

exports.handler = async event => {
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });
  
  const eventData = JSON.parse(event.body);
  /** VALIDATE message data required values **/
  if (typeof eventData.game === "undefined") {
    throw ("Game not specified!");
  } else if (typeof eventData.action === "undefined") {
    throw ("Action not specified!");
  }
  //db.setDataByItem({gameId:eventData.game, subId:"EVENT", data:event});

  /** VALIDATE that the eventData.game specefied exists **/
  var gameData = await db.getData(eventData.game, eventData.game);
  if (Object.keys(gameData).length === 0) {
    throw ("Game: " + eventData.game + " does not exist");
  }

  var connections = await game.getConnections(eventData.game);
  
  var debugCalls = [];
  for (var i=0,ct=connections.length; i<ct; i++) {
    var conn = connections[i];
    if (conn.subId == "o-debug") {
      try {
        var p = apigwManagementApi.postToConnection({ ConnectionId: conn.connectionId, Data: JSON.stringify({time:Date.now(), data:eventData}) }).promise();
        debugCalls.push(p);
      } catch (e) {
        // ignore stale debug connections
      }
    }
  };
  console.log(debugCalls);
  /** Send all messages */
  try {
    await Promise.all(debugCalls);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  try {
    var postDatas = await action.doAction(eventData);
  } catch (e) {
    var errorCalls = [];
    for (var i=0,ct=connections.length; i<ct; i++) {
      var conn = connections[i];
      if (conn.subId == "o-debug") {
        try {
          var p = apigwManagementApi.postToConnection({ ConnectionId: conn.connectionId, Data: JSON.stringify({time:Date.now(), data:"There was an error"}) }).promise();
          errorCalls.push(p);
        } catch (err) {
          // ignore stale debug connections
        }
      }
    };
    // console.log(errorCalls);
    try {
      await Promise.all(errorCalls);
    } catch (err2) {
      // return { statusCode: 500, body: e.stack };
    }
  }

  const postCalls = connections.map(async (conn) => {
    for (var pIdx = 0, pCt = postDatas.length; pIdx < pCt; pIdx++) {
      var postData = postDatas[pIdx];
      try {
        var connectionId = conn.connectionId;
        if (postData.to === "all" || postData.to == conn.subId) {
          // console.log("POSTING DATA:", postData);
          await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(postData) }).promise();
        }
      } catch (e) {
        // IGNORE STALE DEBUG CONNECTIONS
        // console.log("ERROR POSTING DATA TO: " + connectionId);
        // if (e.statusCode === 410) {
        //   console.log(`Found stale connection, deleting ${connectionId}`);
        // } else {
        //   throw e;
        // }
      }
    }
  });
  console.log(postCalls);
  /** Send all messages */
  try {
    await Promise.all(postCalls);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  return { statusCode: 200, body: 'Data sent.' };
};

