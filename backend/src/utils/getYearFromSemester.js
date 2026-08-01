function getYearFromSemester(semester) {
    switch (semester) {
        case 1:
        case 2:
            return "First Year";

        case 3:
        case 4:
            return "Second Year";

        case 5:
        case 6:
            return "Third Year";

        case 7:
        case 8:
            return "Fourth Year";

        default:
            throw new Error("Invalid semester");
    }
}

module.exports = getYearFromSemester;