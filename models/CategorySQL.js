const DataTypes = require("sequelize/lib/data-types");
const SQLModel = require("./SQLModel");

class CategorySQL extends SQLModel {
    instance;

    constructor(sequelizeContext, familyInstance) {
        super(sequelizeContext);
        this.familyInstance = familyInstance;
    }

    async createInstance() {
        this.instance = await this.sequelizeContext.connection.define("Category", {
            name: {
                type: DataTypes.STRING(50),
                primaryKey: true,
            },
            description: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            image: {
                type: DataTypes.STRING(150),
                allowNull: false,
            },
            monthlyBudget: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        });
        this.instance.belongsTo(this.familyInstance, {
            foreignKey: {
                name: "name",
                allowNull: false,
            },
            primaryKey: true,
        });
    }
}

module.exports = CategorySQL;