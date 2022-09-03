const DataTypes = require("sequelize/lib/data-types");
const SQLModel = require("./sqlModel");

class ExpenseSQL extends SQLModel {
    static instance;

    static async createInstance(sequelizeContext, categoryInstance, userInstance) {
        ExpenseSQL.instance = await sequelizeContext.connection.define("Expense", {
            amount: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            registeredDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            producedDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
        });
        ExpenseSQL.instance.belongsTo(categoryInstance, { foreignKey: { allowNull: false, name: "categoryName" } });
        ExpenseSQL.instance.belongsTo(userInstance, { foreignKey: { allowNull: false, name: "userEmail" } });
    }
}

module.exports = ExpenseSQL;