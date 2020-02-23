'use strict';

module.exports = {
    mongodb: {
        url: process.env.MONGODB_URL,
        collections: {
            todo: 'todo',
        },
    },
};
