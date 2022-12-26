/*
title: Server library
description: Sever related files
Author: Sumit (but ami banaitesi)
Date: 26/12/2022
*/

// Dependencies
const http = require("http");
const { handleReqRes } = require("../helpers/HandleReqRes");
const environment = require("../helpers/environments");
// const { sendTwilioSMS } = require("./helpers/notification");

// server object - module scafolding
const server = {};

// //@todo: delete later
// sendTwilioSMS("01304963440", "Sumaiya.. dakh ei message ta ami pc theke API er maddhome disi.", (err) => {
//   console.log(err);
// });



//configuration
server.config = {
  port: 3000,
};

// create server
server.createServer = () => {
  const createServerVariable = http.createServer(server.handleReqRes);
  createServerVariable.listen(environment.port, () => {
    console.log("Server listening on port", environment.port);
  });
};

// handle request and response
server.handleReqRes = handleReqRes;

//start server
server.init = () => {
  server.createServer();
};


//export server
module.exports = server;
