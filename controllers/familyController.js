const FamilySql = require('../models/familySQL');

class FamilyController {

    static async createNewFamily(name) {
        try {
            await FamilySql.instance.create({ name });
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = FamilyController;