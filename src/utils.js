const Promise = require('bluebird');
const exec = require('child_process').exec;

class Utils {

  static execAsync(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }
        return resolve({ stdout, stderr });
      });
    });
  }

}

module.exports = Utils;
