// ==========================
// Load Environment Variables & Initialize Express App
// ==========================
require('dotenv').config();
const express = require('express');
const app = express();

// ==========================
// Import Core Libraries
// ==========================
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const axios = require('axios'); // Optional: For external HTTP requests if needed

// ==========================
// Configure Handlebars Templating Engine
// ==========================
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: path.join(__dirname, 'src', 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'src', 'views', 'partials'),
});

// ==========================
// Configure PostgreSQL Database
// ==========================
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'db',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);

// Test DB connection on startup
db.connect()
  .then(obj => {
    console.log('Database connection successful');
    obj.done(); // release connection
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// ==========================
// Express App Configuration
// ==========================
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

// ==========================
// ROUTES
// ==========================

// GET /welcome — simple API test route
app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
});

// GET /login — renders login page from views/login.hbs
app.get('/login', (req, res) => {
  res.status(200).render('login');
});

// GET /test — used to verify redirect behavior
app.get('/test', (req, res) => {
  console.log('✅ /test route hit, redirecting to /login...');
  res.redirect(302, '/login');
});

// POST /register — handles user signup with hashed password
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.none(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, hashedPassword]
    );
    res.status(200).json({ message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// POST /login — simple login route that sets session
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    req.session.user = { username: user.username };
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET /profile — protected route; only available if user is logged in
app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Not authenticated');
  }

  res.status(200).json({ username: req.session.user.username });
});

// ==========================
// Start Server (only if run directly)
// ==========================
if (require.main === module) {
  app.listen(3000, () => {
    console.log('Hello Worldo');
  });
}

// Export the app for testing
module.exports = app;