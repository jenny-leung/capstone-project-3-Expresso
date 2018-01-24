const express = require('express');
const app = express();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


const PORT = process.env.PORT || 4000;

// returns different error messages despite not changing the code

// Add middware for parsing request bodies here:
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Add middleware for handling CORS
const cors = require('cors');
app.use(cors());

// Add middleware for logging
// const morgan = require('morgan');
// app.use(morgan('dev'));

// Mount your apiRouter
const apiRouter = require('./api/api');
app.use('/api', apiRouter);

//Add middleware for error handling
const errorhandler = require('errorhandler');
app.use(errorhandler());


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
