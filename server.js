/* istanbul ignore file */
'use strict';

const container = require('./container');
const port = process.env.PORT || 4040;

try {
    const expressApp = container['express.app'];
    expressApp.listen(port);
    console.log(`listening on port ${port}`);
} catch(error) {
    console.log('ERROR BOOTING APP:', error);
}
