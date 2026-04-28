const express = require('express');
const router = express.Router();
const bgRemoverController = require('../controllers/bgRemover.controller');
const overlayEditController = require('../controllers/overlayEdit.controller');
const zonecheckController = require('../controllers/zonecheck.controller');

// Zone Check features
router.post('/zone-check/analyze', zonecheckController.analyzeCollision);
router.post('/zone-check/autofix', zonecheckController.autoFixImage);

// Background Remover features
router.post('/bg-remover/proxy', bgRemoverController.processBackground);

// Overlay Edit features (Dynamic Overlay / Text-to-Emoji)
router.post('/overlay-edit/suggest-emojis', overlayEditController.suggestEmojis);

module.exports = router;
