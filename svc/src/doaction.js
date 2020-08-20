const AWS = require('aws-sdk');
const db = require("./handfoot/db");
const action = require("./handfoot/action");
const game = require("./handfoot/game");

exports.handler = async event => {
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });
  
  //console.log("doaction.handler: " + JSON.stringify(event));
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
  
  const debugCalls = connections.map(async (conn) => {
    if (conn.subId == "o-debug") {
      try {
        await apigwManagementApi.postToConnection({ ConnectionId: conn.connectionId, Data: JSON.stringify({time:Date.now(), data:eventData}) }).promise();
      } catch (e) {
        // IGNORE STALE DEBUG CONNECTIONS
        //console.log("ERROR POSTING DATA TO: " + connectionId);
      }
    }
  });

  //console.log(JSON.stringify(debugCalls));
  /** Send all messages */
  try {
    //console.log("calling all debugCalls");
    await Promise.all(debugCalls);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }
  
  try {
    //console.log("calling action.doAction: " + JSON.stringify(eventData));
    var postDatas = await action.doAction(eventData);
  } catch (e) {
    const errorCalls = connections.map(async (conn) => {
      if (conn.subId == "o-debug") {
        try {
          await apigwManagementApi.postToConnection({ ConnectionId: conn.connectionId, Data: JSON.stringify({time:Date.now(), data:"There was an error"}) }).promise();
        } catch (e) {
          // IGNORE STALE DEBUG CONNECTIONS
          //console.log("ERROR POSTING DATA TO: " + connectionId);
        }
      }
    });

    // console.log(errorCalls);
    try {
      console.log("sending all errorCalls");
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
          //console.log("POSTING DATA:", JSON.stringify(postData));
          await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(postData) }).promise();
        }
      } catch (e) {
        // IGNORE STALE DEBUG CONNECTIONS
        //console.log("ERROR POSTING DATA TO: " + connectionId);
        // if (e.statusCode === 410) {
        //   console.log(`Found stale connection, deleting ${connectionId}`);
        // } else {
        //   throw e;
        // }
      }
    }
  });
  //console.log(JSON.stringify(postCalls));
  /** Send all messages */
  try {
    //console.log("sending all postCalls");
    await Promise.all(postCalls);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  return { statusCode: 200, body: 'Data sent.' };
};

