const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors'); // Import the cors package

const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS middleware
app.use(cors());

app.get('/api/screenshot', async (req, res) => {
    const { url, fullPage = 'false' } = req.query;

    if (!url || !url.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid URL. Please provide a valid URL starting with http or https.' });
    }

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: fullPage === 'true',
        });

        await browser.close();

        res.setHeader('Content-Type', 'image/png');
        res.send(screenshot);
    } catch (error) {
        console.error('Error capturing screenshot:', error);
        res.status(500).json({ error: 'Failed to capture screenshot.' });
    }
});

app.listen(PORT, () => {
    console.log(`Screenshot API is running at http://localhost:${PORT}`);
});
