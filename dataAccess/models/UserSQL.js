const DataTypes = require("sequelize/lib/data-types");
const SQLModel = require("./sqlModel");

class UserSQL extends SQLModel {
    static instance;
    static connection;

    static async createInstance(sequelizeContext, familyInstance) {
        UserSQL.instance = await sequelizeContext.connection.define("User", {
            name: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(50),
                allowNull: false,
                allowNull: false,
                unique: true,
            },
            role: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING(100),
                required: true,
            },
        });
        UserSQL.instance.belongsTo(familyInstance, { foreignKey: { allowNull: false, name: "familyId" } });
        UserSQL.connection = sequelizeContext.connection;
    }
}

module.exports = UserSQL;