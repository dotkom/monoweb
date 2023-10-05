import { type Mark, type MarkWrite } from "@dotkomonline/types";

import { NotFoundError } from "../../errors/errors";
import { type Cursor } from "../../utils/db-utils";
import { type MarkRepository } from "./mark-repository";

export interface MarkService {
    getMark(id: string): Promise<Mark>;
    getMarks(limit: number, cursor?: Cursor): Promise<Array<Mark>>;
    createMark(payload: MarkWrite): Promise<Mark>;
    updateMark(id: string, payload: MarkWrite): Promise<Mark>;
    deleteMark(id: string): Promise<Mark>;
}

export class MarkServiceImpl implements MarkService {
    public constructor(private readonly markRepository: MarkRepository) {}

    public async getMark(id: string): Promise<Mark> {
        const mark = await this.markRepository.getById(id);

        if (!mark) {
            throw new NotFoundError(`Mark with ID:${id} not found`);
        }

        return mark;
    }

    public async getMarks(limit: number, cursor?: Cursor): Promise<Array<Mark>> {
        const marks = await this.markRepository.getAll(limit, cursor);

        return marks;
    }

    public async createMark(payload: MarkWrite): Promise<Mark> {
        const mark = await this.markRepository.create(payload);

        if (!mark) {
            throw new NotFoundError("Mark could not be created");
        }

        return mark;
    }

    public async updateMark(id: string, payload: MarkWrite): Promise<Mark> {
        const mark = await this.markRepository.update(id, payload);

        if (!mark) {
            throw new NotFoundError(`Mark with ID:${id} not found`);
        }

        return mark;
    }

    public async deleteMark(id: string): Promise<Mark> {
        const mark = await this.markRepository.delete(id);

        if (!mark) {
            throw new NotFoundError(`Mark with ID:${id} not found`);
        }

        return mark;
    }
}
