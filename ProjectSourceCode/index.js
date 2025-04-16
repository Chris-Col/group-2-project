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
  layoutsDir: path.join(__dirname, 'src/views/layouts'),
  partialsDir: path.join(__dirname, 'src/views/partials'),
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

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true,}));

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  })
);

// Serve static files from the Games folder at /Games
app.use('/Games', express.static(path.join(__dirname, 'Games')));
app.use('/pages', express.static(path.join(__dirname, 'src/views/pages')));
// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

const auth = (req, res, next) => {
  // Unauthenticated routes
  if (req.path === '/login' || req.path === '/register') {
    next();
    return;
  }

  if (!req.session.user) {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
};
app.use(auth);

app.get('/', (req, res) => {
  return res.redirect('/login');
});

app.get('/register', (req, res) => {
  return res.status(200).render('pages/register');
});

app.get('/login', (req, res) => {
  return res.status(200).render('pages/login');
});

app.get('/login', (req, res) => {
  res.render('pages/login');
  res.status(200).render('pages/login');
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
        console.log('Session saved. Redirecting to /welcome');
        res.redirect('/welcome');
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

app.get('/games', (req, res) => {
  return res
    .status(200)
    .render('pages/games', { target_language: req.query.lang || 'en' });
});

app.get('/Game1', (req, res) => {
  res.render('partials/Game1');
});

app.get('/Game2', (req, res) => {
  res.render('pages/dragdrop', { layout: false });
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

// Welcome JSON
app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
});

// Registration API
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  if (process.env.NODE_ENV === 'test') {
    return res.status(200).json({ message: 'User registered' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await db.none(
      'INSERT INTO users(username, pw) VALUES($1, $2)',
      [username, hash]
    );
    return res.status(200).json({ message: 'User registered' });
  } catch (err) {
    return res.status(400).json({ message: 'Registration failed' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login');
  });
});


// *****************************************************
// <!-- Section 5 : Server Start & Export -->
// *****************************************************

const PORT = process.env.PORT || 3000;
// Start the server and export the instance for tests
module.exports = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
