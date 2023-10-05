import { type Committee, type CommitteeWrite } from "@dotkomonline/types";

import { NotFoundError } from "../../errors/errors";
import { type Cursor } from "../../utils/db-utils";
import { type CommitteeRepository } from "./committee-repository";

export interface CommitteeService {
    createCommittee(payload: CommitteeWrite): Promise<Committee>;
    getCommittee(id: Committee["id"]): Promise<Committee>;
    getCommittees(take: number, cursor?: Cursor): Promise<Array<Committee>>;
}

export class CommitteeServiceImpl implements CommitteeService {
    public constructor(private readonly committeeRepository: CommitteeRepository) {}

    public async createCommittee(payload: CommitteeWrite) {
        return await this.committeeRepository.create(payload);
    }

    public async getCommittee(id: Committee["id"]) {
        const committee = await this.committeeRepository.getById(id);

        if (!committee) {
            throw new NotFoundError(`Company with ID:${id} not found`);
        }

        return committee;
    }

    public async getCommittees(take: number, cursor?: Cursor) {
        return this.committeeRepository.getAll(take, cursor);
    }
}
