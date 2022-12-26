/*
title:Sample handler
description: Sample handler
Author: Sumit (but ami banaitesi)
Date: 02/12/2022
*/

//module scafolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {

  callback(200, {
    message: "This is a sample URL request",
  });
};

module.exports = handler;
