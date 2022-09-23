const config = require("config");
const { QueryTypes, Sequelize } = require("sequelize");

class SequelizeContext {
    connection;

    constructor(port) {
        const dbHost = config.get("MYSQL_DB.host");
        let dbPort = port ? port : config.get("MYSQL_DB.port");
        const dbUser = config.get("MYSQL_DB.user");
        const dbPassword = config.get("MYSQL_DB.password");
        const dbName = config.get("MYSQL_DB.name");

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