const DataTypes = require("sequelize/lib/data-types");
const SQLModel = require("./sqlModel");

class FamilySQL extends SQLModel {
    static instance;

    static async createInstance(sequelizeContext) {
        FamilySQL.instance = await sequelizeContext.connection.define("Family", {
            name: {
                type: DataTypes.STRING(50),
                primaryKey: true,
            },
        });
    }
}

module.exports = FamilySQL;