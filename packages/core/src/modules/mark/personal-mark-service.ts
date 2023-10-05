import { type Mark, type PersonalMark, type User } from "@dotkomonline/types";
import { add, compareAsc, isBefore, isWithinInterval, set } from "date-fns";

import { type Cursor } from "../../utils/db-utils";
import { type MarkService } from "./mark-service";
import { NotFoundError } from "../../errors/errors";
import { type PersonalMarkRepository } from "./personal-mark-repository";

export interface PersonalMarkService {
    getPersonalMarksForUserId(userId: User["id"], take: number, cursor?: Cursor): Promise<Array<PersonalMark>>;
    getMarksForUserId(userId: User["id"], take: number, cursor?: Cursor): Promise<Array<Mark>>;
    addPersonalMarkToUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark>;
    removePersonalMarkFromUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark>;
    getExpiryDateForUserId(userId: User["id"]): Promise<Date | null>;
    calculateExpiryDate(marks: Array<{ createdAt: Date; duration: number }>): Date | null;
}

export class PersonalMarkServiceImpl implements PersonalMarkService {
    constructor(
        private readonly personalMarkRepository: PersonalMarkRepository,
        private readonly markService: MarkService
    ) {}

    async getPersonalMarksForUserId(userId: User["id"], take: number, cursor?: Cursor): Promise<Array<PersonalMark>> {
        const personalMarks = await this.personalMarkRepository.getAllByUserId(userId, take, cursor);

        return personalMarks;
    }

    async getMarksForUserId(userId: User["id"], take: number, cursor?: Cursor): Promise<Array<Mark>> {
        const personalMarks = await this.personalMarkRepository.getAllMarksByUserId(userId, take, cursor);

        return personalMarks;
    }

    async addPersonalMarkToUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark> {
        const mark = await this.markService.getMark(markId);

        if (!mark) {
            throw new NotFoundError(`Mark with ID:${markId} not found`);
        }
        const personalMark = await this.personalMarkRepository.addToUserId(userId, markId);

        if (!personalMark) {
            throw new NotFoundError("PersonalMark could not be created");
        }

        return personalMark;
    }

    async removePersonalMarkFromUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark> {
        const personalMark = await this.personalMarkRepository.removeFromUserId(userId, markId);

        if (!personalMark) {
            throw new NotFoundError("PersonalMark could not be removed");
        }

        return personalMark;
    }

    async getExpiryDateForUserId(userId: User["id"]): Promise<Date | null> {
        const personalMarks = await this.personalMarkRepository.getAllByUserId(userId, 1000);
        const marks = await Promise.all(personalMarks.map(async (mark) => this.markService.getMark(mark.markId)));
        const expiryDate = this.calculateExpiryDate(marks);

        return expiryDate;
    }

    async isUserMarked(userId: User["id"]): Promise<boolean> {
        return (await this.getExpiryDateForUserId(userId)) !== null;
    }

    adjustDateIfStartingInHoliday(date: Date): Date {
        if (
            isWithinInterval(date, { start: new Date(date.getFullYear(), 5), end: new Date(date.getFullYear(), 7, 15) })
        ) {
            date = set(date, { month: 7, date: 15 });
        } else if (date.getMonth() == 11) {
            date = set(date, { year: date.getFullYear() + 1, month: 0, date: 15 });
        } else if (date.getMonth() == 0 && date.getDate() < 15) {
            date = set(date, { month: 0, date: 15 });
        }

        return date;
    }

    adjustDateIfEndingInHoliday(date: Date): Date {
        let additionalDays = 0;

        if (
            isWithinInterval(date, { start: new Date(date.getFullYear(), 5), end: new Date(date.getFullYear(), 7, 15) })
        ) {
            additionalDays = 75;
        } else if (date.getMonth() == 11) {
            additionalDays = 45;
        } else if (date.getMonth() == 0 && date.getDate() < 15) {
            additionalDays = 45;
        }

        return add(date, { days: additionalDays });
    }

    calculateExpiryDate(marks: Array<{ createdAt: Date; duration: number }>): Date | null {
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
}
