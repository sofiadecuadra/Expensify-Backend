const DataTypes = require("sequelize/lib/data-types");
const SQLModel = require("./SQLModel");
class FamilySQL extends SQLModel {
    instance;
    constructor(sequelizeContext) {
        super(sequelizeContext);
    }

    async createInstance() {
        this.instance = await this.sequelizeContext.connection.define("Family", {
            name: {
                type: DataTypes.STRING(50),
                primaryKey: true,
            },
        });
    }
}

module.exports = FamilySQL;