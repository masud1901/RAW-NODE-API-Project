/*
title: Routes
description: Application routes
Author: Sumit (but ami banaitesi)
Date: 02/12/2022
*/

//dependencies
const { sampleHandler } = require("./handlers/routeHandlers/sampleHandlers");
const { userHandler } = require("./handlers/routeHandlers/userHandler");
const { checkHandler } = require("./handlers/routeHandlers/checkHandler");
const { tokenHandler } = require("./handlers/routeHandlers/tokenHandler");

const routes = {
  sample: sampleHandler,
  user: userHandler,  
  token: tokenHandler,
  check: checkHandler,
};

module.exports = routes;