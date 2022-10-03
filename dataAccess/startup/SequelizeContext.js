const dotenv = require("dotenv");
dotenv.config();
const { QueryTypes, Sequelize } = require("sequelize");

class SequelizeContext {
    connection;

    constructor(port) {
        const dbHost = process.env.MYSQL_DB_HOST;
        const dbPort = port ? port : process.env.MYSQL_DB_PORT;
        const dbUser = process.env.MYSQL_DB_USER;
        const dbPassword = process.env.MYSQL_DB_PASSWORD;
        const dbName = process.env.MYSQL_DB_NAME;

        this.connection = new Sequelize(`mysql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`, {
            logging: false,
            pool: {
                max: 500,
                min: 0,
                idle: 200000,
                acquire: 1000000,
            },
            define: {
                timestamps: false,
            },
        });
        try {
            this.connection.authenticate();
            console.log("Connection has been established successfully.");
        } catch (error) {
            console.error("error");
        }
    }

    async setMaxConnections() {
        await this.connection.query(`set global max_connections = 15000;`, { type: QueryTypes.SET });
    }
}

module.exports = SequelizeContext;