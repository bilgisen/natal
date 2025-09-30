import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  boolean, 
  integer, 
  serial, 
  smallint, 
  numeric, 
  jsonb, 
  date, 
  time 
} from "drizzle-orm/pg-core";

// Better Auth Tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  // Admin plugin fields
  role: text("role").default("user"),
  banned: boolean("banned").default(false),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires"),
  // Timestamps
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  // Admin plugin field
  impersonatedBy: text("impersonatedBy"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Subscription table for Polar webhook data
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  createdAt: timestamp("createdAt").notNull(),
  modifiedAt: timestamp("modifiedAt"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  recurringInterval: text("recurringInterval").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
  canceledAt: timestamp("canceledAt"),
  startedAt: timestamp("startedAt").notNull(),
  endsAt: timestamp("endsAt"),
  endedAt: timestamp("endedAt"),
  customerId: text("customerId").notNull(),
  productId: text("productId").notNull(),
  discountId: text("discountId"),
  checkoutId: text("checkoutId").notNull(),
  customerCancellationReason: text("customerCancellationReason"),
  customerCancellationComment: text("customerCancellationComment"),
  metadata: text("metadata"), // JSON string
  customFieldData: text("customFieldData"), // JSON string
  userId: text("userId").references(() => user.id),
});

// User profiles with personal information
export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  displayName: varchar("display_name", { length: 150 }),
  birthDate: date("birth_date"),
  birthTime: time("birth_time"),
  birthPlaceId: uuid("birth_place_id").references(() => birthPlaces.id),
  timezone: varchar("timezone", { length: 64 }), // IANA
  phone: varchar("phone", { length: 40 }),
  phoneVerified: boolean("phone_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

// Birth places with geolocation data
export const birthPlaces = pgTable("birth_places", {
  id: uuid("id").defaultRandom().primaryKey(),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 200 }),
  lat: numeric("lat", { precision: 10, scale: 6 }),
  lon: numeric("lon", { precision: 10, scale: 6 }),
  tz: varchar("tz", { length: 64 }), // IANA timezone
});

// Astrology systems (Western, Vedic, Chinese, etc.)
export const astrologySystems = pgTable("astrology_systems", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 50 }).unique().notNull(), // western, vedic, chinese
  name: varchar("name", { length: 150 }).notNull(),
});

// Natal charts for users
export const natalCharts = pgTable("natal_charts", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  ownerUserId: text("owner_user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(), // who created the chart
  subjectName: varchar("subject_name", { length: 150 }), // person's name
  subjectBirthDate: date("subject_birth_date"),
  subjectBirthTime: time("subject_birth_time"),
  subjectBirthPlaceId: uuid("subject_birth_place_id").references(() => birthPlaces.id),
  systemId: integer("system_id")
    .references(() => astrologySystems.id)
    .notNull(),
  astroSnapshot: jsonb("astro_snapshot"), // planet positions, houses, aspects
  sunSign: varchar("sun_sign", { length: 50 }),
  ascendant: varchar("ascendant", { length: 50 }),
  moonSign: varchar("moon_sign", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// User priorities (love, money, health, etc.)
export const priorities = pgTable("priorities", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  key: varchar("key", { length: 100 }).notNull(), // love, money, health, career
  importance: smallint("importance").notNull().default(3), // 1..5
});

// User notification preferences
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 50 }), // daily, weekly, instant
  channel: varchar("channel", { length: 30 }), // email, sms, push
  enabled: boolean("enabled").default(true),
  nextSendAt: timestamp("next_send_at"),
});

// AI Prompt templates
export const aiPrompts = pgTable("ai_prompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 100 }).notNull(), // e.g. 'daily_horoscope_sign'
  systemId: integer("system_id").references(() => astrologySystems.id), // western/vedic/chinese
  title: varchar("title", { length: 200 }), // açıklama
  template: text("template").notNull(), // "Generate a horoscope for {sign} on {date}..."
  variables: jsonb("variables"), // ['sign','date','tone']
  version: integer("version").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Generated Reports
export const aiReports = pgTable("ai_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  chartId: uuid("chart_id").references(() => natalCharts.id, { onDelete: "cascade" }),
  systemId: integer("system_id").references(() => astrologySystems.id),
  reportType: varchar("report_type", { length: 50 }), // natal, daily, monthly, public_sign
  content: text("content"),
  metadata: jsonb("metadata"), // model, tokens, runtime
  promptId: uuid("prompt_id").references(() => aiPrompts.id), // hangi şablonla üretildi
  isPublic: boolean("is_public").default(false), // true → burç bazlı genel yorum
  targetSign: varchar("target_sign", { length: 50 }), // public yorum için
  createdAt: timestamp("created_at").defaultNow(),
});
