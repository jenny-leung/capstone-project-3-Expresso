const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// returns different error messages despite not changing the code

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  // get menuItem from database by id
  db.get(`SELECT * FROM MenuItem WHERE id = ${menuItemId}`, (error, menuItem) => {
    if (error) {
      next(error);
    } else if(menuItem) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuItemsRouter.get('/', (req, res, next) => {
  // get all menuItems related to menu
  db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId};`, (error, menuItems) => {
    if (error) {
      throw error; //next(error);
    } else if(menuItems) {
      res.status(200).json({ menuItems: menuItems }); // status 200
    } else {
      res.sendStatus(404);
    }
  });
});

const validateMenuItem = (req, res, next) => {
  const newMenuItem = req.body.menuItem;
  if (!newMenuItem.name || !newMenuItem.inventory || !newMenuItem.price || !newMenuItem.menuId) {
    res.sendStatus(400);
  }
  next();
};

menuItemsRouter.post('/', validateMenuItem, (req, res, next) => {
  const newMenuItem = req.body.menuItem;
  db.run('INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId);', {
    $name: newMenuItem.name,
    $description: newMenuItem.description,
    $inventory: newMenuItem.inventory,
    $price: newMenuItem.price,
    $menuId: req.params.menuId
  }, function(error) {
    if (error) {
      throw error; //next(error);
    }
    db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID};`, (error, menuItem) => {
      if (error) {
        throw error; //next(error);
      }
      res.status(201).json({ menuItem: menuItem });
    });
  });
});

menuItemsRouter.put('/:menuItemId', validateMenuItem, (req, res, next) => {
  const updateMenuItem = req.body.menuItem;
  db.run(`UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = ${req.params.menuItemId};`, {
    $name: updateMenuItem.name,
    $description: updateMenuItem.description,
    $inventory: updateMenuItem.inventory,
    $price: updateMenuItem.price,
    $menuId: req.params.menuId
  }, error => {
    if (error) {
      next(error);
    }
    db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId};`, (error, menuItem) => {
      if (error) {
        throw error; //next(error);
      }
      res.status(200).json({ menuItem: menuItem });
    });
  });
});


menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId};`, error => {
    if(error) {
      next(error);
    }
    res.sendStatus(204);
  });
});

module.exports = menuItemsRouter;
