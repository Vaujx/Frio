const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.use(cors());
app.use(express.json()); // Enable JSON body parsing

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Backend server is running.');
});

app.post('/scrape', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Fetch HTML content
        const { data: htmlContent } = await axios.get(url, {
            headers: { // Add some basic headers to mimic a browser
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        // Load HTML into Cheerio
        const $ = cheerio.load(htmlContent);
        const foundVideos = new Set(); // Use a Set to store unique URLs

        // 1. Video tags
        $('video').each((index, element) => {
            const src = $(element).attr('src');
            if (src) foundVideos.add(src);

            // 2. Source tags within video tags
            $(element).find('source').each((i, sourceEl) => {
                const sourceSrc = $(sourceEl).attr('src');
                if (sourceSrc) foundVideos.add(sourceSrc);
            });
        });

        // 3. Common video link patterns in <a> tags (example)
        $('a').each((index, element) => {
            const href = $(element).attr('href');
            if (href && /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v|3gp)(\?[^"'\s]*)?$/i.test(href)) {
                foundVideos.add(href);
            }
        });
        
        // 4. Regex for video URLs in the HTML body (adapted from frontend)
        // This is a simplified version; extensive regex on full HTML can be slow.
        // Focusing on common patterns.
        const bodyText = $('body').html(); // Get HTML content of body
        if (bodyText) { // Ensure bodyText is not null
            const videoUrlRegex = /https?:\/\/[^"'\s]+\.(?:mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v|3gp|m3u8)(?:\?[^"'\s]*)?/gi;
            let match;
            while ((match = videoUrlRegex.exec(bodyText)) !== null) {
                foundVideos.add(match[0]);
            }
        }

        // Convert Set to array and resolve relative URLs
        const absoluteVideoUrls = Array.from(foundVideos).map(videoUrl => {
            try {
                return new URL(videoUrl, url).href;
            } catch (e) {
                return videoUrl; // If it's already absolute or invalid, return as is
            }
        });

        res.json({ videos: absoluteVideoUrls });

    } catch (error) {
        console.error('Scraping error:', error.message);
        if (error.response) {
            // Axios error with response (e.g., 404, 403)
            res.status(error.response.status).json({ error: `Failed to fetch URL: ${error.response.statusText}` });
        } else if (error.request) {
            // Axios error with no response (e.g., network error)
            res.status(500).json({ error: 'Network error while fetching URL' });
        } else {
            // Other errors
            res.status(500).json({ error: 'Error scraping website' });
        }
    }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
