function doAction_UpdateScores(gameData) {
  var rslt = [];
  var cardScore = function(card, isFoot) {
    if (card == "J") {
      return 50;
    } else if (card.charAt(0) == 3) {
      if (isFoot) {
        if (card.charAt(1) == "H" || card.charAt(1) == "D") {
          return 300;
        } else return 100;
      } else {
        if (card.charAt(1) == "H" || card.charAt(1) == "D") {
          return 100;
        } else return 5;
      }
    } else {
      card = card.substring(0, card.length-1); // strip off suit
      if (["8","9","10","J","Q","K"].indexOf(card) > -1) return 10;
      else if (card == "2") return 20;
      else return 5;
    }
  };

  gameData.teams.map(team => {
    var handScore = 0;
    for (var key in team.cards) {
      var card = team.cards[key];
      var clean = true;
      for (var i=0,ct=card.played.length; i<ct; i++) {
        var c = card.played[i];
        handScore += cardScore(c, false);
        if ((c.charAt(0) == "2" || c == "J") && card != "W") { // The wild book is going to always mark as dirty
          clean = false;
        }
      }
      if (card.played.length >= 7) {
        if (card == "W") handScore += 1500;  // wild book is another 1000
        else if (clean) handScore += 500;
        else if (!clean) handScore += 300;
      }
      /** Clean out the remaining cards so they don't get rescored if UpdateScores is called again */
      card.played = [];
      card.staged = [];
    }
    team.scores.push(handScore);
    team.score += handScore;
    rslt.push({"info":"team", "to":"table", "data":team})
  });

  gameData.players.map(player => {
    var team = gameData.teams[player.teamIdx];
    var negScore = 0;
    if (player.userid != "table") {
      console.log(player.name);
      for (var i=0,ct=player.hand.length; i<ct; i++) {
        negScore -= cardScore(player.hand[i], false);
      }
      for (var i=0,ct=player.foot.length; i<ct; i++) {
        negScore -= cardScore(player.foot[i], true);
      }
      team.scores.push(negScore);
      team.score += negScore;
      player.hand = [];
      player.foot = [];
      player.inFoot = false;
    }
  });

  gameData.state.activePlayer = null;
  gameData.state.playerOut = null;
  gameData.state.ready = false;
  gameData.state.suffled = false;
  rslt.push({"info":"state", "to":"all", "data":gameData.state});
  return rslt;
}

//var data = {"gameName":"123-456","teams":[{"score":-1450,"cards":{"4":{"played":[],"staged":[]},"5":{"played":[],"staged":[]},"6":{"played":["6H"],"staged":[]},"7":{"played":[],"staged":[]},"8":{"played":[],"staged":[]},"9":{"played":["9D"],"staged":[]},"10":{"played":["10C","10H"],"staged":[]},"Q":{"played":["QH"],"staged":[]},"A":{"played":["AD"],"staged":[]},"W":{"played":[],"staged":[]},"J":{"played":[],"staged":[]},"K":{"played":[],"staged":[]}},"names":["asdf","qwer"],"scores":[115,-780,-505,520,0,-455,240,0,-585],"index":0,"melded":true,"inFoot":[]},{"score":-1090,"cards":{"4":{"played":["4C"],"staged":[]},"5":{"played":["5S","5C","5H","5C","2S","5D"],"staged":[]},"6":{"played":["6C","6S"],"staged":[]},"7":{"played":["7H","7C"],"staged":[]},"8":{"played":["8C","8C","8H","8H"],"staged":[]},"9":{"played":["9D"],"staged":[]},"10":{"played":["10H"],"staged":[]},"Q":{"played":["QD"],"staged":[]},"A":{"played":[],"staged":[]},"W":{"played":[],"staged":[]},"J":{"played":["JS","JH","JD","JH"],"staged":[]},"K":{"played":["KD"],"staged":[]}},"names":["fdsa","rewq"],"scores":[610,0,-570,0,-260,-230,0,-335,-305],"index":1,"melded":true,"inFoot":["rewq"]}],"players":[{"partner":"qwer","teamIdx":0,"name":"asdf","connectionId":"KRV0EetPiYcCI0w=","userid":"308-ee2","didDraw":false,"foot":["AC","3H","3C","2D","KH","6S","QC","6D","7S","KS","AS"],"inFoot":false,"hand":["J","9H","J","4D","3C","3H","3C","2C"]},{"partner":"rewq","teamIdx":1,"name":"fdsa","connectionId":"KRUDmfc4CYcCHzA=","userid":"40e-839","didDraw":false,"foot":["KD","QS","AD","QH","JC","2D","10D","9S","9D","AD","4D"],"inFoot":false,"hand":["3H","J","QC","9H","QC","4C","4C","AH","QD","6C","6C","8C"]},{"partner":"asdf","teamIdx":0,"name":"qwer","connectionId":"KRUGKeVZiYcCJZw=","userid":"7b1-5c3","didDraw":false,"foot":["JD","5D","2H","9S","8S","6D","4S","7C","7D","8C","AC"],"inFoot":false,"hand":["AD","2S","JS","KH","5D","3C","KD","8S","8D","4S"]},{"partner":"fdsa","teamIdx":1,"name":"rewq","connectionId":"KRUJCfl6CYcCFAQ=","userid":"696-25b","didDraw":false,"foot":[],"inFoot":true,"hand":[]},{"userid":"table","connectionId":"KRVlJf_NiYcCE0A="},{"userid":"table","connectionId":"KRVtXd4LiYcCE7g="}],"drawPile":["JD","10D","9C","10C","9D","7D","2D","2H","2C","8S","3D","9S","KD","10S","J","KC","7S","AH","3S","7C","KC","QD","6H","JH","2H","9S","6D","JH","7H","J","QS","KH","7H","KS","AH","5D","10S","7C","5H","8D","QS","3S","10H","3D","2C","2S","AC","9H","9H","AC","7C","7D","5H","10C","AD","5S","9D","10H","JC","KS","10S","2S","5S","6H","5H","4C","KH","QH","3C","QC","J","6C","6H","J","7D","4D","2D","7H","4H","2D","3H","JS","9C","5S","7H","KS","KC","AC","7S","JC","4C","5C","J","9C","10H","J","6D","10S","QD","AS","AS","4S","4S","5C","8H","4D","QC","4H","10C","10S","9C","8H","AS","KS","2H","9C","KC","6C","8H","QS","QS","10C","AH","10D","J","9H","JD","4H","QH","6S","2S","8S","10D","8D","3H","5D","10D","8D","4H","7D","7S","JS","3S","6D","8C","AH","4S","JC","6S","JC","3D","KD","QD","JH","9S","QH","7S","5S","8D","6H","JD","4D","2C","JS","2C","2H","5C","KC","3S","AS","4H","8S","6S","KH"],"state":{"shuffled":true,"activePlayer":"asdf","teamsReady":true,"ready":true,"playerOut":"rewq"},"playOrder":["asdf","fdsa","qwer","rewq"]};
//var rslt = doAction_UpdateScores(data);
//console.log(rslt[0].data.scores);

