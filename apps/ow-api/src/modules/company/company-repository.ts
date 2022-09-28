import { PrismaClient } from "@dotkom/db"
import { InsertCompany, mapToCompany, Company } from "./company"

export interface CompanyRepository {
  getCompanyByID: (id: string) => Promise<Company | undefined>
  getCompanies: (limit: number) => Promise<Company[]>
  createCompany: (companyInsert: InsertCompany) => Promise<Company>
}

export const initCompanyRepository = (client: PrismaClient): CompanyRepository => {
  const repo: CompanyRepository = {
    getCompanyByID: async (id) => {
      const company = await client.company.findUnique({
        where: { id },
      })
      return company ? mapToCompany(company) : undefined
    },
    getCompanies: async (limit: number) => {
      const companies = await client.company.findMany({ take: limit })
      return companies.map(mapToCompany)
    },
    createCompany: async (companyInsert) => {
      const { name, description, email, location, phone, website, type } = companyInsert
      const company = await client.company.create({
        data: {
          name: name,
          description: description,
          phone: phone,
          email: email,
          website: website,
          location: location,
          type: type,
        },
      })
      return mapToCompany(company)
    },
  }
  return repo
}
