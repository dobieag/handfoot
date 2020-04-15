// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'us-east-2'});

// Create DynamoDB service object
//var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region:"us-east-2" });

  async function setGameData(data) {
    for (var i=0,ct=data.length; i<ct; i++) {
      setDataByItem(data[i]);
    }
  }

  async function setDataByItem(item) {
    await setData({Item:item, TableName:'handfoot'});
  }

  async function setData(data) {
    await ddb.put(data).promise();
  }

  async function doTest(){
    var gameId = "e19-d2c";
    
    var data = await setGameData([{"created":1585843980684,"subId":"71c-0ff","gameId":"71c-0ff","drawPile":["5H","7S","QS","KC","7D","JS","KD","3S","5H","5S","8D","KD","2D","9H","9S","KC","10S","AD","KH","AS","J","6S","KH","AD","7S","AH","10C","4D","QH","QD","6D","J","10C","2C","9C","KH","10D","9D","4D","2S","3D","QD","KS","QS","QC","3S","4C","QC","AC","AS","8D","3D","7H","2H","4S","4H","QH","5C","AS","9S","5H","J","10C","8H","8S","JH","2H","7S","2C","9C","8S","JS","5C","3H","KC","3C","2D","8H","5D","9C","2C","AH","3D","JH","9H","J","8C","6D","4S","AD","10S","7C","J","QS","AH","4C","J","3C","5S","9D","7D","6H","9H","10D","4C","QH","JD","6D"],"state":{"activePlayerName":"Bob","firstPlayer":"p-b85-e13","ready":true,"playerOut":"p-b85-e13","shuffled":true,"activePlayer":"p-2a6-00d","teamsReady":true},"playOrder":["p-b85-e13","p-2a6-00d"]},{"gameId":"71c-0ff","connectionId":"KXjpAfukCYcCHKQ=","subId":"o-4bc-673"},{"gameId":"71c-0ff","connectionId":"KXlBeciTiYcCJZw=","subId":"o-4bc-674"},{"foot":[],"inFoot":true,"teamIdx":0,"connectionId":"KXkWGdw5CYcCFAQ=","partner":"p-b85-e13","subId":"p-2a6-00d","teamid":"t-012-3a2","didDraw":false,"gameId":"71c-0ff","name":"Bob","hand":["2S"]},{"foot":[],"inFoot":true,"teamIdx":0,"connectionId":"KXkVXdRhCYcCFuw=","partner":"p-2a6-00d","subId":"p-b85-e13","teamid":"t-012-3a2","didDraw":false,"gameId":"71c-0ff","name":"Mark","hand":[]},{"cardCt":[0,1],"index":0,"playerIds":["p-b85-e13","p-2a6-00d"],"inFoot":["p-2a6-00d","p-b85-e13"],"cards":{"4":{"played":["4H","4S","4H","4D"],"staged":[]},"5":{"played":["5D","5S","5C","5D"],"staged":[]},"6":{"played":["6S","6H","6C","6C","6H","6C","6S"],"staged":[]},"7":{"played":["7D","7H","7H","7C","7C"],"staged":[]},"8":{"played":["8C","8D","8H","8S","8C"],"staged":[]},"9":{"played":["9S","9D"],"staged":[]},"10":{"played":["10H","10H","10H","10D","10S"],"staged":[]},"Q":{"played":["QD","QC"],"staged":[]},"A":{"played":["AC","AC"],"staged":[]},"W":{"played":[],"staged":[]},"J":{"played":["JC","JD","JD","JS","2S","2D","JC","JH","2H"],"staged":[]},"K":{"played":["KS","KD","KS"],"staged":[]}},"scores":[],"playerNames":["Mark","Bob"],"melded":true,"score":0,"subId":"t-012-3a2","gameId":"71c-0ff"}]);
    console.log(data);
  }
  
  doTest();