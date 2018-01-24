const express = require('express');
const apiRouter = express.Router();

// returns different error messages despite not changing the code

const employeesRouter = require('./employees.js');
apiRouter.use('/employees', employeesRouter);

const menusRouter = require('./menus.js');
apiRouter.use('/menus', menusRouter);

module.exports = apiRouter;
