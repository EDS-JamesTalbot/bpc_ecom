import { pgTable, serial, varchar, text, timestamp, integer, decimal, index, boolean, uuid, unique } from 'drizzle-orm/pg-core';

/**
 * TENANTS TABLE
 * Multi-tenant: each client/store is a tenant
 */
export const tenantsTable = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  customDomain: varchar('custom_domain', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('tenants_slug_idx').on(table.slug),
}));

/**
 * TENANT CONFIG TABLE
 * Per-tenant secrets (BPC keys, Cloudinary, etc.)
 */
export const tenantConfigTable = pgTable('tenant_config', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  configKey: varchar('config_key', { length: 100 }).notNull(),
  configValue: text('config_value').notNull(),
}, (table) => ({
  tenantConfigUnique: unique('tenant_config_tenant_key_unique').on(table.tenantId, table.configKey),
  tenantIdIdx: index('tenant_config_tenant_id_idx').on(table.tenantId),
}));

/**
 * CUSTOMERS TABLE
 * Stores registered customer accounts (separate from admin users)
 * Admin users use Clerk authentication - these are shopping customers only
 */
export const customersTable = pgTable('customers', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  
  // Basic Information
  email: varchar('email', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 50 }),
  dateOfBirth: timestamp('date_of_birth'), // Optional - customer's date of birth
  gender: varchar('gender', { length: 50 }), // Optional - 'male', 'female', 'other', 'prefer_not_to_say'
  
  // Authentication (password stored as bcrypt hash)
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  
  // Marketing & Preferences
  newsletterOptIn: boolean('newsletter_opt_in').notNull().default(false),
  marketingOptIn: boolean('marketing_opt_in').notNull().default(false),
  
  // Default Shipping Address (optional - saved for convenience)
  defaultShippingCountry: varchar('default_shipping_country', { length: 100 }),
  defaultShippingIsland: varchar('default_shipping_island', { length: 100 }),
  defaultShippingAddress: text('default_shipping_address'),
  
  // Account Status
  isActive: boolean('is_active').notNull().default(true),
  emailVerified: boolean('email_verified').notNull().default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
}, (table) => ({
  emailIdx: index('customers_email_idx').on(table.email),
  newsletterIdx: index('customers_newsletter_idx').on(table.newsletterOptIn),
  createdAtIdx: index('customers_created_at_idx').on(table.createdAt),
  isActiveIdx: index('customers_is_active_idx').on(table.isActive),
  tenantIdIdx: index('customers_tenant_id_idx').on(table.tenantId),
  emailTenantUnique: unique('customers_tenant_email_unique').on(table.tenantId, table.email),
}));

/**
 * PRODUCTS TABLE
 * Stores all product information including images
 */
export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  image: text('image').notNull(), // Can store URLs or data URLs
  isActive: boolean('is_active').notNull().default(true), // Whether product is available for purchase
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  tenantIdIdx: index('products_tenant_id_idx').on(table.tenantId),
}));

/**
 * ORDERS TABLE
 * Stores order information including customer details and payment status
 */
export const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  
  // Link to registered customer (nullable - allows guest checkout)
  customerId: integer('customer_id').references(() => customersTable.id, { onDelete: 'set null' }),
  
  // Customer Information (always stored for order record, even if they have an account)
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }), // Optional
  
  // Shipping Information (Optional)
  shippingCountry: varchar('shipping_country', { length: 100 }), // Optional shipping country
  shippingIsland: varchar('shipping_island', { length: 100 }), // Optional region/state
  shippingAddress: text('shipping_address'), // Optional street address
  
  // Order Details
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  orderStatus: varchar('order_status', { length: 50 }).notNull().default('pending'), // pending, paid, failed, cancelled
  
  // Payment Information (gateway-agnostic: BPC, etc.)
  gatewayPaymentId: varchar('gateway_payment_id', { length: 255 }), // BPC session id or similar
  gatewayChargeId: varchar('gateway_charge_id', { length: 255 }), // optional charge/payment id from gateway
  
  paymentStatus: varchar('payment_status', { length: 50 }).notNull().default('pending'),
  paymentGateway: varchar('payment_gateway', { length: 50 }).default('bpc'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    tenantIdIdx: index('orders_tenant_id_idx').on(table.tenantId),
    // Index for linking orders to customers
    customerIdIdx: index('orders_customer_id_idx').on(table.customerId),
    // Index for faster lookup by gateway payment/session ID
    gatewayPaymentIdIdx: index('gateway_payment_id_idx').on(table.gatewayPaymentId),
    // Index for filtering by order status
    orderStatusIdx: index('order_status_idx').on(table.orderStatus),
    // Index for filtering by payment status
    paymentStatusIdx: index('payment_status_idx').on(table.paymentStatus),
    // Index for payment gateway
    paymentGatewayIdx: index('payment_gateway_idx').on(table.paymentGateway),
    // Index for sorting by creation date
    createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
  };
});

