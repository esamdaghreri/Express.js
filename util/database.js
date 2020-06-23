// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: '....',
//     database: '....',
//     password: '....'
// });

// module.exports = pool.promise();


// Using sequelize;

const Sequelize = require('sequelize');
const sequelize = new Sequelize('....', '....', '....', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;