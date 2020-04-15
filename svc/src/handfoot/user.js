const db = require("./db");

exports.createUserData = async (gameId, userId, connectionId, name) => {
    /** Creating base user data */
    var userData = await db.getData(gameId, userId);
    if (Object.keys(userData).length === 0) {
        userData = {
            "gameId": gameId,
            "subId": userId
        };
    }
    userData.connectionId = connectionId;
    if (typeof name != "undefined") {
        userData.name = name;
    }
    await db.setDataByItem(userData);
}