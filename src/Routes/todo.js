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
