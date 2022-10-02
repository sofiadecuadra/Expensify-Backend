const DataTypes = require("sequelize/lib/data-types");
const SQLModel = require("./sqlModel");

class FamilySQL extends SQLModel {
    instance;

    constructor(sequelizeContext) {
        (async() => {
            super();
            this.instance = await sequelizeContext.connection.define("Family", {
                name: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    unique: true,
                },
                apiKey: {
                    type: DataTypes.STRING(300),
                    allowNull: false,
                    unique: true,
                },
            });
            return this;
        })();
    }
}

module.exports = FamilySQL;