const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: 'AIzaSyDrbI2udYxGJqsv1g5w5YNziE3hfjCnYdc' });

async function check() {
    try {
        console.log("Testing API...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Hello, this is a test.",
        });
        console.log("Success! API is working fine now.");
        // console.log(response.text);
    } catch (e) {
        console.log("Error status:", e.status);
        console.log("Error message:", e.message);
        if (e.response && e.response.headers) {
            console.log("Retry-After header:", e.response.headers.get('retry-after'));
            console.log("All headers:", e.response.headers);
        }
    }
}
check();
