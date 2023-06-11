const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { updateNickNames } = require('../websockets');

// replace placeholder pic with uploaded pic
router.post('/pics', (req, res) => {
  const uniqueImageName = path.join(__dirname, `../public/images/${req.body.nick}.png`);
  fs.writeFileSync(uniqueImageName, req.files.image.data);
  updateNickNames();
});

// clear old pics after start of server
fs.rmdirSync(path.join(__dirname, '../public/images'),{ recursive: true });
fs.mkdirSync(path.join(__dirname, '../public/images'));

module.exports = router;
