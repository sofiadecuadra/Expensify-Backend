const DataTypes = require("sequelize/lib/data-types");
const SQLModel = require("./sqlModel");

class CategorySQL extends SQLModel {
    instance;

    static async createInstance(sequelizeContext, familyInstance) {
        CategorySQL.instance = await sequelizeContext.connection.define("Category", {
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
        CategorySQL.instance.belongsTo(familyInstance, {
            foreignKey: {
                name: "categoryName",
                allowNull: false,
            },
            primaryKey: true,
        });
    }
}

module.exports = CategorySQL;