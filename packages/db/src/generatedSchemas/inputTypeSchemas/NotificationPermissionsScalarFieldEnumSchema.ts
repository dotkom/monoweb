import { z } from 'zod';

export const NotificationPermissionsScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','userId','applications','newArticles','standardNotifications','groupMessages','markRulesUpdates','receipts','registrationByAdministrator','registrationStart']);

export default NotificationPermissionsScalarFieldEnumSchema;
