'use strict';

const _ = require('lodash');

const HTTP_ERRORS = {
    INVALID_DATA: 'module.invalid_data',
    NOT_EXISTING: 'module.not_existing',
    missingId: id => `module.missing_${id}`,
    internal: code => `module.internal_server_error:${code}`,
};

module.exports = async(promise, errorCode, model) => {
    try {
        let response = await promise;
        if(!_.isArray(response)) {
            response = [response];
        }
    
        return { ok: true, data: { [model]: response } };
    } catch(err) {
        let error;
    
        if('NotFound' === err.name) {
            error = HTTP_ERRORS.NOT_EXISTING;
        } else if('ValidationError' === err.name) {
            error = HTTP_ERRORS.INVALID_DATA;
        } else {
            error = HTTP_ERRORS.internal(errorCode);
        }
    
        const response = { ok: false, error };
        if(!_.isNil(err.errors)) {
            response.details = err.errors;
        }
    
        return response;
    }
};
