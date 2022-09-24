const express = require("express");
const { FamilySQL, CategorySQL, ExpenseSQL, UserSQL } = require("./dataAccess/models");
const HealthCheckLogic = require("./businessLogic/healthCheckLogic");
const config = require("config");
const dbPort = config.get("MYSQL_DB.port");

(async () => {
    const SequelizeContext = require("./dataAccess/startup/SequelizeContext");
    const sequelizeContext = new SequelizeContext(dbPort);
    await FamilySQL.createInstance(sequelizeContext);
    await UserSQL.createInstance(sequelizeContext, FamilySQL.instance);
    await CategorySQL.createInstance(sequelizeContext, FamilySQL.instance);
    await ExpenseSQL.createInstance(sequelizeContext, CategorySQL.instance, UserSQL.instance);
    await sequelizeContext.connection
        .sync()
        .then(() => console.log("Database is connected!"))
        .catch((err) => console.error(err, "Something went wrong, database is not connected!"));
    HealthCheckLogic.connection = sequelizeContext.connection;
})();

const Server = require("./server");
const server = new Server();
server.start();
server.config();
