/*
title:user handler
description: Handler to handle user events
Author: Sumit (but ami banaitesi)
Date: 04/12/2022
*/

// dependencies
const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");

//module scafolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];

  if (acceptedMethods.indexOf(requestProperties.method) !== -1) {
    handler._user[requestProperties.method.toLowerCase()](
      requestProperties,
      callback
    );
  } else {
    callback(405);
  }
};

handler._user = {};

handler._user.post = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.length > 0
      ? requestProperties.body.lastName
      : false;

  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.length === 11
      ? requestProperties.body.phone
      : false;
  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.length > 0
      ? requestProperties.body.password
      : false;

  const tosAgreement =
    typeof requestProperties.body.tosAgreement === "boolean"
      ? requestProperties.body.tosAgreement
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // making sure that the user already exist or not
    data.read("user", phone, (err1, user) => {
      if (err1) {
        const userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };

        //store the user object to db
        data.create("user", phone, userObject, (err2) => {
          if (!err2) {
            callback(200, {
              message: "User was created successfully",
            });
          } else {
            callback(500, {
              error: "Could not create user!",
            });
          }
        });
      } else {
        callback(500, {
          error: "There was a problem in server side",
        });
      }
    });
  } else {
    callback(400, {
      message: "Please fill in all the required fields",
    });
  }
};

handler._user.get = (requestProperties, callback) => {
  //check if the phone number is valid
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  if (phone) {
    //verify the token
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        // look up the user
        data.read("user", phone, (err, u) => {
          const user = { ...parseJSON(u) };
          if (!err && user) {
            delete user.password;
            callback(200, user);
          } else {
            callback(404, {
              error: "The requested user not found.",
            });
          }
        });
      } else {
        callback(403, {
          error: "Requested user is not authorized.",
        });
      }
    });
  } else {
    callback(404, {
      error: "The requested user not found.",
    });
  }
};

handler._user.put = (requestProperties, callback) => {
  // check if the phone number is valid
  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.length === 11
      ? requestProperties.body.phone
      : false;

  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.length > 0
      ? requestProperties.body.lastName
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.length > 0
      ? requestProperties.body.password
      : false;

  if (phone) {
    if (firstName || lastName || password) {
      //verify the token
      let token =
        typeof requestProperties.headersObject.token === "string"
          ? requestProperties.headersObject.token
          : false;

      tokenHandler._token.verify(token, phone, (tokenId) => {
        if (tokenId) {
          //lookup the user
          data.read("user", phone, (err, uData) => {
            const userData = { ...parseJSON(uData) };
            if (!err && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.password = hash(password);
              }
              //update dp
              data.update("user", phone, userData, (err1, user) => {
                if (!err1) {
                  callback(200, {
                    message: "User was updated successfully",
                  });
                } else {
                  callback(500, {
                    error: "There was a problem in server side",
                  });
                }
              });
            } else {
              callback(400, {
                message: "Invalid phone number.Please,try again.",
              });
            }
          });
        } else {
          callback(403, {
            error: "Requested user is not authorized.",
          });
        }
      });
    } else {
      callback(400, {
        message: "Invalid phone number.Please,try again.",
      });
    }
  } else {
    callback(400, {
      message: "Invalid phone number.Please,try again.",
    });
  }
};

//@Todo:authentication
handler._user.delete = (requestProperties, callback) => {
  //check if the phone number is valid
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  if (phone) {
    //verify the token
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        // look up the user
        data.read("user", phone, (err, u) => {
          const user = { ...parseJSON(u) };
          if (!err && user) {
            data.delete("user", phone, (err) => {
              if (!err) {
                callback(200, {
                  message: "User was deleted successfully",
                });
              } else {
                callback(500, {
                  error: "There was a problem in server side",
                });
              }
            });
          } else {
            callback(500, {
              error: "There was a server side error.",
            });
          }
        });
      } else {
        callback(403, {
          error: "Requested user is not authorized.",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was a problem in your request.",
    });
  }
};

module.exports = handler;
