/*
title: Utility functions
description: helpers for the project
Author: Sumit (but ami banaitesi)
Date: 01/12/2022
*/

//dependencies
const crypto = require('crypto');
const environments = require('./environments');

//module scafolding
const utilities = {};

// parse JSON string to object

utilities.parseJSON = (jsonString) => {
  let output;

  try {
    output = JSON.parse(jsonString);
  }
  catch (e) {
    output = {};
  }

  return output;
};


// hash string representation

utilities.hash = (str) => {
  if (typeof str === 'string' && str.length > 0) {
    let hash = crypto.createHmac('sha256', environments.secretKey)
      .update(str)
      .digest('hex');
    return hash;
  }
  return false;

};

utilities.createRandomString = (strlength) => {
  let length = strlength;
  length = typeof strlength === 'number' && strlength > 0 ? strlength : false;
  if (length) {
    let possibleCharecters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let output = '';
    for (let i = 0; i <= length; i += 1) {
      let randomCarecters = possibleCharecters.charAt(
        Math.floor(Math.random() * possibleCharecters.length)
      );
      output += randomCarecters;
    }
    return output;
  } else {
    return false
  }
};


// export utilities
module.exports = utilities;