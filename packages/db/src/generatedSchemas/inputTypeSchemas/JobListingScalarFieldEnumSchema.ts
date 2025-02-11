import { z } from 'zod';

export const JobListingScalarFieldEnumSchema = z.enum(['id','createdAt','companyId','title','ingress','description','start','end','featured','deadline','employment','applicationLink','applicationEmail','deadlineAsap']);

export default JobListingScalarFieldEnumSchema;
