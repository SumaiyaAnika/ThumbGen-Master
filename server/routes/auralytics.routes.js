const express = require('express');
const { fetchYoutubeData, generateStrategy } = require('../controllers/auralytics.controller');

const router = express.Router();

router.post('/fetch-youtube', fetchYoutubeData);
router.post('/generate-strategy', generateStrategy);

module.exports = router;
