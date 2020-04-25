const AWS = require('aws-sdk');
const db = require("./handfoot/db");
const action = require("./handfoot/action");
const game = require("./handfoot/game");

exports.handler = async event => {
  const eventData = JSON.parse(event.body);
  /** VALIDATE message data required values **/
  if (typeof eventData.game === "undefined") {
    throw ("Game not specified!");
  } else if (typeof eventData.action === "undefined") {
    throw ("Action not specified!");
  }

  /** VALIDATE that the eventData.game specefied exists **/
  var gameData = await db.getData(eventData.game, eventData.game);
  if (Object.keys(gameData).length === 0) {
    throw ("Game: " + eventData.game + " does not exist");
  }

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });

  var postDatas = await action.doAction(eventData);

  connections = await game.getConnections(eventData.game);
  for (var i=0,ct=connections.length; i<ct; i++) {
    if (connections[i].subId == "o-debug") {
      try {
        await apigwManagementApi.postToConnection({ ConnectionId: connections[i].connectionId, Data: JSON.stringify({time:Date.now(), data:eventData}) }).promise();
      } catch (e) {
        // ignore stale debug connections
      }
      break;
    }
  }
  const postCalls = connections.map(async (conn) => {
    for (var pIdx = 0, pCt = postDatas.length; pIdx < pCt; pIdx++) {
      var postData = postDatas[pIdx];
      try {
        var connectionId = conn.connectionId;
        if (postData.to === "all" || postData.to == conn.subId) {
          await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(postData) }).promise();
        }
      } catch (e) {
        if (e.statusCode === 410) {
          console.log(`Found stale connection, deleting ${connectionId}`);
        } else {
          throw e;
        }
      }
    }
  });

  /** Send all messages */
  try {
    await Promise.all(postCalls);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  return { statusCode: 200, body: 'Data sent.' };
};

