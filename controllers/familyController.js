const FamilySql = require('../models/familySQL');
const createKey = require('../library/jwtSupplier');

class FamilyController {

    static async createNewFamily(name) {
        try {
            const apiKey = await createApiKey(name);
            const family = await FamilySql.instance.create({ name, apiKey });
            return family;
        } catch (err) {
            console.log(err);
        }
    }

    static async updateApiKey(req, res, next) {
        try {
            const { familyId } = req.params;
            const family = await FamilySql.instance.findOne({ where: { id: familyId } });
            const apiKey = await FamilyController.createApiKey(family.name);
            await FamilySql.instance.update({ apiKey }, { where: { id: familyId } });
            res.status(200).json({ message: 'Family API KEY updated successfully' });
        } catch (err) {
            console.log(err.message);
            next(err);
        }
    }

    static async createApiKey(familyName) {
        const todayDate = new Date();
        const data = { createdAt: todayDate, name: familyName };
        const apiKey = await createKey({ data });
        return apiKey;

    }

}

module.exports = FamilyController;