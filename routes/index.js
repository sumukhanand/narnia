const express = require('express');
const router = express.Router();

const _ = require('lodash');
const exec = require('child_process').exec;
const Promise = require('bluebird');

const COLOR_PALETTE = {
  NORMAL: ['#02AAB0', '#00CDAC'],
  WARM: ['#F7971E', '#FFD200'],
  HOT: ['#cb2d3e', '#ef473a']
};

const execAsync = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      return resolve({ stdout, stderr });
    })
  });
}

router.get('/', (req, res, next) => {
  let temp = 0.0;
  let cpu = '0%';
  let colorPalette = COLOR_PALETTE.NORMAL;

  Promise.all([execAsync('/opt/vc/bin/vcgencmd measure_temp'), execAsync('mpstat 1 1 | tail -n 1 | awk \'$12 ~ /[0-9.]+/ { print 100 - $12"%" }\'')])
  .spread((tempResponse, cpuResponse) => {
    let tempOutput = 'temp=0\'C';
    if (!tempResponse.stderr && !_.isEmpty(tempResponse.stdout)) {
      tempOutput = tempResponse.stdout;
    }
    else {
      console.error('Error fetching CPU temperature!', {
        stderr: tempResponse.stderr,
        stdout: tempResponse.stdout
      });
    }

    const tempMatches = tempOutput.match(/^temp=(.*)'C/);
    if (!_.isEmpty(tempMatches)) {
      temp = parseFloat(tempMatches[1]);
    }
    else {
      console.error('Error parsing CPU temperature!', {
        stderr: tempResponse.stderr,
        stdout: tempResponse.stdout
      });
    }

    if (temp > 60) {
      colorPalette = COLOR_PALETTE.WARM;
    }
    if (temp > 80) {
      colorPalette = COLOR_PALETTE.HOT;
    }

    if (!cpuResponse.stderr && !_.isEmpty(cpuResponse.stdout)) {
      cpu = cpuResponse.stdout;
    }
    else {
      console.error('Error fetching CPU usage!', {
        stderr: cpuResponse.stderr,
        stdout: cpuResponse.stdout
      });
    }
  })
  .catch((error) => {
    console.error("Unknown Error!", { error });
  })
  .then(() => {
    if (temp === 0) {
      colorPalette = COLOR_PALETTE.HOT;
    }
    
    res.render('index', {
      title: 'Narnia',
      temp: `${temp}°C`,
      cpu,
      colorPalette
    });
  })
});

module.exports = router;
