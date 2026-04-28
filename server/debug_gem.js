const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const mimeType = 'image/png';
    const prompt = 'Analyze this image and return JSON { "titles": ["A"] }';
    try {
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
                responseMimeType: 'application/json',
                temperature: 0.8,
            }
        });
        console.log(response.text);
    } catch(e) {
        console.error('ERROR:', e.message);
        console.error('FULL ERROR:', e);
    }
}
test();
