## 1. Description
Speakeasy
Welcome to Speakeasy! A language-learning app that features interactive minigames, user login and password authentication, as well as an easy-to-use interactive UI.

## 2. Contributors
William Skulic-Jordan/wisk4999/wisk4999@colorado.edu
Christopher Coleman/Chris-Col/chco2067@colorado.edu
Hunor Kovacs/hunorkov/huko2764@colorado.edu
Isaiah Millington/IsaiahMillington/ismi2675@colorado.edu
Patrick Markey/PatrickMarkey/pama9505@colorado.edu
Jake Gao/Hao4851/jake.gao@colorado.edu

## 3. Technology Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js
- Database: PostgreSQL
- APIs: Google Translate API
- Other Libraries: Mocha & Chai,  Bootstrap

## 4. Prerequisites to Run the Application
- Node.js and npm installed
- Docker is installed and running

## 5. Instructions on How to Run the Application Locally
1. Clone the repository.
2. Install dependencies using `npm install`.
3. Set up environment variables for database

POSTGRES_USER="postgres"
POSTGRES_PASSWORD="pwd"
POSTGRES_DB="speakeasy_db"
HOST="db"

SESSION_SECRET="secret"

4. Navigate to the ‘ProjectSourceCode’ folder in your terminal (cd ProjectSourceCode)
5. Run the application using `docker compose up`.
6. Open your browser and navigate to `http://localhost:3000`.

## 6. How to Run the Tests
- Use `npm test` to run unit and integration tests

## 7. Link to the Deployed Application
https://group-2-project-ql8w.onrender.com
