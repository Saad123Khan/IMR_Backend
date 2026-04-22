export enum Permission {
  // User Management
  CREATE_USER = 'create_user',
  READ_USER = 'read_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',

  // Role Management
  CREATE_ROLE = 'create_role',
  READ_ROLE = 'read_role',
  UPDATE_ROLE = 'update_role',
  DELETE_ROLE = 'delete_role',

  // Corridor Management
  CREATE_CORRIDOR = 'create_corridor',
  READ_CORRIDOR = 'read_corridor',
  UPDATE_CORRIDOR = 'update_corridor',
  DELETE_CORRIDOR = 'delete_corridor',

  // Router Management
  CREATE_ROUTER = 'create_router',
  READ_ROUTER = 'read_router',
  UPDATE_ROUTER = 'update_router',
  DELETE_ROUTER = 'delete_router',

  // Bank Payer Mapping
  CREATE_BANK_PAYER_MAPPING = 'create_bank_payer_mapping',
  READ_BANK_PAYER_MAPPING = 'read_bank_payer_mapping',
  UPDATE_BANK_PAYER_MAPPING = 'update_bank_payer_mapping',
  DELETE_BANK_PAYER_MAPPING = 'delete_bank_payer_mapping',

  // Organization Management
  MANAGE_ORGANIZATION = 'manage_organization',
  VIEW_REPORTS = 'view_reports',

  // Webhook Management
  READ_WEBHOOK_LOGS = 'read_webhook_logs',
}
