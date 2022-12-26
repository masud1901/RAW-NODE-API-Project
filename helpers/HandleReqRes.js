/*
title: Handle Request Response
description: Handle Request and Response
Author: Sumit (but ami banaitesi)
Date: 01/12/2022
*/

//dependencies
const url = require("url");
const { StringDecoder } = require("string_decoder");
const routes = require("../route");
const {
  notFoundHandler,
} = require("../handlers/routeHandlers/notFoundHandler");
const { parseJSON } = require("../helpers/utilities");

//module scafolding
const handler = {};

handler.handleReqRes = (req, res) => {
  //request handling
  //get the url and then parse it
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const treamedPath = path.replace(/^\/+|\/+$/g, "");
  const method = req.method.toLowerCase();
  const queryStringObject = parsedUrl.query;
  const headersObject = req.headers;

  const requestProperties = {
    parsedUrl,
    path,
    treamedPath,
    method,
    queryStringObject,
    headersObject,
  };

  const decoder = new StringDecoder("utf-8");
  let realdata = "";
  req.on("data", (buffer) => {
    realdata += decoder.write(buffer);
  });

  const chosenHandler = routes[treamedPath]
    ? routes[treamedPath]
    : notFoundHandler;

  req.on("end", () => {
    realdata += decoder.end();

    requestProperties.body = parseJSON(realdata);
    chosenHandler(requestProperties, (statusCode, payload) => {
      statusCode = typeof statusCode === "number" ? statusCode : 500;
      payload = typeof payload === "object" ? payload : {};

      const payloadString = JSON.stringify(payload);

      //return the final response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);
    });

    // response handle
    // res.end("Hello World!");
  });
};

module.exports = handler;
