'use strict';

const _ = require('lodash');
const request = require('supertest');
const container = require('../../container');
const expect = require('../Resources/chai').expect;
const sample = require('../Resources/todo');

describe('Routes/todo', () => {
    let dbConnection;
    let app;
    let createdService;
    let updatedService;

    before(async() =>  {
        dbConnection = await container['database.connection'];
        const connection = await dbConnection.dropDatabase();
        app = container['express.app'];        
        return connection;
    });

    after(() => dbConnection.dropDatabase());
    
    describe('todo.create', () => {
        it('should create a new service', () => 
            request(app)
                .post('/todo.create')
                .send(sample)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.true;
                    expect(response.body.data).to.contain.keys(['todo']);
                    expect(response.body.data.todo).to.have.length(1);
                    expect(response.body.data.todo[0]).to.contain.keys([
                        '_id', 'description', 'created_at', 'is_active',
                        'name', '__v', 
                    ]);

                    createdService = response.body.data.todo[0];
                }),
        );

        it('should throw an error when missing service', () => 
            request(app).post('/todo.create').send()
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.false;
                    expect(response.body.error).to.be.equal('module.invalid_data');
                }),
        );
    });

    describe('todo.info', () => {
        it('should return all todo', () =>
            request(app).get('/todo.info')
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.true;
                    expect(response.body.data).to.contain.keys(['todo']);
                    expect(response.body.data.todo).to.have.length(1);
                    expect(response.body.data.todo[0].is_active).to.be.true;
                }),
        );
        it('should return all todo with pagination', () => {
            request(app).get(`/todo.info?limit=10&page=1`)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.true;
                    expect(response.body.data).to.contain.keys(['todo']);
                    expect(response.body.data.todo[0].docs).to.have.length(1);
                    expect(response.body.data.todo[0].docs[0].is_active).to.be.true;
                });
        },
        );
        it('should return a certain service', () => 
            request(app).get(`/todo.info?_id=${createdService._id}`)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.true;
                    expect(response.body.data).to.contain.keys(['todo']);
                    expect(response.body.data.todo).to.have.length(1);
                    expect(response.body.data.todo[0].name).to.be.equal(sample.name);
                }),
        );

        it('should throw an error if service is not found', () =>
            request(app).get(`/todo.info?_id=${_.repeat('f', 24)}`)
                .then(response => {
                    expect(response.body.ok).to.be.false;
                    expect(response.body.error).to.be.equal('module.not_existing');
                }),
        );

        it('should return internal server error', () => 
            request(app).get('/todo.info?_id=invalid_id')
                .then(response => {
                    expect(response.body.ok).to.be.false;
                    expect(response.body.error).to.be.equal('module.internal_server_error:201');
                }),
        );
    });

    describe('todo.update', () => {
        it('should update service', () => {
            const clonedService = _.cloneDeep(createdService);
            clonedService.name = 'update service';
            const promise = request(app).post('/todo.update')
                .send(clonedService)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.true;
                    expect(response.body.data).to.contain.keys(['todo']);
                    expect(response.body.data.todo).to.have.length(1);
                    expect(response.body.data.todo[0].name).to.be.equal('update service');

                    updatedService = response.body.data.todo[0];
                });

            return promise;
        });

        it('should return an error when missing service id', () => {
            const clonedservice = _.cloneDeep(updatedService);
            _.unset(clonedservice, '_id');
            
            const promise = request(app).post('/todo.update')
                .send(clonedservice)
                .expect(200)
                .then(response => {
                    expect(response.body).to.deep.equal({
                        ok: false,
                        error: 'todo.missing_id',
                    });
                });

            return promise;
        });

        it('should throw en error when service is not found', () => {
            const clonedService = _.cloneDeep(createdService);
            clonedService._id = _.repeat('f', 24);
            const promise = request(app).post('/todo.update')
                .send(clonedService)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.false;
                    expect(response.body.error).to.be.equal('module.not_existing');
                });

            return promise;
        });
    });

    describe('todo.remove', () => {
        it('should remove the service', () => 
            request(app)
                .post('/todo.remove')
                .send(updatedService)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.true;
                    expect(response.body.data).to.contain.keys(['todo']);
                    expect(response.body.data.todo).to.have.length(1);
                    expect(response.body.data.todo[0].is_active).to.be.false;
                }),
        );

        it('should return an error when missing service id', () => {
            const clonedservice = _.cloneDeep(updatedService);
            _.unset(clonedservice, '_id');

            const promise = request(app).post('/todo.remove')
                .send(clonedservice)
                .expect(200)
                .then(response => {
                    expect(response.body).to.deep.equal({
                        ok: false,
                        error: 'todo.missing_id',
                    });
                });

            return promise;
        });

        it('should throw an error when service is not found', () => {
            const clonedservice = _.cloneDeep(updatedService);
            clonedservice._id = _.repeat('f', 24);
            const promise = request(app).post('/todo.remove')
                .send(clonedservice)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.false;
                    expect(response.body.error).to.be.equal('module.not_existing');
                });

            return promise;
        });
    });

    describe('todo.restore', () => {
        it('should restore the service', () => 
            request(app).post('/todo.restore')
                .send(updatedService)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.true;
                    expect(response.body.data).to.contain.keys(['todo']);
                    expect(response.body.data.todo).to.have.length(1);
                    expect(response.body.data.todo[0].is_active).to.be.true;
                }),
        );

        it('should return an error when missing service id', () => {
            const clonedservice = _.cloneDeep(updatedService);
            _.unset(clonedservice, '_id');
            
            const promise = request(app).post('/todo.restore')
                .send(clonedservice)
                .expect(200)
                .then(response => {
                    expect(response.body).to.deep.equal({
                        ok: false,
                        error: 'todo.missing_id',
                    });
                });

            return promise;
        });

        it('should throw an error when service is not found', () => {
            const clonedservice = _.cloneDeep(updatedService);
            clonedservice._id = _.repeat('f', 24);
            const promise = request(app).post('/todo.restore')
                .send(clonedservice)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.false;
                    expect(response.body.error).to.be.equal('module.not_existing');
                });

            return promise;
        });
    });
});
