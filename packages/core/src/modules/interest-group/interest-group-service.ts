import {
  InterestGroup,
  InterestGroupId,
  InterestGroupWrite,
} from "@dotkomonline/types";
import { InterestGroupRepository } from "./interest-group-repository";
import { type Collection } from "../../utils/db-utils";

export interface InterestGroupService {
  getById(id: InterestGroupId): Promise<InterestGroup | undefined>;
  getAll(): Promise<InterestGroup[] | undefined>;
  create(values: InterestGroupWrite): Promise<InterestGroup>;
}

export class InterestGroupServiceImpl implements InterestGroupService {
  constructor(
    private readonly interestGroupRepository: InterestGroupRepository
  ) {}

  async getById(id: InterestGroupId): Promise<InterestGroup | undefined> {
    return this.interestGroupRepository.getById(id);
  }

  async getAll(): Promise<InterestGroup[] | undefined> {
    return this.interestGroupRepository.getAll({
      take: 100,
      cursor: undefined,
    });
  }

  async create(values: InterestGroupWrite): Promise<InterestGroup> {
    return this.interestGroupRepository.create(values);
  }
}
