const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/info', async (req, res) => {
  const videoURL = req.query.url;
  if (!ytdl.validateURL(videoURL)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }
  const info = await ytdl.getInfo(videoURL);
  const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
  res.json({
    title: info.videoDetails.title,
    formats: formats.map(f => ({
      qualityLabel: f.qualityLabel,
      itag: f.itag
    }))
  });
});

app.get('/download', (req, res) => {
  const { url, itag } = req.query;

  if (!ytdl.validateURL(url)) {
    return res.status(400).send('Invalid YouTube URL');
  }

  ytdl.getInfo(url).then(info => {
    const title = info.videoDetails.title.replace(/[\W_]+/g, '_');
    res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
    ytdl(url, { quality: itag }).pipe(res);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
