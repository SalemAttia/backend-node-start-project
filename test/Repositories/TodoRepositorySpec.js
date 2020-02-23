'use strict';

const _ = require('lodash');
const{  BaseRepository } = require('../../src').Repositories;
const todoSample = require('../Resources/todo');
const expect = require('../Resources/chai').expect;
const container = require('../../container');
const Errors = BaseRepository.Errors;

describe('Repositories/Todo', () => {
    let createdTodo;
    let dbConnection;
    let todoRepository;
    
    before(async() =>  {
        dbConnection = await container['database.connection'];
        todoRepository = await container['todo.repository'];
        const connection = await dbConnection.dropDatabase();
        return connection;
    });
    
    after(() => dbConnection.dropDatabase());

    describe('constructor', () => {
        it('should create an instance', () => {
            expect(todoRepository).to.be.instanceOf(BaseRepository);
        });
    });

    describe('create', () => {
        it('should create a new Todo', () => {
            const promise = todoRepository.create(todoSample)
                .then(response => {
                    createdTodo = response;
                    expect(createdTodo).to.containSubset(todoSample);
                    expect(createdTodo.toObject()).to.have.keys([
                        '_id', 'created_at', 'is_active', 'description', 'name', 'name_ar', '__v',
                    ]);
                    expect(createdTodo.is_active).to.be.true;
                });
            return promise;
        });

        it('should throw error if no object passed', () => {
            const fn = () => todoRepository.create();
            return expect(fn).to.throw(Error)
                .that.instanceOf(Errors.IllegalArgumentError)
                .and.have.property('message').that.is.equal('missing todo object');
        });

        it('should throw error if missing todo name', () => {
            const copiedSample = _.cloneDeep(todoSample);
            copiedSample.name_ar = ' ';
            delete copiedSample.name;
            const promise = todoRepository.create(copiedSample);
            
            return expect(promise).to.be.eventually.rejectedWith(Error)
                .and.have.property('message')
                .that.is.equal('Todo validation failed: name: Path `name` is required.');
        });

        it('should throw error if name is not unique', () => {
            const copiedSample = _.cloneDeep(todoSample);
            copiedSample.name_ar = ' another arabic name ';
            const promise = todoRepository.create(copiedSample);

            return expect(promise).to.be.eventually.rejectedWith(Error)
                .and.have.property('message')
                .that.is.equal(
                    'Todo validation failed: name: Error,' +
                    ' expected `name` to be unique. Value: `first todo`',
                );
        });
    });

    describe('findAll', () => {
        it('should return all records', () => 
            todoRepository.findAll()
                .then(todo => {
                    expect(todo).to.be.an('array').and.have.lengthOf(1);
                    expect(todo[0].toObject()).is.deep.equal(createdTodo.toObject());
                }),
        );

        it('should return all records with pagination', () => {
            const options = {
                limit: 1,
                page: 1,
            };
         
            todoRepository.findAll(options)
                .then(todo => {
                    expect(todo.docs).to.be.an('array');
                    expect(todo.docs).to.be.an('array').and.have.lengthOf(1);
                    expect(todo.docs[0].toObject()).is.deep.equal(createdTodo.toObject());
                    expect(todo.limit).to.be.equal(options.limit);
                });
        },
        );

        it('should return all records with pagination with not exist key', () => {
            const options = {
                limit: 1,
                page: 1,
            };
            const query = {
                not_exist_key: {
                    $gt: 0,
                },
            };

            todoRepository.findAll(options, query)
                .then(todo => {
                    expect(todo.docs).to.be.an('array');
                    expect(todo.docs).to.be.an('array').and.have.lengthOf(0);
                    expect(todo.limit).to.be.equal(options.limit);
                });
        },
        );
    });

    describe('findById', () => {
        it('should return todo by id', () => 
            todoRepository.findById(createdTodo._id)
                .then(todo => {
                    expect(todo.toObject()).to.be.an('object')
                        .and.to.be.deep.equal(createdTodo.toObject());
                }),
        );

        it('should throw an error if missing todo id', () => {
            const fn = () => todoRepository.findById();

            return expect(fn).to.throw(Error)
                .that.is.instanceOf(Errors.IllegalArgumentError)
                .and.have.property('message')
                .to.be.equal('missing todo id');
        });

        it('should throw an error if todo not found', () => {
            const promise = todoRepository.findById(_.repeat('f', 24));

            return expect(promise).to.be.eventually.rejectedWith(Error)
                .that.is.instanceOf(Errors.NotFoundError)
                .and.have.property('message')
                .that.is.equal('todo not found');
        });
    });

    describe('update', () => {
        it('should update the todo successfully', () => {
            const newTodoName = 'updated todo';
            createdTodo.name = newTodoName;

            return todoRepository.update(createdTodo)
                .then(updatedTodo => {
                    expect(updatedTodo.name).to.be.equal(newTodoName);
                    expect(updatedTodo.description).to.be.equal(createdTodo.description);
                });
        });

        it('should throw an error if todo object is missing', () => {
            const fn = () => todoRepository.update();

            return expect(fn).to.throw(Error)
                .that.is.instanceOf(Errors.IllegalArgumentError)
                .and.have.property('message').that.is.equal('missing todo or todo id');
        });

        it('should throw an error if missing todo _id', () => {
            const copiedTodo = _.cloneDeep(createdTodo.toObject());
            const fn = () => todoRepository.update(_.omit(copiedTodo, ['_id']));

            return expect(fn).to.throw(Error)
                .that.is.instanceOf(Errors.IllegalArgumentError)
                .and.have.property('message').that.is.equal('missing todo or todo id');
        });
    });

    describe('remove', () => {
        it('should soft delete todo successfully', () => 
            todoRepository.remove(createdTodo)
                .then(todo => {
                    expect(todo.is_active).to.be.false;
                }),
        );

        it('should throw an error if todo object is missing', () => {
            const fn = () => todoRepository.remove();

            return expect(fn).to.throw(Error)
                .that.is.instanceOf(Errors.IllegalArgumentError)
                .and.have.property('message').that.is.equal('missing todo or todo id');
        });

        it('should throw an error if missing todo _id', () => {
            const copiedTodo = _.cloneDeep(createdTodo.toObject());
            const fn = () => todoRepository.remove(_.omit(copiedTodo, ['_id']));

            return expect(fn).to.throw(Error)
                .that.is.instanceOf(Errors.IllegalArgumentError)
                .and.have.property('message').that.is.equal('missing todo or todo id');
        });
    });

    describe('restore', () => {
        it('should restore todo successfully', () => 
            todoRepository.restore(createdTodo)
                .then(todo => {
                    expect(todo.is_active).to.be.true;
                }),
        );

        it('should throw an error if todo object is missing', () => {
            const fn = () => todoRepository.restore();

            return expect(fn).to.throw(Error)
                .that.is.instanceOf(Errors.IllegalArgumentError)
                .and.have.property('message').that.is.equal('missing todo or todo id');
        });

        it('should throw an error if missing todo _id', () => {
            const copiedTodo = _.cloneDeep(createdTodo.toObject());
            const fn = () => todoRepository.restore(_.omit(copiedTodo, ['_id']));

            return expect(fn).to.throw(Error)
                .that.is.instanceOf(Errors.IllegalArgumentError)
                .and.have.property('message').that.is.equal('missing todo or todo id');
        });
    });
});
