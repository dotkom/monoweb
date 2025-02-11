import { z } from 'zod';

export const OwUserScalarFieldEnumSchema = z.enum(['id','privacyPermissionsId','notificationPermissionsId']);

export default OwUserScalarFieldEnumSchema;
