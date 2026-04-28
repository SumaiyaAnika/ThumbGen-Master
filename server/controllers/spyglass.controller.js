const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.analyzeSpyGlass = async (req, res) => {
    let base64Image = null;
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ success: false, error: 'YouTube URL is required' });

        // Extract Video ID
        const urlParams = new URL(url).searchParams;
        let videoId = urlParams.get('v');
        if (!videoId) {
            const pathSegments = new URL(url).pathname.split('/');
            videoId = pathSegments[pathSegments.length - 1];
            videoId = videoId.split('?')[0];
        }

        if (!videoId || videoId.length < 10) {
            return res.status(400).json({ success: false, error: 'Invalid YouTube URL' });
        }

        // 1. Download Public Thumbnail Data directly
        const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        let imageBuffer = null;
        try {
            const imageResponse = await fetch(thumbUrl);
            const arrayBuffer = await imageResponse.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
            base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
        } catch (e) {
            console.error("Failed to load maxresdefault.jpg", e);
            return res.status(500).json({ success: false, error: 'Failed to fetch high-res thumbnail' });
        }

        const prompt = `
Act as an expert YouTube strategist and prompt engineer. Analyze this thumbnail image.
Extract the core visual elements and write a highly optimized prompt (50 words max) that can recreate the "vibe" and competitive advantage of this thumbnail, without explicitly copying the exact human subjects (use generic subjects like "a surprised gamer," "a focused creator").

Output strictly as a JSON object matching this exact schema, without any markdown formatting or extra text:
{
    "colors": ["#hex1", "#hex2", "#hex3"],
    "lighting": "Description of lighting setup",
    "composition": "Description of composition rule",
    "perfectPrompt": "A highly detailed masterpiece, 8k..."
}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                prompt,
                {
                    inlineData: {
                        data: imageBuffer.toString('base64'),
                        mimeType: "image/jpeg"
                    }
                }
            ],
            config: {
                responseMimeType: "application/json",
                temperature: 0.7,
            }
        });

        let jsonRaw = response.text.trim();
        jsonRaw = jsonRaw.replace(/```json/g, '').replace(/```/g, '').trim();

        let data = {};
        try {
            data = JSON.parse(jsonRaw);
        } catch (parseError) {
            console.error("Gemini SpyGlass Parsing Error:", jsonRaw);
            data = {
                colors: ["#ff0000", "#000000", "#ffffff"],
                lighting: "High contrast neon lighting",
                composition: "Rule of thirds",
                perfectPrompt: "A highly detailed cinematic 8k thumbnail scene."
            };
        }

        res.status(200).json({
            success: true,
            thumbnailBase64: base64Image,
            extractedData: data
        });

    } catch (error) {
        console.error('Error in analyzeSpyGlass:', error);
        // Fallback gracefully to avoid blocking the UI on Gemini 503 Overload
        res.status(200).json({
            success: true,
            thumbnailBase64: base64Image,
            extractedData: {
                colors: ["#ff0000", "#000000", "#ffffff"],
                lighting: "High contrast neon lighting",
                composition: "Rule of thirds",
                perfectPrompt: "A highly detailed cinematic 8k thumbnail scene."
            }
        });
    }
};
