'use strict';

const { start, app, sequelizeDatabase } = require('./src/server');

// both imports for models are equivalent aka "work the same "
// const { sequelizeDatabase } = require('./src/models/index');

sequelizeDatabase.sync()
  .then(() => {
    console.log('Successful Connection!');
    start(3001);
  })
  .catch(e => console.error(e));
