import { type Committee } from "@dotkomonline/types";
import { randomUUID } from "crypto";
import { Kysely } from "kysely";

import { NotFoundError } from "../../../errors/errors";
import { CommitteeRepositoryImpl } from "../committee-repository";
import { CommitteeServiceImpl } from "../committee-service";

describe("CommitteeService", () => {
    const db = vi.mocked(Kysely.prototype);
    const committeeRepository = new CommitteeRepositoryImpl(db);
    const committeeService = new CommitteeServiceImpl(committeeRepository);

    it("creates a new committee", async () => {
        const committee: Omit<Committee, "id"> = {
            createdAt: new Date(),
            description: "Dotkom gjør ting",
            email: "dotkom@online.ntnu.no",
            image: null,
            name: "Dotkom",
        };

        const id = randomUUID();
        vi.spyOn(committeeRepository, "create").mockResolvedValueOnce({ id, ...committee });
        const created = await committeeService.createCommittee(committee);
        expect(created).toEqual({ id, ...committee });
        expect(committeeRepository.create).toHaveBeenCalledWith(committee);
    });

    it("does not find non-existent committees", async () => {
        const id = randomUUID();
        vi.spyOn(committeeRepository, "getById").mockResolvedValueOnce(undefined);
        await expect(async () => committeeService.getCommittee(id)).rejects.toThrowError(NotFoundError);
    });
});
