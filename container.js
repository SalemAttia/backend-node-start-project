'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connection = require('./connection');

const{ TodoRepository } = require('./src').Repositories;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const healthCheck = require('./src/Routes').healthCheck(app);
const todoRoutes = require('./src/Routes').todo(app);

const dbConnection = async() => {
    const mongoose = await connection();
    return mongoose.connection.db;
};

module.exports =  {
    'database.connection': dbConnection(),
    'todo.repository': TodoRepository,
    'todo.routes': todoRoutes,
    'app.healthCheck': healthCheck,
    'express.app': app,
};
