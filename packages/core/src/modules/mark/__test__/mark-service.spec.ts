import { randomUUID } from "crypto";
import { Kysely } from "kysely";

import { NotFoundError } from "../../../errors/errors";
import { MarkRepositoryImpl } from "../mark-repository";
import { MarkServiceImpl } from "./../mark-service";

describe("MarkService", () => {
  const db = vi.mocked(Kysely.prototype, true);
  const markRepository = new MarkRepositoryImpl(db);
  const markService = new MarkServiceImpl(markRepository);

  it("creates a new mark", async () => {
    const mark = {
      category: "",
      createdAt: new Date(),
      details: "",
      duration: 20,
      title: "",
      updatedAt: new Date(),
    };

    const id = randomUUID();
    vi.spyOn(markRepository, "create").mockResolvedValueOnce({ id, ...mark });
    await expect(markService.createMark(mark)).resolves.toEqual({ id, ...mark });
    expect(markRepository.create).toHaveBeenCalledWith(mark);
  });

  it("fails on unknown id", async () => {
    const unknownID = randomUUID();
    vi.spyOn(markRepository, "getById").mockResolvedValueOnce(undefined);
    await expect(markService.getMark(unknownID)).rejects.toThrow(NotFoundError);
    expect(markRepository.getById).toHaveBeenCalledWith(unknownID);
  });
});
