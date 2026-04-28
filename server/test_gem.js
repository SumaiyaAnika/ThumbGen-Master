require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
    try {
        const prompt = `Analyze this YouTube competitor data and provide a concise JSON object.
Video Title: "Unknown Title"
Tags: 
Video Description snippet: ""...
Frontend Visual Analysis from Thumbnail:
- Dominant Color Palette (RGB): null
- Human Subject Detected: No
- Expected Face Position: N/A

INSTRUCTIONS:
Identify the "Winning Visual Hook" (e.g., high-contrast text, emotional face, minimalist background).
Identify the "Curiosity Gap" used in the title.
Suggest a "Counter-Strategy": How can the user create a thumbnail that looks DIFFERENT but equally appealing to the same audience? Provide 1-2 sentences of actionable design tips.

Output strictly as valid JSON matching this structure:
{
    "winningVisualHook": "string",
    "curiosityGap": "string",
    "counterStrategy": "string"
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.7,
            }
        });
        
        let jsonRaw = response.text.trim();
        console.log("SUCCESS:", jsonRaw);
    } catch (e) {
        console.error("ERROR:", e.message);
    }
}
test();
