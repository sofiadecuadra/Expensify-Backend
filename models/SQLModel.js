class SQLModel {
    constructor(sequelizeContext) {
        this.sequelizeContext = sequelizeContext;
    }
    async createInstance() {}
}

module.exports = SQLModel;