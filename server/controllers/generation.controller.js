const jwt = require('jsonwebtoken');
const { HistoryModel } = require('./history.controller');

exports.generateThumbnail = async (req, res) => {
    try {
        const { prompt: reqPrompt, title, style, colorScheme } = req.body;

        // The frontend sends { title: prompt, style: ..., colorScheme: ... }
        // We fallback to `title` if `reqPrompt` is undefined.
        let finalPrompt = reqPrompt || title;

        if (!finalPrompt) {
            return res.status(400).json({ success: false, message: 'Prompt/Title is required' });
        }

        // We removed Gemini, so let's append the visual modifiers manually
        if (style && style !== 'None') {
            finalPrompt += `, in a ${style} style`;
        }
        if (colorScheme) {
            finalPrompt += `, emphasizing colors: ${colorScheme}`;
        }

        console.log("Requesting image from Hugging Face API with prompt:", finalPrompt);

        const response = await fetch("https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: finalPrompt,
                parameters: { width: 1024, height: 576 }
            })
        });

        if (!response.ok) {
            console.error("Hugging Face API Error:", response.statusText);
            throw new Error(`Hugging Face API rejected the request: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64String = buffer.toString('base64');
        const finalImageString = 'data:image/jpeg;base64,' + base64String;

        console.log("✅ Image successfully downloaded and converted!");

        // Save to History Database
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded.id;

                await HistoryModel.create({
                    userId,
                    prompt: finalPrompt,
                    imageUrl: finalImageString
                });
                console.log("✅ History saved for user:", userId);
            }
        } catch (err) {
            console.error("Failed to save history:", err);
            // Don't crash the generation if saving history fails
        }

        res.status(200).json({
            success: true,
            imageUrl: finalImageString,
            image: finalImageString // Keeping 'image' property for frontend compatibility
        });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ success: false, message: 'Failed to generate thumbnail', error: error.message });
    }
};