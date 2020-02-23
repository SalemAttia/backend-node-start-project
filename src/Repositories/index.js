'use strict';

const mongoose = require('mongoose');
const{ TodoSchema } = require('../Schemas');
const BaseRepository = require('./BaseRepository');

module.exports = {
    TodoRepository: new BaseRepository(mongoose.model('Todo', TodoSchema), 'todo'),
    BaseRepository,
};
