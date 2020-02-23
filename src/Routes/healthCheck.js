'use strict';

const appPackage = require('../../package.json');

module.exports = app => {
    app.get('/', (req, res) => res.send(
        { ok: true, data: { status: 'running', app_version: appPackage.version } },
    ));
};
