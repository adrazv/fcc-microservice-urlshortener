/*
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns'); // <-- ADDED to validate domain
const app = express();
//---MY NOTE: Required modules to read/write files and handle file paths
const fs = require('fs');
const path = require('path');
//---

// Basic Configuration
const port = process.env.PORT || 3000;

//---MY NOTE: Creates a persistent database that saves to a JSON file instead of keeping data only in memory
// === DATABASE IN FILE ===
const dbFile = path.join(__dirname, 'db.json');

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
/*
// => the code below is not using dns.lookup
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
=======>>>>>>>>>>>>>>>>>>>>>>>>
//---CHANGE HERE: replaced regex with URL + dns.lookup validation
app.post('/api/shorturl', function(req, res) {

      const originalUrl = req.body.url;


      try {

            const parsedUrl = new URL(originalUrl);

            // only accept http or https
            if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
              return res.json({ error: 'invalid url'});
            }

            // validate if the domain exists
            dns.lookup(parsedUrl.hostname, (err) =>{

                if (err) {
                  return res.json({ error: 'invalid url' });
                }

                const shortUrl = idCounter++;
                urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });

                res.json({
                  original_url: originalUrl,
                  short_url: shortUrl
                });
            });
          } 
          
          catch {
                res.json({ error: 'invalid url' });
          }
});
//---

//---MY NOTE: (step 3) GET short URL redirect
//--- Finds the original URL by ID and redirects the user
app.get('/api/shorturl/:short_url', function(req, res) {

      const shortUrlParam = req.params.short_url;


      // ===== ADICIONA AQUI =====
      console.log('===== GET REQUEST =====');
      console.log('Requested short_url:', shortUrlParam);
      console.log('Current database:', urlDatabase);
      console.log('======================');
      // ========================


      const foundUrl = urlDatabase.find(
        item => item.short_url === parseInt(shortUrlParam)
      );

      if (foundUrl) {
        return res.redirect(301, foundUrl.original_url);
      } else {
        return res.json({ error: 'invalid url' });
      }
});
//---

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
*/
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
// Required modules to read/write files and handle file paths
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Creates a persistent database that saves to a JSON file instead of keeping data only in memory
// === DATABASE IN FILE ===
const dbFile = path.join(__dirname, 'db.json');

// Loads existing data from the JSON file when the server starts
function loadDatabase() {
  try {
    const data = fs.readFileSync(dbFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return { urls: [], counter: 1 };
  }
}

// Saves the database to the JSON file whenever data changes
function saveDatabase(db) {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

// Initialize database from file on server startup
let database = loadDatabase();
console.log('Database loaded:', database);
// ===========================

app.use(cors());

// Body parser middleware to handle POST requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Route to POST and shorten the URL
app.post('/api/shorturl', function(req, res) {

      const originalUrl = req.body.url;

      try {

            const parsedUrl = new URL(originalUrl);

            // Only accept http or https
            if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
              return res.json({ error: 'invalid url'});
            }

            // Validate if the domain exists
            dns.lookup(parsedUrl.hostname, (err) =>{

                if (err) {
                  return res.json({ error: 'invalid url' });
                }

                const shortUrl = database.counter++;
                database.urls.push({ original_url: originalUrl, short_url: shortUrl });
                saveDatabase(database); // SAVES TO FILE

                res.json({
                  original_url: originalUrl,
                  short_url: shortUrl
                });
            });
          } 
          
          catch {
                res.json({ error: 'invalid url' });
          }
});

// GET short URL and redirect to original URL
app.get('/api/shorturl/:short_url', function(req, res) {

      const shortUrlParam = req.params.short_url;
      
      const foundUrl = database.urls.find(
        item => item.short_url === parseInt(shortUrlParam)
      );

      if (foundUrl) {
        return res.redirect(foundUrl.original_url);
      } else {
        return res.json({ error: 'invalid url' });
      }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
