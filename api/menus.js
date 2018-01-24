const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require('./menu-items.js');

// returns different error messages despite not changing the code

menusRouter.param('menuId', (req, res, next, menuId) => {
  // get menu from database by id
  db.get(`SELECT * FROM Menu WHERE id = ${menuId};`, (error, menu) => {
    if (error) {
      throw error; //next(error);
    } else if(menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);




menusRouter.get('/', (req, res, next) => {
  // get all current menus
  db.all('SELECT * FROM Menu;', (error, menus) => {
    if (error) {
      throw error; //next(error);
    } else {
      res.status(200).json({ menus: menus }); // status 200
    }
  });
});

const validateMenu = (req, res, next) => {
  const newMenu = req.body.menu;
  if (!newMenu.title) {
    res.sendStatus(400);
  }
  next();
};

menusRouter.post('/', validateMenu, (req, res, next) => {
  const newMenu = req.body.menu;
  db.run('INSERT INTO Menu (title) VALUES ($title);', {
    $title: newMenu.title
  }, function(error) {
    if (error) {
      throw error; //next(error);
    }
    db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (error, menu) => {
      if (error) {
        throw error; //next(error);
      }
      res.status(201).json({ menu: menu });
    });
  });
});

menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({ menu: req.menu });
});

menusRouter.put('/:menuId', validateMenu, (req, res, next) => {
  const updateMenu = req.body.menu;
  db.run(`UPDATE Menu SET title = $title WHERE id = ${req.params.menuId};`, {
    $title: updateMenu.title
  }, error => {
    if (error) {
      throw error; //next(error);
    }
    db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId};`, (error, menu) => {
      if (error) {
        throw error; //next(error);
      }
      res.status(200).json({ menu: menu });
    });
  });
});
menusRouter.delete('/:menuId', (req, res, next) => {
  db.get(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId};`, (error, menuItem) => {
    if (error) {
      throw error; //next(error);
    } else if(!menuItem) {
      db.run(`DELETE FROM Menu WHERE id = ${req.params.menuId};`, error => {
        if(error) {
          throw error; //next(error);
        } else {
          res.sendStatus(204);
        }
      });
    } else {
      res.sendStatus(400);
    }
  });
});

module.exports = menusRouter;
