/*
title: Environments
description: Handle all environments related things
Author: Sumit (but ami banaitesi)
Date: 01/12/2022
*/

//dependencies

//module scafolding
const environments = {};

environments.staging = {
  port: 3000,
  envName: "staging",
  secretKey: "akjeheghalgaeru",
  maxCheck: 5,
  twilio: {
    fromPhone: "+18138596112",
    accountSID: "AC2adcd79348161d227cc5b6095ab40002",
    authToken: "a0d3fe96ec350e3186dc602d742222a7",
  },
};

environments.production = {
  port: 5000,
  envName: "production",
  secretKey: "akjfeh;oafhe;go",
  maxCheck: 5,
  twilio: {
    fromPhone: "+18138596112",
    accountSID: "AC2adcd79348161d227cc5b6095ab40002",
    authToken: "a0d3fe96ec350e3186dc602d742222a7",
  },
};

//determine environment

const currentEnvironment =
  typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging";

//exprot corresponding environment object
const environmentToExport =
  typeof environments[currentEnvironment] === "object"
    ? environments[currentEnvironment]
    : "staging";

module.exports = environmentToExport;
