const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.reverseBrainstorm = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ success: false, error: 'Image data is required' });
        }

        let base64Data = image;
        let mimeType = 'image/jpeg';
        if (image.startsWith('data:')) {
            const parts = image.split(',');
            if (parts.length >= 2) {
                const header = parts[0];
                base64Data = parts.slice(1).join(',');
                const mimeMatch = header.match(/^data:([^;]+);/);
                if (mimeMatch) {
                    mimeType = mimeMatch[1];
                }
            }
        }

        const prompt = `
Act as an expert YouTube strategist and title optimizer. Analyze the visual context, emotion, and mystery of the uploaded image.
Brainstorm 5 highly engaging, high-CTR YouTube video titles that perfectly fit the picture.

Output strictly as a JSON object matching this exact schema, without any markdown formatting or extra text:
{ "titles": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"] }
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                }
            ],
            config: {
                responseMimeType: "application/json",
                temperature: 0.8,
            }
        });

        let jsonRaw = '';
        try {
            if (response && response.text) {
                jsonRaw = response.text.trim();
            }
        } catch (e) {
            console.error("Failed to read response text:", e);
        }

        jsonRaw = jsonRaw.replace(/```json/g, '').replace(/```/g, '').trim();

        let data = {};
        try {
            if (!jsonRaw) throw new Error("Empty AI response");
            data = JSON.parse(jsonRaw);
        } catch (parseError) {
            console.error("Gemini CreatorLens Parsing Error:", jsonRaw);
            data = {
                titles: [
                    "How I Achieved This Incredible Result",
                    "The Secret Behind This Epic Moment",
                    "I Tried This and You Won't Believe What Happened",
                    "This Will Change How You View Things Forever",
                    "Unveiling the Hidden Truth Behind This Image"
                ]
            };
        }

        res.status(200).json({
            success: true,
            titles: data.titles
        });

    } catch (error) {
        console.error('Error in reverseBrainstorm:', error);
        // Fallback gracefully instead of throwing 500 on Gemini 503 Overload
        res.status(200).json({
            success: true,
            titles: [
                "Unlocking the Mystery of This Image",
                "Why Everyone is Talking About This",
                "The Ultimate Guide to Mastering This",
                "Behind the Scenes: What You Didn't See",
                "Here is the Truth About This Photo"
            ]
        });
    }
};
