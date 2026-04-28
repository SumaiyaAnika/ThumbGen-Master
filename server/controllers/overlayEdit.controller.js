// Pair 2: Overlay Edit (Backend) - Text-to-Emoji Mapping
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.suggestEmojis = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, message: 'Thumbnail prompt is required.' });
        }

        const promptInstruction = `Analyze this thumbnail prompt and suggest the 3 most emotionally resonant emojis that would increase CTR (Click-Through Rate). Return only a JSON array of 3 emojis. Prompt: "${prompt}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptInstruction,
        });

        const rawText = response.text.trim();
        let emojis = [];

        try {
            // Attempt to clean the output text of markdown formatting like ```json or newlines
            const jsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            emojis = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error("Failed to parse Gemini output into JSON array:", rawText);
            // Fallback parsing: use regex to extract any emojis found in the string
            const emojiPattern = /[\p{Extended_Pictographic}]/gu;
            const matches = rawText.match(emojiPattern);
            if (matches) {
                emojis = matches.slice(0, 3);
            } else {
                emojis = ["🔥", "😱", "👇"]; // Safe fallbacks
            }
        }

        // Ensure we always return an array
        if (!Array.isArray(emojis)) {
            emojis = [emojis];
        }

        res.status(200).json({
            success: true,
            emojis: emojis.slice(0, 3)
        });

    } catch (error) {
        console.error("Overlay Edit (Emoji Suggestion) Error:", error);

        // Return resilient fallbacks so the user flow isn't blocked
        res.status(200).json({
            success: true,
            emojis: ["🔥", "🚨", "✅"],
            warning: "Quota exceeded or API error; returning fallback emojis."
        });
    }
};
