const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = require('./timesheets.js');

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  // get employee from database by id
  db.get(`SELECT * FROM Employee WHERE id = ${employeeId};`, (error, employee) => {
    if (error) {
      throw error; //next(error);
    } else if(employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

const validateEmployee = (req, res, next) => {
  const newEmployee = req.body.employee;
  if (!newEmployee.name || !newEmployee.position || !newEmployee.wage) {
    res.sendStatus(400);
  }
  next();
};


employeesRouter.get('/', (req, res, next) => {
  // get all currently employed employees
  db.all('SELECT * FROM Employee WHERE is_current_employee = 1;', (error, employees) => {
    if (error) {
      throw error; //next(error);
    } else {
      res.status(200).json({ employees: employees }); // status 200
    }
  });
});


employeesRouter.post('/', validateEmployee, (req, res, next) => {
  const newEmployee = req.body.employee;
  // if isCurrentEmployee not set to 0, set to 1
  const isCurrentEmployee = newEmployee.isCurrentEmployee === 0 ? 0 : 1;

  db.run('INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee);', {
    $name: newEmployee.name,
    $position: newEmployee.position,
    $wage: newEmployee.wage,
    $isCurrentEmployee: isCurrentEmployee
  }, function(error) {
    if (error) {
      throw error; //next(error);
    }
    db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (error, employee) => {
      if (error) {
        throw error; //next(error);
      }
      res.status(201).json({ employee: employee });
    });
  });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({ employee: req.employee });
});

employeesRouter.put('/:employeeId', validateEmployee, (req, res, next) => {
  const updateEmployee = req.body.employee;
  // if isCurrentEmployee not set to 0, set to 1
  const isCurrentEmployee = updateEmployee.isCurrentEmployee === 0 ? 0 : 1;
  db.run(`UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = ${req.params.employeeId};`, {
    $name: updateEmployee.name,
    $position: updateEmployee.position,
    $wage: updateEmployee.wage,
    $isCurrentEmployee: isCurrentEmployee
  }, error => {
    if (error) {
      throw error; //next(error);
    }
    db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId};`, (error, employee) => {
      if (error) {
        throw error; //next(error);
      }
      res.status(200).json({ employee: employee });
    });
  });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  db.run(`UPDATE Employee SET is_current_employee = 0 WHERE id = ${ req.params.employeeId };`, error => {
    if (error) {
      throw error; //next(error);
    }
    db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId};`, (error, employee) => {
      if (error) {
        throw error; //next(error);
      }
      res.status(200).json({ employee: employee });
    });
  });
});

module.exports = employeesRouter;
