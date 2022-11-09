const DataTypes = require("sequelize/lib/data-types");
const SQLModel = require("./sqlModel");

class UserSQL extends SQLModel {
    instance;
    connection;

    constructor(sequelizeContext, familyInstance) {
        (async () => {
            super();
            this.instance = await sequelizeContext.connection.define("User", {
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
                expoToken: {
                    type: DataTypes.STRING(100),
                    required: false,
                },
            });
            this.instance.belongsTo(familyInstance, { foreignKey: { allowNull: false, name: "familyId" } });
            this.connection = sequelizeContext.connection;
            return this;
        })();
    }
}

module.exports = UserSQL;
