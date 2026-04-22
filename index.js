require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

//---MY NOTE: added body-parser middleware => this allow us to read data from POST requests (req.body)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//---

//---MY NOTE: in-memory storage for URLs and a counter
let urlDatabase = [];
let idCounter = 1;
//---

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//---MY NOTE: route to POST and shorten the URL with simplified regex
app.post('/api/shorturl', function(req, res) {

      const originalUrl = req.body.url;

      // simplified regex: checks if it starts with http:// or https://
      const urlRegex = /^http:?\/\/.+/;

      if (!urlRegex.test(originalUrl)) {
        return res.json({ error: 'invalid url'});
      }

      // store the url in our "database"
      const shortUrl = idCounter++;
      urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });

});
//---

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});