const express = require("express");
const { FamilySQL, CategorySQL, ExpenseSQL, UserSQL } = require("./models");
const config = require("config");
const apiPort = config.get("API_PORT");
const dbPort = config.get("MYSQL_DB.port");
const app = express();

(async() => {
    const SequelizeContext = require("./startup/SequelizeContext");
    const sequelizeContext = new SequelizeContext(dbPort);
    const familySQL = new FamilySQL(sequelizeContext);
    await familySQL.createInstance();
    const userSQL = new UserSQL(sequelizeContext, familySQL.instance);
    await userSQL.createInstance();
    const categorySQL = new CategorySQL(sequelizeContext, familySQL.instance);
    await categorySQL.createInstance();
    const expenseSQL = new ExpenseSQL(sequelizeContext, categorySQL.instance, userSQL.instance);
    await expenseSQL.createInstance();
    await sequelizeContext.connection
        .sync()
        .then(() => console.log("Database is connected!"))
        .catch((err) => console.error(err, "Something went wrong, database is not connected!"));
})();

const server = app.listen(apiPort, () => console.log(`Listening on port ${apiPort}...`));

module.exports = server;