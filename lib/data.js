//dependencies
const fs = require("fs");
const path = require("path");

const lib = {};

//base directory of the data folder
lib.basedir = path.join(__dirname, "/../.data/");

//write data to file
lib.create = (dir, file, data, callback) => {
  //open file for writing
  fs.open(
    lib.basedir + dir + "/" + file + ".json",
    "wx",
    (err1, fileDescriptor) => {
      if (!err1 && fileDescriptor) {
        //convert data to string
        const stringData = JSON.stringify(data);

        //write data to file and then close it
        fs.writeFile(fileDescriptor, stringData, (err2) => {
          if (!err2) {
            fs.close(fileDescriptor, (err3) => {
              if (!err3) {
                callback(false);
              } else {
                callback("Error closing the new file!");
              }
            });
          }
        });
      } else {
        callback("Could not create new file.It may already exist!");
      }
    }
  );
};

//read data from file
lib.read = (dir, file, callback) => {
  fs.readFile(lib.basedir + dir + "/" + file + ".json", "utf8", (err, data) => {
    callback(err, data);
  });
};

//update existing files
lib.update = (dir, file, data, callback) => {
  //open file for writing
  fs.open(
    lib.basedir + dir + "/" + file + ".json",
    "r+",
    (err1, fileDescriptor) => {
      if (!err1 && fileDescriptor) {
        //convert data to string
        const stringData = JSON.stringify(data);
        //truncate the file
        fs.ftruncate(fileDescriptor, (err2) => {
          if (!err2) {
            //write data to file and then close it
            fs.writeFile(fileDescriptor, stringData, (err3) => {
              if (!err3) {
                //close the file
                fs.close(fileDescriptor, (err5) => {
                  if (!err5) {
                    callback(false);
                  } else {
                    callback("Error closing the new file!");
                  }
                });
              } else {
                callback("Error closing the file!");
              }
            });
          } else {
            console.log("Error truncating the file!");
          }
        });
      } else {
        console.log("Error updating. File may not exist");
      }
    }
  );
};
//delete existing file
lib.delete = (dir, file, callback) => {
  fs.unlink(lib.basedir + dir + "/" + file + ".json", (err) => {
    if (!err) {
      callback(false);
    } else {
      callback("Error deleting the file!");
    }
  });
};

//list all the items in a directory
lib.listdir = (dir, callback) => {
  fs.readdir(lib.basedir + dir, (err, fileNames) => {
    if (!err && fileNames && fileNames.length > 0) {
      let trimmedFileNames = [];
      fileNames.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace(".json", ""));
      });

      callback(false, trimmedFileNames);
    } else {
      callback("Error listing the directory!");
    }
  });
};

module.exports = lib;
