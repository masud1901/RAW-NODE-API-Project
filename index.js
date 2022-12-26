/*
title: Project initial file
description: Initial file to start the node server and the workers
Author: Sumit (but ami banaitesi)
Date: 26/12/2022
*/

// Dependencies
const server = require("./lib/server");
const worker = require("./lib/worker");

// app object - module scafolding
const app = {};

app.init = () => {
  //start the server

  server.init();

  //start the worker

  worker.init();
};

app.init();

//export the app
module.exports = app;
