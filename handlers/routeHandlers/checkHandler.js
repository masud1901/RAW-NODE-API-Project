/*
title:check handler
description: Handler to handle user defined checks
Author: Sumit (but ami banaitesi)
Date: 20/12/2022
*/

// dependencies
const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");
const { createRandomString } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");
const { maxCheck } = require("../../helpers/environments");

//module scafolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];

  if (acceptedMethods.indexOf(requestProperties.method) !== -1) {
    handler._check[requestProperties.method.toLowerCase()](
      requestProperties,
      callback
    );
  } else {
    callback(405);
  }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
  //validate input
  const protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  const url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.length > 0
      ? requestProperties.body.url
      : false;

  const method =
    typeof requestProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  const successCode =
    typeof requestProperties.body.successCode === "object" &&
    requestProperties.body.successCode instanceof Array
      ? requestProperties.body.successCode
      : false;

  const timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (protocol && url && method && successCode && timeoutSeconds) {
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    //lookup the user phone by reading the token
    data.read("token", token, (err1, tokenData) => {
      if (!err1 && tokenData) {
        const userPhone = parseJSON(tokenData).phone;

        // look up the user data
        data.read("user", userPhone, (err2, userData) => {
          if (!err2 && userData) {
            tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                let userObject = JSON.parse(userData);
                let userChecks =
                  typeof userObject.check === "object" &&
                  userObject.check instanceof Array
                    ? userObject.check
                    : [];

                if (userChecks.length < maxCheck) {
                  let checkId = createRandomString(20);
                  let checkObject = {
                    id: checkId,
                    userPhone: userPhone,
                    protocol: protocol,
                    url: url,
                    method: method,
                    successCode: successCode,
                    timeoutSeconds: timeoutSeconds,
                  };

                  //save the check object
                  data.create("check", checkId, checkObject, (err3) => {
                    if (!err3) {
                      //add check id to the user object
                      userObject.check = userChecks;
                      userObject.check.push(checkId);

                      //save the new user data
                      data.update("user", userPhone, userObject, (err4) => {
                        if (!err4) {
                          //return the data about the new check
                          callback(200, checkObject);
                        } else {
                          callback(500, {
                            error: "There was a problem in the server side.",
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error: "There was a problem in the SERVER side.",
                      });
                    }
                  });
                } else {
                  callback(401, {
                    error:
                      "User has already reached the maximum number of checks.",
                  });
                }
              } else {
                callback(403, {
                  error: "Authentication process failed.",
                });
              }
            });
          } else {
            callback(403, {
              error: "User not found.",
            });
          }
        });
      } else {
        callback(403, {
          error: "Authentication process failed.",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a problem in your request.",
    });
  }
};

handler._check.get = (requestProperties, callback) => {
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.length === 21
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    //look up the check
    data.read("check", id, (err1, checkData) => {
      if (!err1 && checkData) {
        //verify token
        let token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              callback(200, parseJSON(checkData));
            } else {
              callback(403, {
                error: "Authentication process failed.",
              });
            }
          }
        );
      } else {
        callback(500, {
          error: "There was a problem in the server side.",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a problem in your request.",
    });
  }
};

handler._check.put = (requestProperties, callback) => {
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.length === 21
      ? requestProperties.body.id
      : false;

  //validate the inputs
  const protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  const url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.length > 0
      ? requestProperties.body.url
      : false;

  const method =
    typeof requestProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  const successCode =
    typeof requestProperties.body.successCode === "object" &&
    requestProperties.body.successCode instanceof Array
      ? requestProperties.body.successCode
      : false;

  const timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (id) {
    if (protocol || url || method || successCode || timeoutSeconds) {
      data.read("check", id, (err1, checkData) => {
        if (!err1 && checkData) {
          const checkObject = parseJSON(checkData);
          //verify token
          const token =
            typeof requestProperties.headersObject.token === "string"
              ? requestProperties.headersObject.token
              : false;

          tokenHandler._token.verify(
            token,
            checkObject.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                if (protocol) {
                  checkObject.protocol = protocol;
                }
                if (url) {
                  checkObject.url = url;
                }
                if (method) {
                  checkObject.method = method;
                }
                if (successCode) {
                  checkObject.successCode = successCode;
                }
                if (timeoutSeconds) {
                  checkObject.timeoutSeconds = timeoutSeconds;
                }

                //store the check Object
                data.update("check", id, checkObject, (err2) => {
                  if (!err2) {
                    callback(200, checkObject);
                  } else {
                    callback(500, {
                      error: "There was a problem in the server side.",
                    });
                  }
                });
              } else {
                callback(403, {
                  error: "Authentication process failed.",
                });
              }
            }
          );
        } else {
          callback(500, {
            error: "There was a problem in the server side.",
          });
        }
      });
    } else {
      callback(400, {
        error:
          "You must provide at least one of the following parameters: protocol, url, method, successCode, timeoutSeconds.",
      });
    }
  } else {
    callback(400, {
      error: "You have a problem in your request.",
    });
  }
};

handler._check.delete = (requestProperties, callback) => {
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.length === 21
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    //look up the check
    data.read("check", id, (err1, checkData) => {
      if (!err1 && checkData) {
        //verify token
        const token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              let phn = parseJSON(checkData).userPhone;
              data.delete("check", id, (err2) => {
                if (!err2) {
                  data.read("user", phn, (err3, userData) => {
                    let userObject = parseJSON(userData);
                    if (!err3 && userObject) {
                      let userCheck =
                        typeof userObject.check === "object"
                          ? userObject.check
                          : [];

                      //remove the deleted check id from the user's list of checks
                      const checkPosition = userCheck.indexOf(id);
                      if (checkPosition > -1) {
                        userCheck.splice(checkPosition, 1);

                        // resave the user data
                        userObject.check = userCheck;
                        data.update(
                          "user",
                          phn,
                          userObject,
                          (err4) => {
                            if (!err4) {
                              callback(200);
                            } else {
                              callback(500, {
                                error:
                                  "There was a problem in the server side. Update korte giye vul hoise.",
                              });
                            }
                          }
                        );
                      } else {
                        callback(500, {
                          error:
                            "The check id you are trying to delete does not exist.",
                        });
                      }
                    } else {
                      console.log(err3, userData);
                      callback(500, {
                        error:
                          "There was a problem in the server side. Mane userObject e kono vul hoise.",
                      });
                    }
                  });
                } else {
                  callback(500, {
                    error:
                      "There was a problem in the server side. Check er data delete hoile. ",
                  });
                }
              });
            } else {
              callback(403, {
                error: "Authentication process failed.",
              });
            }
          }
        );
      } else {
        callback(500, {
          error: "There was a problem in the server side.",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a problem in your request.",
    });
  }
};

module.exports = handler;
