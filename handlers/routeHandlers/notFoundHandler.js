/*
title:Not Found handler
description: 404 not found handler
Author: Sumit (but ami banaitesi)
Date: 02/12/2022
*/

//module scafolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
  console.log(requestProperties.treamedPath);

  callback(404, {
    message: "OOPS,Your requested page does not exist!",
  });
};

module.exports = handler;
