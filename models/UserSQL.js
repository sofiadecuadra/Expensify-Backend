const DataTypes = require("sequelize/lib/data-types");
const SQLModel = require("./sqlModel");

class UserSQL extends SQLModel {
    static instance;

    static async createInstance(sequelizeContext, familyInstance) {
        UserSQL.instance = await sequelizeContext.connection.define("User", {
            name: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(50),
                allowNull: false,
                primaryKey: true,
            },
            role: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        });
        UserSQL.instance.belongsTo(familyInstance, { foreignKey: { allowNull: false, name: "familyName" } });
    }
}

module.exports = UserSQL;