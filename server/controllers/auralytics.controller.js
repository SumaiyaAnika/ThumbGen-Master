const { GoogleGenAI } = require('@google/genai');

// Using the same SDK structure you already use for generation
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.fetchYoutubeData = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ success: false, error: 'YouTube URL is required' });

        // Extract Video ID
        const urlParams = new URL(url).searchParams;
        let videoId = urlParams.get('v');
        if (!videoId) {
            const pathSegments = new URL(url).pathname.split('/');
            videoId = pathSegments[pathSegments.length - 1];

            // Clean up query params if it's a shortlink (e.g. youtu.be/ID?si=...)
            videoId = videoId.split('?')[0];
        }

        if (!videoId || videoId.length < 10) {
            return res.status(400).json({ success: false, error: 'Invalid YouTube URL' });
        }

        // 1. Download Public Thumbnail Data directly
        const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        let base64Image = null;
        try {
            const imageResponse = await fetch(thumbUrl);
            const arrayBuffer = await imageResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        } catch (e) {
            console.error("Failed to load maxresdefault.jpg", e);
        }

        // 2. Scrape Metadata from Video Page HTML naturally
        let title = "Unknown Title";
        let description = "";
        let tags = [];

        try {
            const pageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });
            const html = await pageResponse.text();

            // Regex matches
            const titleMatch = html.match(/<title>(.*?)<\/title>/);
            if (titleMatch && titleMatch[1]) {
                title = titleMatch[1].replace(' - YouTube', '');
            }

            const descMatch = html.match(/<meta name="description" content="(.*?)">/);
            if (descMatch && descMatch[1]) {
                description = descMatch[1];
            }

            const keywordsMatch = html.match(/<meta name="keywords" content="(.*?)">/);
            if (keywordsMatch && keywordsMatch[1]) {
                tags = keywordsMatch[1].split(', ').map(k => k.trim());
            }
        } catch (e) {
            console.error("Failed to scrape YouTube metadata", e);
        }

        // Send standard payload back out
        res.status(200).json({
            success: true,
            snippet: {
                title,
                description,
                tags
            },
            thumbnailBase64: base64Image
        });

    } catch (error) {
        console.error('Error fetching YouTube data:', error);
        res.status(500).json({ success: false, error: 'Failed to extract YouTube data' });
    }
};

exports.generateStrategy = async (req, res) => {
    try {
        const { snippet, visualData } = req.body;

        if (!snippet || !visualData) {
            return res.status(400).json({ success: false, error: 'Missing snippet or visual data' });
        }

        const prompt = `
Analyze this YouTube competitor data and provide a concise JSON object.

Video Title: "${snippet.title}"
Tags: ${snippet.tags.join(', ')}
Video Description snippet: "${snippet.description.substring(0, 300)}..."

Frontend Visual Analysis from Thumbnail:
- Dominant Color Palette (RGB): ${JSON.stringify(visualData.colors)}
- Human Subject Detected: ${visualData.hasFace ? 'Yes' : 'No'}
- Expected Face Position: ${visualData.facePosition || 'N/A'}

INSTRUCTIONS:
Generate 5 highly creative and actionable suggestions for a thumbnail based on analyzing the competitor's visual strategy and curiosity gap.
Provide a strong conclusion on why these suggestions will outperform the competitor.

Output strictly as valid JSON matching this structure:
{
    "suggestions": [
        "string",
        "string",
        "string",
        "string",
        "string"
    ],
    "conclusion": "string"
}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
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
            console.error("Gemini Strategy Parsing Error:", jsonRaw);
            // Resilient fallback so the UX is never blocked
            data = {
                suggestions: [
                    "Use high contrast colors compared to the competitor.",
                    "Position the human subject on the opposite third of the frame.",
                    "Use strong typography to emphasize the emotion.",
                    "Create a visual gap that forces the user to click to find out more.",
                    "Apply a completely different style (e.g., 3D or minimalist) to stand out in the feed."
                ],
                conclusion: "By contrasting heavily against the existing visuals, your thumbnail will immediately grab attention."
            };
        }

        res.status(200).json({
            success: true,
            strategy: data
        });

    } catch (error) {
        console.error('Error generating strategy:', error);
        // Do not block the UI. Return a dynamic fallback.
        res.status(200).json({
            success: true,
            strategy: {
                suggestions: [
                    "Use high contrast colors compared to the competitor.",
                    "Position the human subject on the opposite third of the frame.",
                    "Use strong typography to emphasize the emotion.",
                    "Create a visual gap that forces the user to click to find out more.",
                    "Apply a completely different style (e.g., 3D or minimalist) to stand out."
                ],
                conclusion: "A contrasting strategy will break pattern recognition and force a click."
            }
        });
    }
};
