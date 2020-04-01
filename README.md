# Node backend kick start project 👷

   Node backend kick start project in this project i implemented the basic setup for new node project
   including
   - clean code using eslint
   - test environment with adding the  most used packages
    for you to start write test case
   - dockerized your application
   - circleci configuration
   - Connection with mongodb


## 📔 installation 
```
* Clone Your the repo
- git clone https://github.com/SalemAttia/backend-node-start-project.git

* Install Your Packages
- npm install 

* Add Your Configuration 
- add your .env file

* Start Your Docker
- docker-compose up 

* Start Your Dev Server
- docker-compose exec node npm run start-dev

```

## 📔 Basic Command for test and lint 

```
* Run test
- docker-compose exec node npm run test

* Run Lint
- docker-compose exec node npm run lint
 
* Run your test and lint check
- docker-compose exec node npm run check

* Check Your packages updates
- docker-compose exec node npm run depcheck

```

## 📔 Used Packages 

- Main Packages
    - Express
    - lodash
    - body-parser
    - mongodb
    - mongoose
    - mongoose-paginate-v2
    - mongoose-unique-validator
    - cors

- Dev Packages
    - nodemon
    - mocha
    - chai
    - chai-as-promised
    - chai-subset
    - eslint
    - eslint-config-guardians-labs
    - npm-check
    - nyc
    - supertest
    - sinon

## 📔 Folder Structure 

- .circleci => ci configuration
- .github   => github pull request template
- settings
    - config.js => for any setting we want to add to our progect
- src
    - DataBaseSeed
    - Reposotories
    - Routes
    - Schemas
    - Services
    - dataSeed.js
- test
    - Reposotories
    - Resources
    - Routes
- connection.js => for db connection
- container.js  => small pool for all our routes and repositories, with all our connections
- server.js => our start here we start our server

## 📔 Createing Crud WorkFlow 

- lets Create Our Schema First you will find it in src/schema
- then we need to creat our Repository if you are okay with the basic crude operation and you don't need any extra logic you can just go to <b style="color:red">src/Repositories/index.js</b> 
and import your Schema and do like this one in the <b style="color:red">TodoRepository</b>
```javascript 
    'use strict';
    const mongoose = require('mongoose');
    const{ TodoSchema } = require('../Schemas');
    const BaseRepository = require('./BaseRepository');

    module.exports = {
        TodoRepository: new BaseRepository(mongoose.model('Todo', TodoSchema), 'todo'),
        BaseRepository,
    };
 ```
* Move To Your <strong style="color:red;">Route </strong> in <strong style="color:red;">Src</strong> Folder add todo.js
- Copy and past this code  
    ```javascript
        'use strict';

    const _  = require('lodash');
    const todoRepository = require('../Repositories').TodoRepository;
    const respond = require('./RequestRespons');

    const SERVICE_FIELDS = [
        '_id', 'name', 'name_ar', 'description',
        'created_at', 'updated_at', 'is_active',
    ];

    const HTTP_ERRORS = {
        missingId: id => `todo.missing_${id}`,
    };

    module.exports = app => {
        app.post('/todo.create', (req, res) => {
            const promise = todoRepository.create(req.body);
            return respond(promise, 101, 'todo').then(response => res.send(response));
        });

        app.get('/todo.info', (req, res) => {
            const options = _.pick(req.query, ['limit', 'page', 'sort']);
            const query = !_.isEmpty(req.query.q) ? JSON.parse(req.query.q) : {};
            let promise;
            if(_.isNil(req.query._id)) {
                promise = todoRepository.findAll(options, query);
            } else {
                promise = todoRepository.findById(req.query._id);
            }

            return respond(promise, 201, 'todo').then(response => res.send(response));
        });

        app.get('/todo.search', (req, res) => {
            const promise = todoRepository.find(req.query);
            return respond(promise, 201, 'todo').then(response => res.send(response));
        });

        app.post('/todo.update', (req, res) => {
            const service = _.pick(req.body, SERVICE_FIELDS);
            if(_.isNil(service._id)) {
                return res.send({
                    ok: false,
                    error: HTTP_ERRORS.missingId('id'),
                });
            }

            const promise = todoRepository.update(service);
            return respond(promise, 301, 'todo').then(response => res.send(response));
        });

        app.post('/todo.remove', (req, res) => {
            const service = _.pick(req.body, SERVICE_FIELDS);
            if(_.isNil(service._id)) {
                return res.send({
                    ok: false,
                    error: HTTP_ERRORS.missingId('id'),
                });
            }

            const promise = todoRepository.remove(service);
            return respond(promise, 401, 'todo').then(response => res.send(response));
        });

        app.post('/todo.restore', (req, res) => {
            const service = _.pick(req.body, SERVICE_FIELDS);
            if(_.isNil(service._id)) {
                return res.send({
                    ok: false,
                    error: HTTP_ERRORS.missingId('id'),
                });
            }

            const promise = todoRepository.restore(service);
            return respond(promise, 401, 'todo').then(response => res.send(response));
        });
    };


    ```

- No Your Crud is ready

- to add your tests Check Route and repository test sample
- for dbseed you can add it <b style="color:red"> src/DataBaseSeed</b> and call it in <b style="color:red">src/dataSeed.js</b>  
you are going to see implemented sample you can do the same 

## 📔 Contribution

If you find any problem feel free to open issues with any error you find or features you think we can add, if you have any problem while you are installing please feel free to contact me at __salem.at.ibrahim@gmail.com__


## 📔 License

The MIT License (MIT).