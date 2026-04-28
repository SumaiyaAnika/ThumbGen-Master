const Post = require('../models/Post');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');

// Cloudinary config fallback
if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

const getUserId = (req) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id;
    } catch (err) {
        return null;
    }
};

exports.publishPost = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { imageBase64, originalTitle, geminiStrategy, aiPrompt } = req.body;
        
        if (!imageBase64) {
            return res.status(400).json({ message: 'Image data is required.' });
        }

        const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
            folder: 'thumbgen_master/hookhub'
        });

        const newPost = await Post.create({
            creatorId: userId,
            imageUrl: uploadResponse.secure_url,
            originalTitle,
            geminiStrategy,
            aiPrompt,
            likes: [],
            comments: []
        });

        // Let's populate the creatorId right away so the frontend gets the username back instantly
        await newPost.populate('creatorId', 'name');

        res.status(201).json({ success: true, post: newPost });
    } catch (error) {
        console.error("Publish Error:", error);
        res.status(500).json({ success: false, message: 'Failed to publish post.', error: error.message });
    }
};

exports.getFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v')
            .populate('creatorId', 'name')
            .populate('comments.userId', 'name');

        const total = await Post.countDocuments();

        res.status(200).json({
            success: true,
            posts,
            hasMore: total > skip + posts.length,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Get Feed Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch feed.' });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const likeIndex = post.likes.indexOf(userId);
        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(userId);
        }
        await post.save();
        res.status(200).json({ success: true, likes: post.likes });
    } catch (error) {
        console.error("Toggle Like Error:", error);
        res.status(500).json({ success: false, message: 'Failed to toggle like.' });
    }
};

exports.addComment = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const postId = req.params.id;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Comment text is required.' });
        }

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found.' });

        post.comments.push({ userId, text });
        await post.save();

        // Repopulate user name so frontend instantly gets it
        await post.populate('comments.userId', 'name');

        res.status(200).json({ success: true, comments: post.comments });
    } catch (error) {
        console.error("Comment Error:", error);
        res.status(500).json({ success: false, message: 'Failed to add comment.' });
    }
};

exports.editPost = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const postId = req.params.id;
        const { originalTitle, geminiStrategy } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found.' });

        // Stringify ObjectIds to compare safely
        if (post.creatorId.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have permission to edit this post.' });
        }

        post.originalTitle = originalTitle || post.originalTitle;
        post.geminiStrategy = geminiStrategy || post.geminiStrategy;
        
        await post.save();
        res.status(200).json({ success: true, post });
    } catch (error) {
        console.error("Edit Error:", error);
        res.status(500).json({ success: false, message: 'Failed to edit post.' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const postId = req.params.id;
        const post = await Post.findById(postId);
        
        if (!post) return res.status(404).json({ message: 'Post not found.' });

        if (post.creatorId.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this post.' });
        }

        // Delete from Cloudinary
        if (post.imageUrl) {
            try {
                const parts = post.imageUrl.split('/');
                const filenameWithExt = parts[parts.length - 1]; // e.g., xyz.jpg
                const filename = filenameWithExt.split('.')[0];
                const publicId = `thumbgen_master/hookhub/${filename}`;
                
                await cloudinary.uploader.destroy(publicId);
            } catch (cdErr) {
                console.error("Cloudinary destroy err", cdErr);
            }
        }

        await Post.deleteOne({ _id: postId });
        res.status(200).json({ success: true, message: 'Post deleted successfully.' });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ success: false, message: 'Failed to delete post.' });
    }
};
