const FamilySql = require('../models/familySQL');

class FamilyController {

    static async createNewFamily(name) {
        try {
            const family = await FamilySql.instance.create({ name });
            return family;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = FamilyController;