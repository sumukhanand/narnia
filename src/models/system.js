const _ = require('lodash');
const Utils = require('../utils');

class System {

  static getTemperature() {
    return Utils.execAsync('/bin/vcgencmd measure_temp')
    .spread((stdout, stderr) => {
      let temp = 0.0;
      let tempOutput = 'temp=0\'C';

      if (!stderr && !_.isEmpty(stdout)) {
        tempOutput = stdout;
      }
      else {
        console.error('Error fetching CPU temperature!', { stderr, stdout });
      }

      const tempMatches = tempOutput.match(/^temp=(.*)'C/);
      if (!_.isEmpty(tempMatches)) {
        temp = parseFloat(tempMatches[1]);
      }
      else {
        console.error('Error parsing CPU temperature!', { stderr, stdout });
      }

      return temp;
    })
  }

  static getCPUUsedPercentage() {
    return Utils.execAsync('mpstat 1 1 | tail -n 1 | awk \'$12 ~ /[0-9.]+/ { print 100 - $12"%" }\'')
    .spread((stdout, stderr) => {
      let cpu = '0%';

      if (!stderr && !_.isEmpty(stdout)) {
        cpu = stdout;
      }
      else {
        console.error('Error fetching CPU usage!', { stderr, stdout });
      }

      return cpu;
    });
  }

}

module.exports = System;
