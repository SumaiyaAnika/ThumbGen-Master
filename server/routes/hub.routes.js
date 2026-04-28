const express = require('express');
const router = express.Router();
const { publishPost, getFeed, toggleLike, addComment, editPost, deletePost } = require('../controllers/hub.controller');

router.post('/publish', publishPost);
router.get('/feed', getFeed);
router.put('/like/:id', toggleLike);
router.post('/comment/:id', addComment);
router.put('/edit/:id', editPost);
router.delete('/delete/:id', deletePost);

module.exports = router;
