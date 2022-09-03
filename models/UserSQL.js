const DataTypes = require("sequelize/lib/data-types");
// const Family = require("./Family");
const SQLModel = require("./SQLModel");

class UserSQL extends SQLModel {
    instance;
    constructor(sequelizeContext, familyInstance) {
        super(sequelizeContext);
        this.familyInstance = familyInstance;
    }

    async createInstance() {
        this.instance = await this.sequelizeContext.connection.define("User", {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            role: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        });
        this.instance.belongsTo(this.familyInstance, { foreignKey: { allowNull: false, name: "name" } });
    }
}

module.exports = UserSQL;