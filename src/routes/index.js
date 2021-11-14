const express = require('express');
const router = express.Router();

const Promise = require('bluebird');

const System = require('../models/system')

const COLOR_PALETTE = {
  NORMAL: ['#02AAB0', '#00CDAC'],
  WARM: ['#F7971E', '#FFD200'],
  HOT: ['#cb2d3e', '#ef473a']
};

router.get('/', (req, res, next) => {
  let temp = 0.0;
  let cpu = '0%';
  let colorPalette = COLOR_PALETTE.NORMAL;

  return Promise.all([System.getTemperature(), System.getCPUUsedPercentage()])
  .spread((tempResult, cpuResult) => {
    temp = tempResult;
    cpu = cpuResult;
  })
  .catch((error) => {
    console.error("Unknown Error!", { error });
  })
  .then(() => {
    if (temp === 0) {
      colorPalette = COLOR_PALETTE.HOT;
    }
    if (temp > 60) {
      colorPalette = COLOR_PALETTE.WARM;
    }
    if (temp > 80) {
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
