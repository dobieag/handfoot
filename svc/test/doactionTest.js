const TEST = require('../src/doaction')

async function doTest() {
    await TEST.handler({"requestContext":{"domain":"asdf", "stage":"fdsa"}, "body":'{"message":"doaction","game":"102-822","userid":"p-929-784","action":"getPlayers"}'})
}

doTest();