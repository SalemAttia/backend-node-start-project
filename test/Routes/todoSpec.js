'use strict';

const _ = require('lodash');
const request = require('supertest');
const container = require('../../container');
const expect = require('../Resources/chai').expect;
const sample = require('../Resources/service');

describe('Routes/services', () => {
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
    
    describe('services.create', () => {
        it('should create a new service', () => 
            request(app)
                .post('/services.create')
                .send(sample)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.true;
                    expect(response.body.data).to.contain.keys(['services']);
                    expect(response.body.data.services).to.have.length(1);
                    expect(response.body.data.services[0]).to.contain.keys([
                        '_id', 'description', 'created_at', 'is_active',
                        'name', '__v', 
                    ]);

                    createdService = response.body.data.services[0];
                }),
        );

        it('should throw an error when missing service', () => 
            request(app).post('/services.create').send()
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.false;
                    expect(response.body.error).to.be.equal('module.invalid_data');
                }),
        );
    });

    describe('services.info', () => {
        it('should return all services', () =>
            request(app).get('/services.info')
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.true;
                    expect(response.body.data).to.contain.keys(['services']);
                    expect(response.body.data.services).to.have.length(1);
                    expect(response.body.data.services[0].is_active).to.be.true;
                }),
        );
        it('should return all services with pagination', () => {
            request(app).get(`/services.info?limit=10&page=1`)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.true;
                    expect(response.body.data).to.contain.keys(['services']);
                    expect(response.body.data.services[0].docs).to.have.length(1);
                    expect(response.body.data.services[0].docs[0].is_active).to.be.true;
                });
        },
        );
        it('should return a certain service', () => 
            request(app).get(`/services.info?_id=${createdService._id}`)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.true;
                    expect(response.body.data).to.contain.keys(['services']);
                    expect(response.body.data.services).to.have.length(1);
                    expect(response.body.data.services[0].name).to.be.equal(sample.name);
                }),
        );

        it('should throw an error if service is not found', () =>
            request(app).get(`/services.info?_id=${_.repeat('f', 24)}`)
                .then(response => {
                    expect(response.body.ok).to.be.false;
                    expect(response.body.error).to.be.equal('module.not_existing');
                }),
        );

        it('should return internal server error', () => 
            request(app).get('/services.info?_id=invalid_id')
                .then(response => {
                    expect(response.body.ok).to.be.false;
                    expect(response.body.error).to.be.equal('module.internal_server_error:201');
                }),
        );
    });

    describe('services.update', () => {
        it('should update service', () => {
            const clonedService = _.cloneDeep(createdService);
            clonedService.name = 'update service';
            const promise = request(app).post('/services.update')
                .send(clonedService)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.true;
                    expect(response.body.data).to.contain.keys(['services']);
                    expect(response.body.data.services).to.have.length(1);
                    expect(response.body.data.services[0].name).to.be.equal('update service');

                    updatedService = response.body.data.services[0];
                });

            return promise;
        });

        it('should return an error when missing service id', () => {
            const clonedservice = _.cloneDeep(updatedService);
            _.unset(clonedservice, '_id');
            
            const promise = request(app).post('/services.update')
                .send(clonedservice)
                .expect(200)
                .then(response => {
                    expect(response.body).to.deep.equal({
                        ok: false,
                        error: 'services.missing_id',
                    });
                });

            return promise;
        });

        it('should throw en error when service is not found', () => {
            const clonedService = _.cloneDeep(createdService);
            clonedService._id = _.repeat('f', 24);
            const promise = request(app).post('/services.update')
                .send(clonedService)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.false;
                    expect(response.body.error).to.be.equal('module.not_existing');
                });

            return promise;
        });
    });

    describe('services.remove', () => {
        it('should remove the service', () => 
            request(app)
                .post('/services.remove')
                .send(updatedService)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.true;
                    expect(response.body.data).to.contain.keys(['services']);
                    expect(response.body.data.services).to.have.length(1);
                    expect(response.body.data.services[0].is_active).to.be.false;
                }),
        );

        it('should return an error when missing service id', () => {
            const clonedservice = _.cloneDeep(updatedService);
            _.unset(clonedservice, '_id');

            const promise = request(app).post('/services.remove')
                .send(clonedservice)
                .expect(200)
                .then(response => {
                    expect(response.body).to.deep.equal({
                        ok: false,
                        error: 'services.missing_id',
                    });
                });

            return promise;
        });

        it('should throw an error when service is not found', () => {
            const clonedservice = _.cloneDeep(updatedService);
            clonedservice._id = _.repeat('f', 24);
            const promise = request(app).post('/services.remove')
                .send(clonedservice)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.false;
                    expect(response.body.error).to.be.equal('module.not_existing');
                });

            return promise;
        });
    });

    describe('services.restore', () => {
        it('should restore the service', () => 
            request(app).post('/services.restore')
                .send(updatedService)
                .expect(200)
                .then(response => {
                    expect(response.body.ok).to.be.true;
                    expect(response.body.data).to.contain.keys(['services']);
                    expect(response.body.data.services).to.have.length(1);
                    expect(response.body.data.services[0].is_active).to.be.true;
                }),
        );

        it('should return an error when missing service id', () => {
            const clonedservice = _.cloneDeep(updatedService);
            _.unset(clonedservice, '_id');
            
            const promise = request(app).post('/services.restore')
                .send(clonedservice)
                .expect(200)
                .then(response => {
                    expect(response.body).to.deep.equal({
                        ok: false,
                        error: 'services.missing_id',
                    });
                });

            return promise;
        });

        it('should throw an error when service is not found', () => {
            const clonedservice = _.cloneDeep(updatedService);
            clonedservice._id = _.repeat('f', 24);
            const promise = request(app).post('/services.restore')
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
