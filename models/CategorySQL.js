const DataTypes = require("sequelize/lib/data-types");
const SQLModel = require("./sqlModel");

class CategorySQL extends SQLModel {
    instance;

    static async createInstance(sequelizeContext, familyInstance) {
        CategorySQL.instance = await sequelizeContext.connection.define(
            "Category", {
                name: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
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
                active: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                },
            }, {
                uniqueKeys: {
                    unique_category_family: {
                        fields: ["name", "familyId"],
                    },
                },
            }
        );
        CategorySQL.instance.belongsTo(familyInstance, {
            foreignKey: {
                name: "familyId",
                allowNull: false,
            },
            primaryKey: true,
        });
    }
}

module.exports = CategorySQL;