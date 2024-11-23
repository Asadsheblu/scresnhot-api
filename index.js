const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse query parameters
app.use(express.json());

// Route to generate screenshot
app.get('/api/screenshot', async (req, res) => {
    const { url, fullPage = 'false' } = req.query;

    // Validate the URL
    if (!url || !url.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid URL. Please provide a valid URL starting with http or https.' });
    }

    try {
        // Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Take a screenshot
        const screenshotPath = path.join(__dirname, `screenshot-${Date.now()}.png`);
        await page.screenshot({
            path: screenshotPath,
            fullPage: fullPage === 'true',
        });

        await browser.close();

        // Stream the screenshot file to the user
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="screenshot.png"`);
        const fileStream = fs.createReadStream(screenshotPath);
        fileStream.pipe(res);

        // Delete the file after sending the response
        fileStream.on('end', () => {
            fs.unlinkSync(screenshotPath);
        });
    } catch (error) {
        console.error('Error capturing screenshot:', error);
        res.status(500).json({ error: 'Failed to capture screenshot.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Screenshot API is running at http://localhost:${PORT}`);
});
