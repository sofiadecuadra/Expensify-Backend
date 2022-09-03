const DataTypes = require("sequelize/lib/data-types");
const SQLModel = require("./SQLModel");

class ExpenseSQL extends SQLModel {
    instance;

    constructor(sequelizeContext, categoryInstance, userInstance) {
        super(sequelizeContext);
        this.categoryInstance = categoryInstance;
        this.userInstance = userInstance;
    }

    async createInstance() {
        this.instance = await this.sequelizeContext.connection.define("Expense", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
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
        this.instance.belongsTo(this.categoryInstance, { foreignKey: { allowNull: false, name: "name" } });
        this.instance.belongsTo(this.userInstance, { foreignKey: { allowNull: false, name: "id" } });
    }
}

module.exports = ExpenseSQL;