/*
title: Notifications library

description: important functions to notify users
Author: Sumit Saha (but ami banaitesi)
Date: 25/12/2022
*/

//dependencies
const https = require("https");
const { twilio } = require("./environments");
const querystring = require("querystring");

//module scafolding

const notification = {};

// send sms to the users using twilio api
notification.sendTwilioSMS = (phone, msg, callback) => {
  //input validation
  const userPhone =
    typeof phone === "string" && phone.length === 11 ? phone : false;
  const userMsg =
    typeof msg === "string" && msg.length > 0 && msg.length <= 1600
      ? msg
      : false;

  if (userPhone && userMsg) {
    // configure the request payload
    // const payload = {
    //   From: twilio.fromPhone,
    //   To: `+88${userPhone}`,
    //   Body: userMsg,
    // };

    const accountSid = twilio.accountSID;
    const authToken = twilio.authToken;
    const client = require("twilio")(accountSid, authToken);

    // //stringify the payload
    // const stringifiedPayload = querystring.stringify(payload);

    //configure the request details
    // const requestDetails = {
    //   hostname: twilio.hostname,
    //   method: "POST",
    //   path: `/2010-04-01/Accounts/${twilio.accountSID}/Messages.json`,
    //   auth: `${twilio.accountSID}:${twilio.authToken}`,
    //   headers: {
    //     "Content-Type": "application/x-www-form-urlencoded",
    //   },
    // };

    client.messages
      .create({
        body: userMsg,
        from: twilio.fromPhone,
        to: `+88${userPhone}`,
      })
      .then((message) => console.log(message.sid));

    // //instantiate the request object
    // const req = https.request(requestDetails, (res) => {
    //   //get the status code of the sent request
    //   const statusCode = res.statusCode;
    //   //callback successfully if the request went through
    //   if (statusCode === 200 || statusCode === 201) {
    //     callback(false);
    //   } else {
    //     callback(`status code: ${statusCode}`);
    //   }
    // });

    // //send the request
    // req.on("error", (err) => {
    //   callback(err);
    // });

    // req.write(stringifiedPayload);
    // req.end();
  } else {
    callback("Given parameters are missing or invalid.");
  }
};

//export the module
module.exports = notification;