/**
 * ORDER ITEMS TABLE
 * Stores individual items in each order
 */
export const orderItemsTable = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => ordersTable.id, { onDelete: 'cascade' }),
  
  // Product Information (snapshot at time of purchase)
  productId: integer('product_id').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  productImage: text('product_image'), // Changed from varchar(500) to text to support data URLs
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    // Index for faster lookup of items by order ID (most common query)
    orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
    // Index for analyzing product sales
    productIdIdx: index('order_items_product_id_idx').on(table.productId),
  };
});

/**
 * TESTIMONIALS TABLE
 * Stores customer testimonials that can be managed by admin
 */
export const testimonialsTable = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  quote: text('quote').notNull(),
  location: varchar('location', { length: 255 }),
  authorName: varchar('author_name', { length: 255 }), // Optional customer name
  isActive: boolean('is_active').notNull().default(true), // Admin can show/hide testimonials
  sortOrder: integer('sort_order').notNull().default(0), // For manual ordering
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  isActiveIdx: index('testimonials_is_active_idx').on(table.isActive),
  sortOrderIdx: index('testimonials_sort_order_idx').on(table.sortOrder),
  tenantIdIdx: index('testimonials_tenant_id_idx').on(table.tenantId),
}));

/**
 * PAGE SECTIONS TABLE
 * Stores editable content sections for various pages (hero, features, CTA, etc.)
 */
export const pageSectionsTable = pgTable('page_sections', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  // Section identifier (e.g., 'home_hero', 'home_about', 'contact_header')
  sectionKey: varchar('section_key', { length: 100 }).notNull(),
  // Page this section belongs to (e.g., 'home', 'testimonials', 'contact')
  page: varchar('page', { length: 50 }).notNull(),
  // Human-readable title for admin
  title: varchar('title', { length: 255 }).notNull(),
  // JSON content that can be flexible based on section type
  content: text('content').notNull(), // Store as JSON string
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  pageIdx: index('page_sections_page_idx').on(table.page),
  sectionKeyIdx: index('page_sections_section_key_idx').on(table.sectionKey),
  tenantIdIdx: index('page_sections_tenant_id_idx').on(table.tenantId),
  sectionTenantUnique: unique('page_sections_tenant_key_unique').on(table.tenantId, table.sectionKey),
}));

/**
 * SITE SETTINGS TABLE
 * Stores global site settings like contact info, social links, etc.
 */
export const siteSettingsTable = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  // Setting key (e.g., 'contact_email', 'contact_phone', 'social_facebook')
  settingKey: varchar('setting_key', { length: 100 }).notNull(),
  settingValue: text('setting_value').notNull(),
  // Optional description for admin
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull().default('general'), // e.g., 'contact', 'social', 'general'
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index('site_settings_category_idx').on(table.category),
  tenantIdIdx: index('site_settings_tenant_id_idx').on(table.tenantId),
  settingTenantUnique: unique('site_settings_tenant_key_unique').on(table.tenantId, table.settingKey),
}));

// Types inferred from schema
export type Tenant = typeof tenantsTable.$inferSelect;
export type NewTenant = typeof tenantsTable.$inferInsert;
export type TenantConfig = typeof tenantConfigTable.$inferSelect;
export type NewTenantConfig = typeof tenantConfigTable.$inferInsert;
export type Customer = typeof customersTable.$inferSelect;
export type NewCustomer = typeof customersTable.$inferInsert;
export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;
export type Order = typeof ordersTable.$inferSelect;
export type NewOrder = typeof ordersTable.$inferInsert;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type NewOrderItem = typeof orderItemsTable.$inferInsert;
export type Testimonial = typeof testimonialsTable.$inferSelect;
export type NewTestimonial = typeof testimonialsTable.$inferInsert;
export type PageSection = typeof pageSectionsTable.$inferSelect;
export type NewPageSection = typeof pageSectionsTable.$inferInsert;
export type SiteSetting = typeof siteSettingsTable.$inferSelect;
export type NewSiteSetting = typeof siteSettingsTable.$inferInsert;

