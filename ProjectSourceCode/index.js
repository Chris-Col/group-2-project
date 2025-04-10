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
// <!-- Section 4 : API Routes (GET) -->
// *****************************************************

// const auth = (req, res, next) => {
//   // Unauthenticated routes
//   if (req.path === '/login' || req.path === '/register') {
//     next();
//     return;
//   }

//   if (!req.session.user) {
//     // Default to login page.
//     return res.redirect('/login');
//   }
//   next();
// };

// Authentication Required

// app.use(auth);
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/register', (req, res) => {
res.render('pages/register'); 
});

app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  const hash = await bcrypt.hash(req.body.password, 10);
  // To-DO: Insert username and hashed password into the 'users' table
  username = req.body.username
  try {
  const insertQuery = `INSERT INTO users (username, pw) VALUES ('${username}', '${hash}')`;
  await db.any(insertQuery)
  res.redirect('/login');
} catch (error) {
  console.error('Error during registration:', error);
  res.redirect('/register');
}
});

app.get('/login', (req, res) => {
res.render('pages/login'); 
});
app.post('/login', async (req, res) => {
const { username, password } = req.body;
console.log('Login attempt for:', username);
try {
    query = `SELECT pw FROM users WHERE username = '${username}'`
    let results = await db.any(query)
    if (results.length === 0) {
      res.status(404).send('User not Found');
      return;
    }
    console.log(results)
    const database_password = results[0].pw
    const match = await bcrypt.compare(password, database_password);
    console.log('Password match:', match);
    if (!match) {
        return res.render('pages/login', { message: 'Incorrect username or password.' });
    }
    else{
    req.session.user = username;
    req.session.save(() => {
        console.log('Session saved. Redirecting to /games');
        res.redirect('/games');
    })};
    app.get('/games', (req, res) => {
      res.render('pages/games'); 
      });
      app.get('/welcome', (req, res) => {
        res.render('pages/welcome'); 
        });
} catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Internal Server Error');
}
});

// games page
app.get('/games', (req, res) => {
  res.render('pages/games', {target_language: req.query.lang || 'en'});
});

// pages for individual games
app.get('/game1', (req, res) => {
  res.render('pages/Game1'); 
});

app.get('/game2', (req, res) => {
  res.render('pages/Game2'); 
});

app.get('/game3', (req, res) => {
  res.render('pages/Game3'); 
});

app.get('/game4', (req, res) => {
  res.render('pages/Game4'); 
});

app.get('/game5', (req, res) => {
  res.render('pages/Game5'); 
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out.');
    }
    res.render('pages/logout', { message: 'Logged out successfully' });
  });
});
app.listen(3000);
console.log('Hello World');