import { type Subject, type SubjectRepository } from "@/server/subject-repository"

export interface SubjectService {
  search(expression: string | null, take: number, skip: number): Promise<Subject[]>
}

export class SubjectServiceImpl implements SubjectService {
  constructor(private readonly subjectRepository: SubjectRepository) {}

  async search(expression: string | null, take: number, skip: number): Promise<Subject[]> {
    if (expression !== null) {
      return this.subjectRepository.getSubjectsBySearchExpression(expression.trim(), take, skip)
    }
    return this.subjectRepository.getSubjectsByPopularity(take, skip)
  }
}
