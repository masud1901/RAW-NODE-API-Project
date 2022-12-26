/*
title: Worker library
description: Worker related files
Author: Sumit (but ami banaitesi)
Date: 26/12/2022
*/

// Dependencies
const url = require("url");
const data = require("./data");
const http = require("http");
const https = require("https");
const { parseJSON } = require("../helpers/utilities");
const { sendTwilioSMS } = require("../helpers/notification");

// worker object - module scafolding
const worker = {};

//validate individual check data

worker.validateCheckData = (orginalCheckData) => {
  let orginalData = orginalCheckData;
  if (orginalData && orginalData.id) {
    orginalData.state =
      typeof orginalData.state === "string" &&
      ["up", "down"].indexOf(orginalData.state) > -1
        ? orginalData.state
        : "down";

    orginalData.lastChecked =
      typeof orginalData.lastChecked === "number" && orginalData.lastChecked > 0
        ? orginalData.lastChecked
        : false;

    //pass to the next process
    worker.performCheck(orginalData);
  } else {
    console.log("Invalid check data");
  }
};

//look up all the checks from the database
worker.gatherAllTheChecks = () => {
  //get all the checks from the database
  data.listdir("check", (err1, checks) => {
    if (!err1 && checks && checks.length > 0) {
      checks.forEach((chk) => {
        //read the checkData
        data.read("check", chk, (err2, orginalCheckData) => {
          if (!err2 && orginalCheckData) {
            //passs the data to the check validator
            worker.validateCheckData(parseJSON(orginalCheckData));
          } else {
            console.log("Error : reading  one of the check data!");
          }
        });
      });
    } else {
      console.log("Error: cound not find any checks in the process.");
    }
  });
};

//perform check
worker.performCheck = (orginalCheckData) => {
  //prepare the initial check outcome
  let checkOutcome = {
    error: false,
    responseCode: false,
  };
  //mark the outcome has not been sent yet
  let outcomeSent = false;

  //parse the hostname & url from the original check data
  const parsedUrl = url.parse(
    `${orginalCheckData.protocol}://${orginalCheckData.url}`,
    true
  );
  const hostname = parsedUrl.hostname;
  const path = parsedUrl.path;

  //construct the request
  const requestDetails = {
    protocol: orginalCheckData.protocol + ":",
    hostname: hostname,
    path: path,
    method: orginalCheckData.method.toUpperCase(),
    timeout: orginalCheckData.timeoutSeconds * 1000,
  };

  const protocolToUse = orginalCheckData.protocol === "http" ? http : https;

  let req = protocolToUse.request(requestDetails, (res) => {
    //grab the status code
    const statusCode = res.statusCode;
    console.log(`Status Code: ${statusCode}`);

    //update the check outcome and pass to the next function
    checkOutcome.responseCode = statusCode;
    if (!outcomeSent) {
      worker.processCheckOutcome(orginalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  req.on("error", (err) => {
    let checkOutcome = {
      error: true,
      value: err,
    };

    //update the check outcome and pass to the next function
    if (!outcomeSent) {
      worker.processCheckOutcome(orginalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  req.on("timeout", (err) => {
    let checkOutcome = {
      error: true,
      value: "timeout",
    };
    //update the check outcome and pass to the next function
    if (!outcomeSent) {
      worker.processCheckOutcome(orginalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  //send the request

  req.end();
};

//save check outcome to database and send to next function
worker.processCheckOutcome = (orginalCheckData, checkOutcome) => {
  //check if check outcome is up or down
  let state =
    !checkOutcome.error &&
    checkOutcome.responseCode &&
    orginalCheckData.successCode.indexOf(checkOutcome.responseCode) > -1
      ? "up"
      : "down";

  //decide if we should alert the user or not
  const alertWanted = !!(
    orginalCheckData.lastChecked && orginalCheckData.state !== state
  );

  //update the check data
  let newCheckData = orginalCheckData;
  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  //update the check data into the database
  data.update("check", newCheckData.id, newCheckData, (err) => {
    if (!err) {
      if (alertWanted) {
        //send the check data into next function
        worker.alertUserToStatusChange(newCheckData);
      } else {
        console.log("Alert is not needed as there is no state change.");
      }
    } else {
      console.log("Error updating check data.");
    }
  });
};

//send the SMS to user if state changes
worker.alertUserToStatusChange = (newCheckData) => {
  let msg = `Alert : Your check for ${newCheckData.method.toUpperCase()} ${
    newCheckData.protocol
  }://${newCheckData.url} is corrently in state ${newCheckData.state}.`;

  sendTwilioSMS(newCheckData.userPhone, msg, (error) => {
    if (!error) {
      console.log(`Alert sent to ${newCheckData.userPhone}`);
    } else {
      console.log("There was an error sending the SMS.");
    }
  });
};

//timer to execute the worker process once per minute
worker.loop = () => {
  setInterval(() => {
    worker.gatherAllTheChecks();
  }, 8000);
};

//start the worker
worker.init = () => {
  //execute all the checks
  worker.gatherAllTheChecks();

  //call the loops so that checks continue
  worker.loop();
};

//export worker
module.exports = worker;
