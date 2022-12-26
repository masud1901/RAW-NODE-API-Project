/*
title:Token handler
description: Handler to handle token related routes
Author: Sumit (but ami banaitesi)
Date: 07/12/2022
*/


// dependencies
const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { createRandomString } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");




//module scafolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) !== -1) {
        handler._token[requestProperties.method.toLowerCase()](requestProperties, callback);

    } else {
        callback(405);
    }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
    const phone = typeof requestProperties.body.phone === 'string'
        && requestProperties.body.phone.length === 11 ?
        requestProperties.body.phone : false;
    const password = typeof requestProperties.body.password === 'string'
        && requestProperties.body.password.length > 0 ?
        requestProperties.body.password : false;


    if (phone && password) {
        data.read('user', phone, (err1, userData) => {
            if (!err1) {
                let hashedPassword = hash(password);
                if (hashedPassword === parseJSON(userData).password) {
                    let tokenId = createRandomString(20);
                    let expires = Date.now() + 60 * 60 * 1000;
                    let tokenObejct = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires,
                    };
                    //store the token in the db
                    data.create('token', tokenId, tokenObejct, (err2) => {
                        if (!err2) {
                            callback(200, tokenObejct);
                        } else {
                            callback(500, {
                                error: 'There was an error on server side.',
                            })
                        }
                    });
                } else {
                    callback(400, {
                        error: 'Incorrect password.',
                    });
                }
            } else {
                callback(400, {
                    error: 'problem on server side.',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request.',
        });
    }
};

handler._token.get = (requestProperties, callback) => {
    //check if the id number is valid
    const id = typeof requestProperties.queryStringObject.id === 'string'
        && requestProperties.queryStringObject.id.length === 21 ?
        requestProperties.queryStringObject.id : false;

    if (id) {
        // look up the token
        data.read('token', id, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) };
            if (!err && token) {
                callback(200, token);
            } else {
                callback(404, {
                    error: 'The requested token was not found.',
                });
            }
        });

    } else {
        callback(404, {
            error: 'The requested token not found.',
        });
    }
};

handler._token.put = (requestProperties, callback) => {
    //check if the id number is valid
    const id = typeof requestProperties.body.id === 'string'
        && requestProperties.body.id.length === 21 ?
        requestProperties.body.id : false;

    const extend = typeof requestProperties.body.extend === 'boolean'
        && requestProperties.body.extend === true ?
        requestProperties.body.extend : false;


    if (id && extend) {
        data.read('token', id, (err1, tokenData) => {
            let tokenObject = parseJSON(tokenData);
            if (tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now() + 60 * 60 * 1000;
                //store the updated token
                data.update('token', id, tokenObject, (err2) => {
                    if (!err2) {
                        callback(200);
                    } else {
                        callback(500, {
                            error: 'There was a server side error.',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Token expired.',
                });
            }
        });

    } else {
        callback(400, {
            error: 'There was a problem in your request.',
        });
    }
};

handler._token.delete = (requestProperties, callback) => {

    //check if the token is valid
    const id = typeof requestProperties.queryStringObject.id === 'string'
        && requestProperties.queryStringObject.id.length === 21 ?
        requestProperties.queryStringObject.id : false;

    if (id) {
        // look up the user
        data.read('token', id, (err, tokenData) => {
            const tokenObject = { ...parseJSON(tokenData) };
            if (!err && tokenObject) {
                data.delete('token', id, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'Token was deleted successfully',
                        });
                    } else {
                        callback(500, {
                            error: "There was a problem in server side",
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'There was a server side error.',
                });
            }
        });

    } else {
        callback(400, {
            error: 'There was a problem in your request.',
        });
    }

};

handler._token.verify = (id, phone, callback) => {
    data.read('token', id, (err, tokenData) => {
        if (!err && tokenData) {
            if (parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }

        } else {
            callback(false);
        }
    });
};

module.exports = handler;
