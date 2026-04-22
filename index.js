require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

//---MY NOTE: (step 1) added body-parser middleware 
//--- => this allow us to read data from POST requests (req.body)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//---

//---MY NOTE: (step 2) in-memory storage for URLs and a counter
//---Using a simple array and a counter to map IDs to URLs
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

//---MY NOTE: (step 2) route to POST and shorten the URL with simplified regex
//---Validates the format, stores it, and returns the short_url ID
app.post('/api/shorturl', function(req, res) {

      const originalUrl = req.body.url;

      // simplified regex: checks if it starts with http:// or https://
      const urlRegex = /^https?:\/\/.+/;

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

//---MY NOTE: (step 3) GET short URL redirect
//--- Finds the original URL by ID and redirects the user
app.get('/api/shorturl/:short_url', function(req, res) {

      const shortUrlParam = req.params.short_url;
      const foundUrl = urlDatabase.find(
        item => item.short_url === parseInt(shortUrlParam)
      );

      if (foundUrl) {
        return res.redirect(foundUrl.original_url);
      } else {
        return res.json({ error: 'No short URL found for the given input'});
      }
});
//---

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});