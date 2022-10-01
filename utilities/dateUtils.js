function parseDate(myDateStr) {
    myDateStr = myDateStr.toString();
    if (myDateStr.includes("T") && myDateStr.charAt(myDateStr.length - 1)) {
        return new Date(myDateStr);
    }
    const [dateComponents, timeComponents] = myDateStr.split(" ");

    const [year, month, day] = dateComponents.split("-");
    const [hours, minutes, seconds] = timeComponents.split(":");

    const date = new Date(+year, +month - 1, +day, +hours, +minutes, +seconds);
    return date;
}

module.exports = parseDate;