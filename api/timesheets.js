const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// returns different error messages despite not changing the code

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  // get timesheet from database by id
  db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId};`, (error, timesheet) => {
    if (error) {
      throw error; //next(error);
    } else if(timesheet) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

const validateTimesheet = (req, res, next) => {
  const newTimesheet = req.body.timesheet;
  if (!newTimesheet.hours || !newTimesheet.rate || !newTimesheet.date) {
    res.sendStatus(400);
  }
  next();
};

timesheetsRouter.get('/', (req, res, next) => {
  // get all timesheets related to employee
  db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId};`, (error, timesheets) => {
    if (error) {
      throw error; //next(error);
    } else {
      res.status(200).json({ timesheets: timesheets }); // status 200
    }
  });
});

timesheetsRouter.post('/', validateTimesheet, (req, res, next) => {
  const newTimesheet = req.body.timesheet;

  db.run('INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId);', {
    $hours: newTimesheet.hours,
    $rate: newTimesheet.rate,
    $date: newTimesheet.date,
    $employeeId: req.params.employeeId
  }, function(error) {
    if (error) {
      throw error; //next(error);
    }
    db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID};`, (error, timesheet) => {
      if (error) {
        throw error; //next(error);
      }
      res.status(201).json({ timesheet: timesheet });
    });
  });
});

timesheetsRouter.put('/:timesheetId', validateTimesheet, (req, res, next) => {
  const updateTimesheet = req.body.timesheet;
  db.run(`UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = ${req.params.timesheetId};`, {
    $hours: updateTimesheet.hours,
    $rate: updateTimesheet.rate,
    $date: updateTimesheet.date,
    $employeeId: req.params.employeeId
  }, error => {
    if (error) {
      next(error);
    }
    db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId};`, (error, timesheet) => {
      if (error) {
        throw error; //next(error);
      }
      res.status(200).json({ timesheet: timesheet });
    });
  });
});


timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  db.run(`DELETE FROM Timesheet WHERE id = ${req.params.timesheetId};`, error => {
    if(error) {
      next(error);
    }
    res.sendStatus(204);
  });
});

module.exports = timesheetsRouter;
