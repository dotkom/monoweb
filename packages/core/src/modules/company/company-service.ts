import { type Company, type CompanyWrite } from "@dotkomonline/types";

import { NotFoundError } from "../../errors/errors";
import { type Cursor } from "../../utils/db-utils";
import { type CompanyRepository } from "./company-repository";

export interface CompanyService {
  createCompany(payload: CompanyWrite): Promise<Company>;
  getCompanies(take: number, cursor?: Cursor): Promise<Array<Company>>;
  getCompany(id: Company["id"]): Promise<Company>;
}

export class CompanyServiceImpl implements CompanyService {
  public constructor(private readonly companyRepository: CompanyRepository) {}

  public async createCompany(payload: CompanyWrite): Promise<Company> {
    const company = await this.companyRepository.create(payload);

    if (!company) {
      throw new Error("Failed to create company");
    }

    return company;
  }

  public async getCompanies(take: number, cursor?: Cursor): Promise<Array<Company>> {
    const companies = await this.companyRepository.getAll(take, cursor);

    return companies;
  }

  public async getCompany(id: Company["id"]): Promise<Company> {
    const company = await this.companyRepository.getById(id);

    if (!company) {
      throw new NotFoundError(`Company with ID:${id} not found`);
    }

    return company;
  }
}
