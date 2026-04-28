const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini with the new genai SDK logic
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.analyzeVibe = async (req, res) => {
    try {
        const { imageBase64, keyword } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ message: "Image data is required" });
        }

        console.log("Vibe Matcher Analysis Started with keyword:", keyword);

        // Define the precise prompt requested
        const promptInstruction = `Act as an expert prompt engineer. Look at this image and the keyword: ${keyword || 'None'}. Write a single, highly detailed, 40-word image generation prompt that describes this scene but incorporates the keyword. Do not include any conversational text, just the prompt.`;

        // The imageBase64 needs to be correctly formatted for the API
        // Usually, the frontend sends something like "data:image/jpeg;base64,...", so we strip the prefix if it exists.
        // The @google/genai SDK accepts inlineData.
        
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const mimeType = imageBase64.match(/^data:(image\/\w+);base64,/) 
            ? imageBase64.match(/^data:(image\/\w+);base64,/)[1] 
            : "image/jpeg"; // default fallback

        // Make the API request to the proper 2.5 flash model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { text: promptInstruction },
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                }
            ]
        });

        const generatedPrompt = response.text.trim();
        console.log("Vibe Matcher Prompt Extracted:", generatedPrompt);

        return res.status(200).json({ prompt: generatedPrompt });

    } catch (error) {
        console.error("Vibe Matcher Error:", error);
        
        let errorMessage = "Failed to analyze image vibe";
        if (error.message && error.message.includes("high demand")) {
            errorMessage = "Google Gemini API is currently experiencing high demand. Please try again later.";
        } else if (error.message && error.message.includes("quota")) {
            errorMessage = "Google Gemini API free tier quota exceeded. Please check your billing or wait for the quota to reset.";
        } else if (error.message) {
            errorMessage = error.message;
        }

        return res.status(500).json({ message: errorMessage, error: error.message });
    }
};
