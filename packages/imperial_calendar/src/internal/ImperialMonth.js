export class ImperialMonth {
    month;
    constructor(month) {
        this.month = month;
    }
    days() {
        return this.month % 6 === 0 ? 27 : 28;
    }
}
