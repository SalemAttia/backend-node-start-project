'use strict';

const container = require('../container');

const seed = async() => {
    const todos = require('./DataBaseSeed/todo');
    const promises = [];    
    const todoRepository = await container['todo.repository'];
    
    todos.forEach(item => {
        promises.push(todoRepository.create(item));
    });
    
    return Promise.all(promises);
};

module.exports = seed()
    .then(services =>  { 
        console.log(services);
        console.log('data seeded successfully');
    });
