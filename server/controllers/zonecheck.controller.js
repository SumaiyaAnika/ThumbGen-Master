const { GoogleGenAI } = require('@google/genai');
const sharp = require('sharp');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.analyzeCollision = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ success: false, error: 'Image data is required' });
        }

        // Parse base64
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
Act as a professional YouTube designer analyzing a 16:9 thumbnail. 
Look closely at the extreme Bottom-Right corner (where the YouTube video length timestamp goes) and the Top-Right corner (where the 'Watch Later' icons overlay).
Does any crucial structural element like human face parts, eyes, or large promotional typography/text currently intersect with these extreme corners? 
If there's an intersection that could obscure important info, return a JSON object with "overlapping": true, and a brief 1-sentence "warning" advising what is covered (e.g., "The bottom right timestamp covers your text. Move it left."). 
If those exact corner zones are safe (only generic backgrounds, textures, or non-crucial elements), return "overlapping": false and "warning": "".

Output strictly as a JSON object matching this schema:
{ "overlapping": true, "warning": "..." }
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
                temperature: 0.1, // Keep it deterministic
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
            console.error("Gemini ZoneCheck Parsing Error:", jsonRaw);
            // Default safe fallback if parsing fails or overloading
            return res.status(200).json({ success: true, overlapping: false, warning: '' });
        }

        res.status(200).json({
            success: true,
            overlapping: data.overlapping || false,
            warning: data.warning || ""
        });

    } catch (error) {
        console.error('Error in analyzeCollision:', error);
        // Resilient fallback on 503 or quota limits
        res.status(200).json({ success: true, overlapping: false, warning: "" });
    }
};

exports.autoFixImage = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ success: false, error: 'Image data is required' });
        }

        // Parse base64
        let base64Data = image;
        if (image.startsWith('data:')) {
            const parts = image.split(',');
            if (parts.length >= 2) {
                base64Data = parts.slice(1).join(',');
            }
        }

        const buffer = Buffer.from(base64Data, 'base64');
        const metadata = await sharp(buffer).metadata();

        if (!metadata.width || !metadata.height) {
            return res.status(400).json({ success: false, error: 'Invalid image format' });
        }

        // Scale down by 10%
        const scaleFactor = 0.9;
        const newWidth = Math.round(metadata.width * scaleFactor);
        const newHeight = Math.round(metadata.height * scaleFactor);
        
        const padTopBottom = Math.floor((metadata.height - newHeight) / 2);
        const padLeftRight = Math.floor((metadata.width - newWidth) / 2);

        const resizedBuffer = await sharp(buffer)
            .resize(newWidth, newHeight, { fit: 'fill' }) // using fill as we will restore exact exact aspect ratio using extend
            .extend({
                top: padTopBottom,
                bottom: metadata.height - newHeight - padTopBottom,
                left: padLeftRight,
                right: metadata.width - newWidth - padLeftRight,
                background: { r: 0, g: 0, b: 0, alpha: 1 } // Pitch black to match YouTube dark mode perfectly
            })
            .jpeg({ quality: 95 })
            .toBuffer();

        const finalImageString = `data:image/jpeg;base64,${resizedBuffer.toString('base64')}`;

        res.status(200).json({
            success: true,
            image: finalImageString
        });

    } catch (error) {
        console.error("Error in autoFixImage:", error);
        res.status(500).json({ success: false, error: "Failed to process auto-fix image manipulation" });
    }
};
