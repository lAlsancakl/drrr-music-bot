const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const yts = require('yt-search');

const app = express();
app.use(cors());
app.use(express.json());

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

const ffmpegPath = "C:\\ffmpeg\\bin"; // Path to ffmpeg

// Your DuckDNS domain
const YOUR_PUBLIC_DOMAIN = 'drrr-music.duckdns.org';

// Certificate paths for HTTPS (Windows)
const privateKey = fs.readFileSync('C:\\pem\\privkey.pem', 'utf8');
const certificate = fs.readFileSync('C:\\pem\\fullchain.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate };

// === DOWNLOAD ENDPOINT ===
app.post('/download', async (req, res) => {
  try {
    let videoUrl = req.body.url;
    const searchQuery = req.body.search;

    // If no URL but search query exists, perform a YouTube search
    if (!videoUrl && searchQuery) {
      const r = await yts(searchQuery);
      if (!r.videos.length) {
        return res.status(404).json({ error: 'No search results found.' });
      }
      videoUrl = r.videos[0].url;
    }

    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL or search query is required.' });
    }

    // Extract video ID from URL
    let videoId = null;
    const idMatch = videoUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      videoId = idMatch[1];
    } else {
      const shortMatch = videoUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (shortMatch) {
        videoId = shortMatch[1];
      }
    }

    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube video URL.' });
    }

    const outputPath = path.join(publicDir, `${videoId}.mp3`);

    // If the file already exists, return its URL
    if (fs.existsSync(outputPath)) {
      return res.json({ downloadUrl: `https://${YOUR_PUBLIC_DOMAIN}:3000/public/${videoId}.mp3` });
    }

    // Download and convert command
    const cmd = `yt-dlp -x --audio-format mp3 --ffmpeg-location "${ffmpegPath}" -o "${outputPath}" "${videoUrl}"`;

    exec(cmd, (error, stdout, stderr) => {
      console.log('stdout:', stdout);
      console.error('stderr:', stderr);

      if (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'An error occurred during download.' });
      }

      res.json({ downloadUrl: `https://${YOUR_PUBLIC_DOMAIN}:3000/public/${videoId}.mp3` });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// === SEARCH ENDPOINT ===
app.get('/search', async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  try {
    const r = await yts(query);
    if (!r.videos.length) {
      return res.status(404).json({ error: 'No video found.' });
    }

    const video = r.videos[0];
    const videoUrl = video.url;

    // Extract video ID
    const idMatch = videoUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    const videoId = idMatch ? idMatch[1] : null;

    if (!videoId) {
      return res.status(400).json({ error: 'Could not extract video ID.' });
    }

    const outputPath = path.join(publicDir, `${videoId}.mp3`);
    const mp3Url = `https://${YOUR_PUBLIC_DOMAIN}:3000/public/${videoId}.mp3`;

    // If MP3 already exists, return info
    if (fs.existsSync(outputPath)) {
      return res.json({
        title: video.title,
        mp3Url: mp3Url
      });
    }

    // Else, download and convert
    const cmd = `yt-dlp -x --audio-format mp3 --ffmpeg-location "${ffmpegPath}" -o "${outputPath}" "${videoUrl}"`;

    exec(cmd, (error, stdout, stderr) => {
      console.log('stdout:', stdout);
      console.error('stderr:', stderr);

      if (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'An error occurred during download.' });
      }

      return res.json({
        title: video.title,
        mp3Url: mp3Url
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during search.' });
  }
});

// Serve static files from /public
app.use('/public', express.static(publicDir));

// Start HTTPS server
const httpsServer = https.createServer(credentials, app);
const PORT = 3000;

httpsServer.listen(PORT, () => {
  console.log(`HTTPS server is running on port ${PORT}`);
});
