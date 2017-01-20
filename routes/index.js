const express = require('express');
const router = express.Router();

const _ = require('lodash');
const exec = require('child_process').exec;

const COLOR_PALETTE = {
  NORMAL: ['#02AAB0', '#00CDAC'],
  WARM: ['#F7971E', '#FFD200'],
  HOT: ['#cb2d3e', '#ef473a']
};

/* GET home page. */
router.get('/', (req, res, next) => {
  exec('/opt/vc/bin/vcgencmd measure_temp', (error, stdout, stderr) => {
    let tempOutput = 'temp=0\'C';
    if (!error && !stderr && !_.isEmpty(stdout)) {
      tempOutput = stdout;
    }
    else {
      console.log('Error fetching CPU temperature!', error, stderr, stdout);
    }

    const tempMatches = tempOutput.match(/^temp=(.*)'C/);
    let temp = 0.0;
    if (!_.isEmpty(tempMatches)) {
      temp = parseFloat(tempMatches[1]);
    }
    else {
      console.log('Error parsing CPU temperature!', error, stderr, stdout);
    }

    let colorPalette = COLOR_PALETTE.NORMAL;
    if (temp > 60) {
      colorPalette = COLOR_PALETTE.WARM;
    }
    if (temp > 80) {
      colorPalette = COLOR_PALETTE.HOT;
    }

    exec('mpstat 1 1 | tail -n 1 | awk \'$12 ~ /[0-9.]+/ { print 100 - $12"%" }\'', (error, stdout, stderr) => {
      let cpu = '0%';
      if (!error && !stderr && !_.isEmpty(stdout)) {
        cpu = stdout;
      }
      else {
        console.log('Error fetching CPU usage!', error, stderr, stdout);
      }

      res.render('index', {
        title: 'Narnia',
        temp: `${temp}°C`,
        cpu,
        colorPalette
      });
    });


  });
});

module.exports = router;
