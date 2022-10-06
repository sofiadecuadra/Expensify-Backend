const DataTypes = require('sequelize/lib/data-types');
const SQLModel = require("./sqlModel");

class ExpenseSQL extends SQLModel {

    static instance;
    constructor(sequelizeContext, categoryInstance, userInstance) {
        (async() => {
            super();
            this.instance = await sequelizeContext.connection.define("Expense", {
                amount: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                registeredDate: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                producedDate: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
            });
            this.instance.belongsTo(categoryInstance, { foreignKey: { allowNull: false, name: "categoryId" } });
            this.instance.belongsTo(userInstance, { foreignKey: { allowNull: false, name: "userId" } });
            return this;
        })();
    }
}

module.exports = ExpenseSQL;