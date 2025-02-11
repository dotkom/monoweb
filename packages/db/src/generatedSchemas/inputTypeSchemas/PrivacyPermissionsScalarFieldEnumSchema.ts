import { z } from 'zod';

export const PrivacyPermissionsScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','userId','profileVisible','usernameVisible','emailVisible','phoneVisible','addressVisible','attendanceVisible']);

export default PrivacyPermissionsScalarFieldEnumSchema;
