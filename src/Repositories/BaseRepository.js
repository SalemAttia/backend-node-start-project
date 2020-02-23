'use strict';

const _ = require('lodash');

class IllegalArgumentError extends Error {

    constructor(message) {
        super(message);
        this.name = 'IllegalArgument';
    }

}

class NotFoundError extends Error {

    constructor(message) {
        super(message);
        this.name = 'NotFound';
    }

}

class BaseRepository {

    constructor(model, modelName) {
        this.model = model;
        this.modelName = modelName;
    }

    create(newInctance) {
        if(!_.isPlainObject(newInctance)) {
            throw new IllegalArgumentError(`missing ${this.modelName} object`);
        }
        return this.model.create(newInctance);
    }

    findAll(options = {}, query = {}, created_at = 1) {
        query.is_active = true;
        if(!_.isEmpty(options)) {
            options = !_.isArray(options) ? options : JSON.parse(options);
            options.sort = _.isString(options.sort) ? JSON.parse(options.sort) : { created_at: -1 };
            return this.model.paginate(query, options);
        }

        return this.model.find(query).sort({ created_at });
    }

    find(query, populate = null) {
        const response = !_.isNull(populate) ? this.model.find(query).populate(populate) : this.model.find(query);
        return response ;
    }

    findById(objectDataId) {
        if(_.isNil(objectDataId)) {
            throw new IllegalArgumentError(`missing ${this.modelName} id`);
        }

        return this._find(objectDataId);
    }

    search(query, options = {}, populate = []) {
        query.is_active = true;
        if(populate.length) {
            options.populate = populate;
        }
        const response = !_.isEmpty(options) ? this.model.paginate(query, options) :
            this.model.find(query);
        return response;
    }

    update(objectData) {
        if(!_.isObject(objectData) || _.isNil(objectData._id)) {
            throw new IllegalArgumentError(`missing ${this.modelName} or ${this.modelName} id`);
        }

        return this._update(objectData);
    }

    remove(objectData) {
        if(!_.isObject(objectData) || _.isNil(objectData._id)) {
            throw new IllegalArgumentError(`missing ${this.modelName} or ${this.modelName} id`);
        }

        objectData.is_active = false;
        return this._update(objectData);
    }

    restore(objectData) {
        if(!_.isObject(objectData) || _.isNil(objectData._id)) {
            throw new IllegalArgumentError(`missing ${this.modelName} or ${this.modelName} id`);
        }

        objectData.is_active = true;
        return this._update(objectData);
    }

    _find(objectDataId) {
        return this.model.findById(objectDataId)
            .then(objectData => {
                if(_.isNil(objectData)) {
                    throw new NotFoundError(`${this.modelName} not found`);
                }

                return objectData;
            });
    }

    _update(objectData) {
        objectData.updated_at = new Date();

        return this._find(objectData._id)
            .then(res => this.model.findByIdAndUpdate(
                res._id,
                objectData, { new: true, runValidators: true, context: 'query' },
            ));
    }

}

module.exports = BaseRepository;
module.exports.Errors = {
    NotFoundError,
    IllegalArgumentError,
};
