const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// 1. LOAD ENVIRONMENT VARIABLES FIRST!
dotenv.config();

// 2. NOW IMPORT THE CONTROLLERS
const { generateThumbnail } = require('./controllers/generation.controller');
const { analyzeVibe } = require('./controllers/vibe.matcher');
const { getHistory, clearHistory } = require('./controllers/history.controller');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serverless-friendly MongoDB Connection
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return; // Already connected
    }
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });
        console.log('MongoDB Connected (Serverless)');
    } catch (error) {
        console.error('DB Connection Error:', error);
    }
};

// Middleware to ensure DB connection is active before hitting routes
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Mount Auth Routes (Keep this one in its own file since it has login AND register)
app.use('/api/auth', require('./routes/auth.routes'));

// Root route for health check
app.get('/', (req, res) => {
    res.json({ message: 'ThumbGen Master API is running successfully!' });
});

// Mount API routes
app.post('/api/generate', generateThumbnail);
app.post('/api/vibe-matcher', analyzeVibe);
app.get('/api/history', getHistory);
app.delete('/api/history', clearHistory);
app.use('/api/hub', require('./routes/hub.routes'));
app.use('/api/studio', require('./routes/studio.routes'));
app.use('/api/auralytics', require('./routes/auralytics.routes'));
app.post('/api/spyglass/analyze', require('./controllers/spyglass.controller').analyzeSpyGlass);
app.post('/api/creatorlens/reverse', require('./controllers/creatorlens.controller').reverseBrainstorm);

const PORT = process.env.PORT || 5000;

// Only listen if not running in Vercel (where it acts as a serverless function)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export the app for Vercel
module.exports = app;