require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns').promises;

const app = express();
const port = process.env.PORT || 3000;

let database = { urls: [], counter: 1 };

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async function(req, res) {
  const originalUrl = req.body.url;

  try {
    const parsedUrl = new URL(originalUrl);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    try {
      await dns.lookup(parsedUrl.hostname);
    } catch (err) {
      return res.json({ error: 'invalid url' });
    }

    const existingUrl = database.urls.find(
      item => item.original_url === originalUrl
    );

    if (existingUrl) {
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url
      });
    }

    const shortUrl = database.counter++;
    database.urls.push({ original_url: originalUrl, short_url: shortUrl });

    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });

  } catch (err) {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrlParam = parseInt(req.params.short_url);

  const foundUrl = database.urls.find(
    item => item.short_url === shortUrlParam
  );

  if (foundUrl) {
    return res.redirect(foundUrl.original_url);
  } else {
    return res.json({ error: 'short url not found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
