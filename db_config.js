const Sequelize = require("sequelize");
require("dotenv").config();

const database = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const port = process.env.DB_PORT;
const db_server = process.env.DB_SERVER;

const sequelize = new Sequelize(
  `postgres://${username}:${password}@${db_server}:${port}/${database}`
);

const connect = async () => {
  await sequelize
    .authenticate()
    .then(() => {
      console.log("Connection has been established successfully.");
    })
    .catch(err => {
      console.log("Unable to connect to the database:", err.message);
    });
};
const db = {
  sequelize: sequelize,
  connect
};

module.exports = db;
