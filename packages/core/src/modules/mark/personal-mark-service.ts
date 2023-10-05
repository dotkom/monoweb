import { type Mark, type PersonalMark, type User } from "@dotkomonline/types";
import { add, compareAsc, isBefore, isWithinInterval, set } from "date-fns";

import { NotFoundError } from "../../errors/errors";
import { type Cursor } from "../../utils/db-utils";
import { type MarkService } from "./mark-service";
import { type PersonalMarkRepository } from "./personal-mark-repository";

export interface PersonalMarkService {
    addPersonalMarkToUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark>;
    calculateExpiryDate(marks: Array<{ createdAt: Date; duration: number }>): Date | null;
    getExpiryDateForUserId(userId: User["id"]): Promise<Date | null>;
    getMarksForUserId(userId: User["id"], take: number, cursor?: Cursor): Promise<Array<Mark>>;
    getPersonalMarksForUserId(userId: User["id"], take: number, cursor?: Cursor): Promise<Array<PersonalMark>>;
    removePersonalMarkFromUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark>;
}

export class PersonalMarkServiceImpl implements PersonalMarkService {
    public constructor(
        private readonly personalMarkRepository: PersonalMarkRepository,
        private readonly markService: MarkService
    ) {}

    public async addPersonalMarkToUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark> {
        // Verify the mark exists
        await this.markService.getMark(markId);

        const personalMark = await this.personalMarkRepository.addToUserId(userId, markId);

        if (!personalMark) {
            throw new NotFoundError("PersonalMark could not be created");
        }

        return personalMark;
    }

    public adjustDateIfEndingInHoliday(date: Date): Date {
        let additionalDays = 0;

        if (
            isWithinInterval(date, { end: new Date(date.getFullYear(), 7, 15), start: new Date(date.getFullYear(), 5) })
        ) {
            additionalDays = 75;
        } else if (date.getMonth() === 11) {
            additionalDays = 45;
        } else if (date.getMonth() === 0 && date.getDate() < 15) {
            additionalDays = 45;
        }

        return add(date, { days: additionalDays });
    }

    // Holy grail of magic numbers -BraAge
    public adjustDateIfStartingInHoliday(date: Date): Date {
        let mutableDate = date;

        if (
            isWithinInterval(date, { end: new Date(date.getFullYear(), 7, 15), start: new Date(date.getFullYear(), 5) })
        ) {
            mutableDate = set(date, { date: 15, month: 7 });
        } else if (date.getMonth() === 11) {
            mutableDate = set(date, { date: 15, month: 0, year: date.getFullYear() + 1 });
        } else if (date.getMonth() === 0 && date.getDate() < 15) {
            mutableDate = set(date, { date: 15, month: 0 });
        }

        return mutableDate;
    }

    public calculateExpiryDate(marks: Array<{ createdAt: Date; duration: number }>): Date | null {
        const currentTime = new Date();
        let endDate: Date | null = null;
        const orderedMarks = marks.sort((a, b) => compareAsc(a.createdAt, b.createdAt));

        for (const mark of orderedMarks) {
            const date =
                endDate && isBefore(mark.createdAt, endDate)
                    ? new Date(this.adjustDateIfStartingInHoliday(endDate).getTime())
                    : new Date(this.adjustDateIfStartingInHoliday(mark.createdAt).getTime());

            date.setDate(date.getDate() + mark.duration);

            endDate = this.adjustDateIfEndingInHoliday(date);
        }

        if (!endDate || endDate < currentTime) {
            return null;
        }

        return endDate;
    }

    public async getExpiryDateForUserId(userId: User["id"]): Promise<Date | null> {
        const personalMarks = await this.personalMarkRepository.getAllByUserId(userId, 1000);
        const marks = await Promise.all(personalMarks.map(async (mark) => this.markService.getMark(mark.markId)));
        const expiryDate = this.calculateExpiryDate(marks);

        return expiryDate;
    }

    public async getMarksForUserId(userId: User["id"], take: number, cursor?: Cursor): Promise<Array<Mark>> {
        const personalMarks = await this.personalMarkRepository.getAllMarksByUserId(userId, take, cursor);

        return personalMarks;
    }

    public async getPersonalMarksForUserId(
        userId: User["id"],
        take: number,
        cursor?: Cursor
    ): Promise<Array<PersonalMark>> {
        const personalMarks = await this.personalMarkRepository.getAllByUserId(userId, take, cursor);

        return personalMarks;
    }

    public async isUserMarked(userId: User["id"]): Promise<boolean> {
        return (await this.getExpiryDateForUserId(userId)) !== null;
    }

    public async removePersonalMarkFromUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark> {
        // Verify the mark exists
        await this.markService.getMark(markId);

        const personalMark = await this.personalMarkRepository.removeFromUserId(userId, markId);

        if (!personalMark) {
            throw new NotFoundError("PersonalMark could not be removed");
        }

        return personalMark;
    }
}
