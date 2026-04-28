const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true }
}, { _id: false, timestamps: true }); // Using _id: false restricts unnecessary comment ids, though if we want them for editing we can remove it. Let's keep default ids.

const PostSchema = new mongoose.Schema({
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    originalTitle: {
        type: String,
        required: false
    },
    geminiStrategy: {
        type: String,
        required: false
    },
    aiPrompt: {
        type: String,
        required: false
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Optimize feed sorting
PostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', PostSchema);
