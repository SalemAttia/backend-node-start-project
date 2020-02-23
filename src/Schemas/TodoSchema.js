'use strict';

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const Service = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    name_ar: {
        type: String,
        required: true,
        unique: true,
    },

    description: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },

    updated_at: {
        type: Date,
    },

    is_active: {
        type: Boolean,
        default: true,
    },
});

Service.plugin(uniqueValidator);
Service.plugin(mongoosePaginate);

module.exports = Service;
