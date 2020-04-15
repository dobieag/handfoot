// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'us-east-2'});

// Create DynamoDB service object
//var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region:"us-east-2" });
process.env.TABLE_NAME = "handfoot";

async function doAction_Shuffle(gameid) {
  var gameData = await getData(gameid, gameid);
  var shuffle = function (array) {
		for (let i = array.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
		
			// swap elements array[i] and array[j]
			// we use "destructuring assignment" syntax to achieve that
			// you'll find more details about that syntax in later chapters
			// same can be written as:
			// let t = array[i]; array[i] = array[j]; array[j] = t
			[array[i], array[j]] = [array[j], array[i]];
		}
	}
	var suits = ["H","D","C","S"];   // Hearts, Diamonds, Clubs, Spades
	var cards = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];  // Ace, 2,3,4,5,6,7,8,9,10, Jack, Queen, King
  var drawPile = [];
  var id = 0;
	for (var d=0,dct=gameData.playOrder.length + 1; d<dct; d++) {
		for (var i=0,sct=suits.length; i<sct; i++) {
			for (var j=0,cct=cards.length; j<cct; j++) {
        drawPile.push({"id":id++, "name":cards[j], "suit":suits[i]});
			}
		}
		drawPile.push({"id":id++, "name":"J", "suit":null});
		drawPile.push({"id":id++, "name":"J", "suit":null});  // push two Jokers onto the deck
	}
  shuffle(drawPile);
  gameData.drawPile = drawPile;
  gameData.state.shuffled = true;
  if (gameData.state.firstPlayer == null) {
    gameData.state.firstPlayer = gameData.playOrder[0];
  } else {
    gameData.state.firstPlayer = gameData.playOrder[ (gameData.playOrder.indexOf(gameData.state.firstPlayer) + 1) % gameData.playOrder.length ];
  }
  //gameData.drawPile = [];
  //console.log(gameData);
  await setDataByItem(gameData);
  
	var players = await getPlayers(gameid);
  players.map(async (player) => {
    delete player["hand"];
    delete player["foot"];
    await setDataByItem(player);
  });

  return [{"info":"state", "to":"all", "data":gameData.state}];
}

async function getData(gameId, subId) {
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
    return { statusCode: 500, body: 'Unable to get gameData: ' + JSON.stringify(err) };
  }
  if (data.hasOwnProperty("Item"))
    return data.Item;
  else
    return data;
}

  async function setDataByItem(item) {
    await setData({Item:item, TableName:process.env.TABLE_NAME});
  }

  async function setData(data) {
    await ddb.put(data).promise();
  }

  async function getPlayers(gameId) {
    var players = await getFilteredData(gameId, "p-");
    return players;
  }

  async function getFilteredData(gameId, name) {
    var params = {
      TableName : process.env.TABLE_NAME,
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
    if (data.hasOwnProperty("Items"))
      return data.Items;
    else
      return data;
  }
  
  async function doTest(){
    var gameId = "123-456";
    
    var data = await doAction_Shuffle(gameId);
    console.log(data);
  }
  
  doTest();