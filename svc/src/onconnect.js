// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const game = require("./handfoot/game");
const db = require("./handfoot/db");

exports.handler = async event => {
  /** Checking on base game data and creating it if it doesn't exist */
  var gameId = event.queryStringParameters.game;
  if (event.queryStringParameters.hasOwnProperty("userid")) {
    var userId = event.queryStringParameters.userid;
  }
  if (event.queryStringParameters.hasOwnProperty("action")) {
    var action = event.queryStringParameters.action;
  }
  if (event.queryStringParameters.hasOwnProperty("name")) {
    var name = event.queryStringParameters.name;
  }
  var connectionId = event.requestContext.connectionId;
  
  //await db.setDataByItem({"gameId":gameId, "subId":"event", "data":event});
  
  try {
    await game.connect(gameId, userId, connectionId, name, action);
  } catch (e) {
    //await db.setDataByItem({"gameId":gameId, "subId":"error", "data":e});
    return { statusCode: 500, body: 'Failed to connect to game: ' + JSON.stringify(e) };
  }

  //await db.setDataByItem({"gameId":gameId, "subId":"info", "data":"completed onconnect.handler"});
  
  return { statusCode: 200, body: "Connected: " + gameId };
};