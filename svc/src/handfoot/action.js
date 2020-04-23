const team = require("./team");
const game = require("./game");
const player = require("./player");

exports.doAction = async eventData => {
    var postDatas;
    switch (eventData.action) {
        case "keepalive":
            postDatas = module.exports.keepalive(eventData);
            break;
        case "_GET_DATA_":
            postDatas = await module.exports._GET_DATA_(eventData);
            break;
        case "_SET_DATA_":
            postDatas = await module.exports._SET_DATA_(eventData);
            break;
        case "_GET_GAMES_":
            postDatas = await module.exports._GET_GAMES_(eventData);
            break;
        case "_DELETE_GAME_":
            postDatas = await module.exports._DELETE_GAME_(eventData);
            break;
        case "_SNAPSHOT_":
            postDatas = await module.exports._SNAPSHOT_(eventData);
            break;
        case "getPlayers":
            postDatas = await module.exports.getPlayers(eventData);
            break;
        case "getPlayer":
            postDatas = await module.exports.getPlayer(eventData);
            break;
        case "deletePlayer":
            postDatas = await module.exports.deletePlayer(eventData);
            break;
        case "getState":
            postDatas = await module.exports.getState(eventData);
            break;
        case "getScores":
            postDatas = await module.exports.getScores(eventData);
            break;
        case "shuffle":
            postDatas = await module.exports.shuffle(eventData);
            break;
        case "deal":
            postDatas = await module.exports.deal(eventData);
            break;
        case "draw":
            postDatas = await module.exports.draw(eventData);
            break;
        case "reorder":
            postDatas = await module.exports.reorder(eventData);
            break;
        case "discard":
            postDatas = await module.exports.discard(eventData);
            break;
        case "play":
            postDatas = await module.exports.play(eventData);
            break;
        case "saveTeams":
            postDatas = await module.exports.saveTeams(eventData);
            break;
        case "getTeams":
            postDatas = await module.exports.getTeams(eventData);
            break;
        case "updateScores":
            postDatas = await module.exports.updateScores(eventData);
            break;
        default:
            //await db.setDataByItem({"gameId":gameId, "subId":"switch", "data":eventData.action + " invalid"});
            throw ("Action value was invalid");
    }
    return postDatas;
}

exports._DELETE_GAME_ = async eventData => {
    await game.deleteGameData(eventData.value);
    return [{ "info": "_game_deleted_", "to": "all", "data": eventData.value + " DELETED!" }];
}

exports._GET_DATA_ = async eventData => {
    var d = await game.getGameData(eventData.game);
    return [{ "info": "_all_data_", "to": "all", "data": d }];
}

exports._GET_GAMES_ = async eventData => {
    var games = await game.getGames();
    return [{ "info": "_games_", "to": "all", "data": games }];
}

exports._SET_DATA_ = async eventData => {
    await game.setGameData(eventData.value);
    return [{ "info": "_set_data_", "to": "all", "data": "DONE" }];
}

exports._SNAPSHOT_ = async eventData => {
    var n = await game.createSnapshot(eventData.value);
    return [{ "info": "_snapshot_", "to": "all", "data": n.toString() }];
}

exports.deal = async eventData => {
    var hand = await player.deal(eventData.game, eventData.userid);
    var rslt = [{ "info": "playerHand", "to": eventData.userid, "data": hand }];
    var state = await game.getState(eventData.game);
    rslt.push({ "info": "state", "to": "all", "data": state });
    return rslt;
}

exports.discard = async eventData => {
    var hand = await player.discard(eventData.game, eventData.userid, eventData.value);
    var postDatas = [{ "info": "playerHand", "to": eventData.userid, "data": hand }];
    var state = await game.getState(eventData.game);
    if (state.playerOut != null) {
        console.log("Player out so updating scores!");
        postDatas = await module.exports.updateScores(eventData);
    } else {
        postDatas.push({ "info": "state", "to": "all", "data": state });
    }
    return postDatas;
}

exports.draw = async eventData => {
    var hand = await player.draw(eventData.game, eventData.userid);
    var postDatas = [{ "info": "playerHand", "to": eventData.userid, "data": hand }];
    var state = await game.getState(eventData.game);
    postDatas.push({ "info": "state", "to": "all", "data": state });
    return postDatas;
}

exports.getPlayer = async eventData => {
    var p = await player.get(eventData.game, eventData.userid);
    return [{ "info": "playerInfo", "to": eventData.userid, "data": p }];
}

exports.getPlayers = async eventData => {
    var names = await player.getAllNames(eventData.game);
    return [{ "info": "players", "to": "all", "data": names }];
}

exports.deletePlayer = async eventData => {
    player.delete(eventData.game, eventData.value);
    return [{ "info": "didDelete", "to": eventData.userid, "data": "DELETED: " + eventData.value }];
}

exports.getState = async eventData => {
    var state = await game.getState(eventData.game);
    return [{ "info": "state", "to": eventData.userid, "data": state }];
}

exports.getScores = async eventData => {
    var scores = await game.getScores(eventData.game);
    return [{ "info": "scores", "to": eventData.userid, "data": scores }];
}

exports.getTeams = async eventData => {
    var teams = await team.getAll(eventData.game);
    return [{ "info": "teams", "to": eventData.userid, "data": teams }];
}

exports.keepalive = eventData => {
    return [{ "info": "keepalive", "to": eventData.userid, "data": "true" }];
}

exports.play = async eventData => {
    var p = await player.play(eventData.game, eventData.userid, eventData.value)
    var postDatas = [{ "info": "playerInfo", "to": eventData.userid, "data": p }];
    // var t = await team.getByPlayer(eventData.game, eventData.userid);
    // postDatas.push({ "info": "team", "to": "all", "data": t });
    var state = await game.getState(eventData.game);
    postDatas.push({ "info": "state", "to": "all", "data": state });
    return postDatas;
}

exports.reorder = async eventData => {
    var hand = await player.reorder(eventData.game, eventData.userid, eventData.value);
    return [{ "info": "playerHand", "to": eventData.userid, "data": hand }];
}

exports.saveTeams = async eventData => {
    var teams = await team.save(eventData.game, eventData.value);
    //var postDatas = [{ "info": "teams", "to": "all", "data": teams }];
    //var state = await game.getState(eventData.game);
    //postDatas.push({ "info": "state", "to": "all", "data": state });
    var postDatas = await module.exports.shuffle(eventData);
    return postDatas;
}

exports.shuffle = async eventData => {
    await game.shuffle(eventData.game);
    var state = await game.getState(eventData.game);
    return [{ "info": "state", "to": "all", "data": state }];
}

exports.updateScores = async eventData => {
    await game.updateScores(eventData.game);
    var players = await player.getAll(eventData.game);
    var postDatas = [];
    for (var i = 0, ct = players.length; i < ct; i++) {
        postDatas.push({ "info": "playerInfo", "to": players[i].userid, "data": player });
    }
    //var teams = await team.getAll(eventData.game);
    //postDatas.push({ "info": "teams", "to": "all", "data": teams });
    //var state = await game.getState(eventData.game);
    await game.shuffle(eventData.game);
    var state = await game.getState(eventData.game);
    postDatas.push({ "info": "state", "to": "all", "data": state });
    return postDatas;
}
