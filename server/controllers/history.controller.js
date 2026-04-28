const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Define Schema dynamically in the controller to satisfy the single-file requirement
const historySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    prompt: { type: String },
    imageUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Use existing model if it exists to prevent OverwriteModelError in connected environments
const History = mongoose.models.History || mongoose.model('History', historySchema);

const getUserIdFromReq = (req) => {
    // Check if an existing auth middleware populated req.user
    if (req.user && (req.user.id || req.user._id)) {
        return req.user.id || req.user._id;
    }

    // Fallback: verify standard JWT Bearer token if middleware isn't present
    const authHeader = req.header('Authorization');
    console.log("Auth header received:", authHeader);

    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
        console.log("No token extracted");
        return null;
    }

    try {
        console.log("JWT Secret present:", !!process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded JWT ID:", decoded.id);
        return decoded.id; // Matches the payload from auth.controller.js
    } catch (err) {
        console.error("JWT Verification failed:", err.message);
        return null;
    }
};

/*
 * GET route controller
 * Fetches the most recent 10 images associated with the user, sorted by date (newest first).
 */
exports.getHistory = async (req, res) => {
    try {
        const userId = getUserIdFromReq(req);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User authentication required.' });
        }

        const userHistory = await History.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10);

        return res.status(200).json(userHistory);
    } catch (error) {
        console.error("Error fetching history:", error);
        return res.status(500).json({ message: 'Failed to fetch history', error: error.message });
    }
};

/**
 * DELETE route controller
 * Wipes the user's history from the database when the "Clear History" button is triggered.
 */
exports.clearHistory = async (req, res) => {
    try {
        const userId = getUserIdFromReq(req);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User authentication required.' });
        }

        const result = await History.deleteMany({ userId });

        return res.status(200).json({
            message: 'History cleared successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Error clearing history:", error);
        return res.status(500).json({ message: 'Failed to clear history', error: error.message });
    }
};

// Export model in case we need to hook it into the generation logic
exports.HistoryModel = History;
