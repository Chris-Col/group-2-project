// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/src/views/layouts',
  partialsDir: __dirname + '/src/views/partials',
});

const dbConfig = {
  host: 'db',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(express.static('public'));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('partials/login');
});

app.get('/register', (req, res) => {
  res.render('partials/register');
});

app.get('/games', (req, res) => {
  res.render('partials/games');
});

app.get('/Game1', (req, res) => {
  res.render('partials/Game1');
});

app.get('/Game2', (req, res) => {
  res.render('partials/Game2');
});

app.get('/Game3', (req, res) => {
  res.render('partials/Game3');
});

app.get('/Game4', (req, res) => {
  res.render('partials/Game4');
});

app.get('/Game5', (req, res) => {
  res.render('partials/Game5');
});

app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    // Hash the password
    const hash = await bcrypt.hash(password, 10);

    // Insert into users table
    await db.none(
      'INSERT INTO users(username, email, pw) VALUES($1, $2, $3)',
      [username, email, hash]
    );

    return res.status(200).json({ message: 'User registered' });
  } catch (err) {
    // Unique violation or other DB error
    return res.status(400).json({ message: 'Registration failed' });
  }
});


// *****************************************************
// <!-- Section 5 : Server Start & Export -->
// *****************************************************

const PORT = process.env.PORT || 3000;
// Start the server and export the instance for tests
module.exports = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
