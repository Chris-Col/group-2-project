// Load environment variables and start the server
require('dotenv').config();
const server = require('../index');

// Import required testing libraries and database tools
const chai = require('chai');
const chaiHttp = require('chai-http');
const bcrypt = require('bcryptjs');
const pgp = require('pg-promise')();

chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

// Configure database connection
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'db',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);

// Test for the /welcome route which returns a simple welcome message
describe('Server!', () => {
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// Tests for the /register endpoint
describe('Register API Tests', () => {
  // Clean up users with test usernames before running the tests
  before(async () => {
    await db.none('DELETE FROM users WHERE username IN ($1:csv)', [['testuser1', 'testuser2']]);
  });

  it('Positive: Registers a user successfully', done => {
    chai
      .request(server)
      .post('/register')
      .send({
        username: 'testuser1',
        email: 'test1@example.com',
        password: 'password123'
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Registration successful');
        done();
      });
  });

  it('Negative: Fails to register with missing password', done => {
    chai
      .request(server)
      .post('/register')
      .send({
        username: 'testuser2',
        email: 'test2@example.com'
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equals('Invalid input');
        done();
      });
  });
});

// Two additional unit tests for Part C: one negative, one positive
describe('Additional Unit Tests (Part C)', () => {
  it('Negative: Fails to register with missing email', done => {
    chai
      .request(server)
      .post('/register')
      .send({ username: 'noemailuser', password: 'pass123' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equal('Invalid input');
        done();
      });
  });

  it('Positive: GET /login returns HTML content', done => {
    chai
      .request(server)
      .get('/login')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.html;
        done();
      });
  });
});

// Tests to check rendering and redirection behavior
describe('Render & Redirect Tests', () => {
  it('should render the login page as HTML', done => {
    chai
      .request(server)
      .get('/login')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.html;
        done();
      });
  });

  it('should redirect from /test to /login', done => {
    chai
      .request(server)
      .get('/test')
      .redirects(0) // don’t follow redirects so we can test response directly
      .end((err, res) => {
        res.should.have.status(302);
        res.should.redirectTo(/\/login$/);
        done();
      });
  });
});

// Tests for the authenticated /profile route
describe('Profile Route Tests', () => {
  let agent; // Used to store cookies between requests
  const testUser = {
    username: 'testuser',
    password: 'testpass123',
  };

  // Set up a known user before running profile tests
  before(async () => {
    await db.none('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    const hashed = await bcrypt.hash(testUser.password, 10);
    await db.none('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [
      testUser.username,
      'profile@example.com',
      hashed
    ]);
  });

  // Create a new agent before each test to simulate a fresh session
  beforeEach(() => {
    agent = chai.request.agent(server);
  });

  // Clear the agent (logout simulation) after each test
  afterEach(() => {
    agent.close();
  });

  // Test for unauthenticated access — should return 401
  it('Negative: should return 401 if user is not authenticated', done => {
    chai
      .request(server)
      .get('/profile')
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.text).to.equal('Not authenticated');
        done();
      });
  });

  // Test for authenticated access — should return user data
  it('Positive: should return user profile when authenticated', async () => {
    await agent.post('/login').send(testUser); // Login and set session
    const res = await agent.get('/profile');   // Then access profile

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('username', testUser.username);
  });
});