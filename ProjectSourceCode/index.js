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
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/src/views/layouts',
  partialsDir: __dirname + '/src/views/partials',
});

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
app.use(express.static('public'));

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

app.get('/', (req, res) => {
  res.redirect('partials/login'); // Redirect user to the login page
});

app.get('/login', (req, res) => {
  res.render('partials/login'); // Redirect user to the login page
});

app.get('/register', (req, res) => {
  res.render('partials/register'); // Redirect user to the register page
});

app.get('/games', (req, res) => {
  res.render('partials/games'); // Redirect user to the games page
});

app.get('/Game1', (req, res) => {
  res.render('partials/Game1'); // Redirect user to the Game1 page
});

app.get('/Game2', (req, res) => {
  res.render('partials/Game2'); // Redirect user to the Game2 page
});

app.get('/Game3', (req, res) => {
  res.render('partials/Game3'); // Redirect user to the Game3 page
});

app.get('/Game4', (req, res) => {
  res.render('partials/Game4'); // Redirect user to the Game4 page
});

app.get('/Game5', (req, res) => {
  res.render('partials/Game5'); // Redirect user to the Game5 page
});

app.get('/welcome', (req, res) => {
  res.render('partials/welcome'); // Redirect user to the welcome page
});

app.get('/logout', (req, res) => {
  res.render('partials/logout'); // Redirect user to the logout page
});

app.listen(3000);
console.log('Hello Worldo');
