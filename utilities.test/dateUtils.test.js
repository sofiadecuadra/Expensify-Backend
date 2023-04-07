const parseDate = require("../utilities/dateUtils");

describe("dateUtils", () => {
    describe("parseDate", () => {
        test("should return", () => {
            const res = parseDate("2021-10-10 10:10:10");
            expect(res).toEqual(new Date(2021, 9, 10, 10, 10, 10));
        });
    });
});
