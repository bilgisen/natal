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
  time,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";

// Better Auth Tables - DEĞİŞMEDİ
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  role: text("role").default("user"),
  banned: boolean("banned").default(false),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex("user_email_idx").on(table.email),
  roleIdx: index("user_role_idx").on(table.role),
}));

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  impersonatedBy: text("impersonatedBy"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
}, (table) => ({
  tokenIdx: uniqueIndex("session_token_idx").on(table.token),
  userIdIdx: index("session_user_id_idx").on(table.userId),
  expiresAtIdx: index("session_expires_at_idx").on(table.expiresAt),
}));

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
}, (table) => ({
  userIdProviderIdx: uniqueIndex("account_user_provider_idx").on(table.userId, table.providerId),
  userIdIdx: index("account_user_id_idx").on(table.userId),
}));

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => ({
  identifierIdx: index("verification_identifier_idx").on(table.identifier),
  expiresAtIdx: index("verification_expires_at_idx").on(table.expiresAt),
}));

// Subscription table for Polar webhook data - DEĞİŞMEDİ
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
  metadata: text("metadata"),
  customFieldData: text("customFieldData"),
  userId: text("userId").references(() => user.id),
}, (table) => ({
  userIdIdx: index("subscription_user_id_idx").on(table.userId),
  statusIdx: index("subscription_status_idx").on(table.status),
  customerIdIdx: index("subscription_customer_id_idx").on(table.customerId),
}));

// User profiles with personal information - BASİTLEŞTİRİLDİ
export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  displayName: varchar("display_name", { length: 150 }),
  birthDate: date("birth_date"),
  birthTime: time("birth_time"),
  birthPlaceId: uuid("birth_place_id").references(() => birthPlaces.id, { onDelete: 'set null' }),
  timezone: varchar("timezone", { length: 64 }),
  gender: varchar("gender", { length: 20 }),
  profileCategory: varchar("profile_category", { length: 20 }).default('self').notNull(),
  isMainProfile: boolean("is_main_profile").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  userIdIdx: index("profiles_user_id_idx").on(table.userId),
  birthDateIdx: index("profiles_birth_date_idx").on(table.birthDate),
  birthPlaceIdx: index("profiles_birth_place_idx").on(table.birthPlaceId),
  categoryIdx: index("profiles_category_idx").on(table.profileCategory),
  mainProfileIdx: index("profiles_main_profile_idx").on(table.isMainProfile),
}));

// Birth places with geolocation data - GELİŞTİRİLDİ
export const birthPlaces = pgTable("birth_places", {
  id: uuid("id").defaultRandom().primaryKey(),
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 200 }).notNull(),
  lat: numeric("lat", { precision: 10, scale: 6 }).notNull(),
  lon: numeric("lon", { precision: 10, scale: 6 }).notNull(),
  tz: varchar("tz", { length: 64 }).notNull(),
  language: varchar("language", { length: 10 }).default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  cityCountryIdx: index("birth_places_city_country_idx").on(table.city, table.country),
  coordinatesIdx: index("birth_places_coordinates_idx").on(table.lat, table.lon),
  countryIdx: index("birth_places_country_idx").on(table.country),
}));

// Astrology systems - DEĞİŞMEDİ
export const astrologySystems = pgTable("astrology_systems", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 150 }).notNull(),
}, (table) => ({
  keyIdx: uniqueIndex("astrology_systems_key_idx").on(table.key),
}));

// Natal charts for users - GELİŞTİRİLDİ
export const natalCharts = pgTable("natal_charts", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  ownerUserId: text("owner_user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  subjectName: varchar("subject_name", { length: 150 }),
  subjectBirthDate: date("subject_birth_date"),
  subjectBirthTime: time("subject_birth_time"),
  subjectBirthPlaceId: uuid("subject_birth_place_id").references(() => birthPlaces.id),
  systemId: integer("system_id")
    .references(() => astrologySystems.id)
    .notNull(),
  zodiacType: varchar("zodiac_type", { length: 20 }).default("Tropical"),
  housesSystem: varchar("houses_system", { length: 50 }).default("Placidus"),
  perspectiveType: varchar("perspective_type", { length: 50 }).default("Apparent Geocentric"),
  siderealMode: varchar("sidereal_mode", { length: 50 }),
  astroSnapshot: jsonb("astro_snapshot"),
  sunSign: varchar("sun_sign", { length: 50 }),
  ascendant: varchar("ascendant", { length: 50 }),
  moonSign: varchar("moon_sign", { length: 50 }),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  calculationProvider: varchar("calculation_provider", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  profileIdIdx: index("natal_charts_profile_id_idx").on(table.profileId),
  ownerUserIdIdx: index("natal_charts_owner_user_id_idx").on(table.ownerUserId),
  birthDateIdx: index("natal_charts_birth_date_idx").on(table.subjectBirthDate),
  sunSignIdx: index("natal_charts_sun_sign_idx").on(table.sunSign),
  ascendantIdx: index("natal_charts_ascendant_idx").on(table.ascendant),
  systemIdIdx: index("natal_charts_system_id_idx").on(table.systemId),
}));

// Astrological houses - GELİŞTİRİLDİ
export const astroHouses = pgTable("astro_houses", {
  id: uuid("id").defaultRandom().primaryKey(),
  natalChartId: uuid("natal_chart_id")
    .references(() => natalCharts.id, { onDelete: "cascade" })
    .notNull(),
  houseNumber: integer("house_number").notNull(),
  sign: varchar("sign", { length: 10 }).notNull(),
  cuspPosition: numeric("cusp_position", { precision: 12, scale: 8 }).notNull(),
  houseLord: varchar("house_lord", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  natalChartHouseIdx: uniqueIndex("astro_houses_chart_house_idx").on(table.natalChartId, table.houseNumber),
  natalChartIdx: index("astro_houses_natal_chart_idx").on(table.natalChartId),
  houseNumberIdx: index("astro_houses_number_idx").on(table.houseNumber),
}));

// Planetary positions - GELİŞTİRİLDİ
export const astroPlanets = pgTable("astro_planets", {
  id: uuid("id").defaultRandom().primaryKey(),
  natalChartId: uuid("natal_chart_id")
    .references(() => natalCharts.id, { onDelete: "cascade" })
    .notNull(),
  planetName: varchar("planet_name", { length: 30 }).notNull(),
  sign: varchar("sign", { length: 10 }).notNull(),
  position: numeric("position", { precision: 12, scale: 8 }).notNull(),
  absPosition: numeric("abs_position", { precision: 12, scale: 8 }).notNull(),
  house: integer("house").notNull(),
  element: varchar("element", { length: 20 }),
  quality: varchar("quality", { length: 20 }),
  retrograde: boolean("retrograde").default(false),
  emoji: varchar("emoji", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  natalChartPlanetIdx: uniqueIndex("astro_planets_chart_planet_idx").on(table.natalChartId, table.planetName),
  natalChartIdx: index("astro_planets_natal_chart_idx").on(table.natalChartId),
  planetNameIdx: index("astro_planets_name_idx").on(table.planetName),
  houseIdx: index("astro_planets_house_idx").on(table.house),
  signIdx: index("astro_planets_sign_idx").on(table.sign),
}));

// Astrological aspects - GELİŞTİRİLDİ
export const astroAspects = pgTable("astro_aspects", {
  id: uuid("id").defaultRandom().primaryKey(),
  natalChartId: uuid("natal_chart_id")
    .references(() => natalCharts.id, { onDelete: "cascade" })
    .notNull(),
  planet1Id: uuid("planet1_id")
    .references(() => astroPlanets.id, { onDelete: "cascade" })
    .notNull(),
  planet2Id: uuid("planet2_id")
    .references(() => astroPlanets.id, { onDelete: "cascade" })
    .notNull(),
  aspectName: varchar("aspect_name", { length: 50 }).notNull(),
  aspectDegree: numeric("aspect_degree", { precision: 8, scale: 4 }).notNull(),
  orb: numeric("orb", { precision: 6, scale: 4 }).notNull(),
  orbApplied: numeric("orb_applied", { precision: 6, scale: 4 }),
  strength: numeric("strength", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  natalChartAspectIdx: index("astro_aspects_chart_aspect_idx").on(table.natalChartId, table.aspectName),
  planetsAspectIdx: uniqueIndex("astro_aspects_planets_idx").on(table.planet1Id, table.planet2Id, table.aspectName),
  natalChartIdx: index("astro_aspects_natal_chart_idx").on(table.natalChartId),
  aspectNameIdx: index("astro_aspects_name_idx").on(table.aspectName),
}));

// Lunar phase information - GELİŞTİRİLDİ
export const lunarPhases = pgTable("lunar_phases", {
  id: uuid("id").defaultRandom().primaryKey(),
  natalChartId: uuid("natal_chart_id")
    .references(() => natalCharts.id, { onDelete: "cascade" })
    .notNull(),
  degreesBetweenSunMoon: numeric("degrees_between_sun_moon", { precision: 8, scale: 4 }).notNull(),
  moonPhase: numeric("moon_phase", { precision: 5, scale: 2 }).notNull(),
  sunPhase: numeric("sun_phase", { precision: 5, scale: 2 }).notNull(),
  moonEmoji: varchar("moon_emoji", { length: 10 }),
  moonPhaseName: varchar("moon_phase_name", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  natalChartIdx: uniqueIndex("lunar_phases_chart_idx").on(table.natalChartId),
}));

// User priorities - GELİŞTİRİLDİ
export const priorities = pgTable("priorities", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  importance: smallint("importance").notNull().default(3),
}, (table) => ({
  profileKeyIdx: uniqueIndex("priorities_profile_key_idx").on(table.profileId, table.key),
  profileIdx: index("priorities_profile_idx").on(table.profileId),
  importanceIdx: index("priorities_importance_idx").on(table.importance),
}));

// User notification preferences - GELİŞTİRİLDİ
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 50 }),
  channel: varchar("channel", { length: 30 }),
  enabled: boolean("enabled").default(true),
  nextSendAt: timestamp("next_send_at"),
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  typeIdx: index("notifications_type_idx").on(table.type),
  channelIdx: index("notifications_channel_idx").on(table.channel),
  enabledIdx: index("notifications_enabled_idx").on(table.enabled),
  nextSendAtIdx: index("notifications_next_send_at_idx").on(table.nextSendAt),
}));

// AI Prompt templates - GELİŞTİRİLDİ
// AI Generated Reports - GELİŞTİRİLDİ
export const aiReports = pgTable("ai_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  chartId: uuid("chart_id").references(() => natalCharts.id, { onDelete: "cascade" }),
  systemId: integer("system_id").references(() => astrologySystems.id),
  reportType: varchar("report_type", { length: 50 }),
  content: text("content"),
  metadata: jsonb("metadata"),
  isPublic: boolean("is_public").default(false),
  targetSign: varchar("target_sign", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  chartIdIdx: index("ai_reports_chart_id_idx").on(table.chartId),
  systemIdIdx: index("ai_reports_system_id_idx").on(table.systemId),
  reportTypeIdx: index("ai_reports_type_idx").on(table.reportType),
  isPublicIdx: index("ai_reports_public_idx").on(table.isPublic),
  targetSignIdx: index("ai_reports_target_sign_idx").on(table.targetSign),
  createdAtIdx: index("ai_reports_created_at_idx").on(table.createdAt),
}));

// Aggregated astrological data per profile (raw and parsed chart data)
export const astrologicalData = pgTable("astrological_data", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  chartData: jsonb("chart_data").notNull(),
  rawData: jsonb("raw_data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  profileIdx: index("astrological_data_profile_idx").on(table.profileId),
}));

// 🔹 AI kullanım tablosu
export const aiUsage = pgTable(
  "ai_usage",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    usedTokens: integer("used_tokens").notNull().default(0),
    monthlyQuota: integer("monthly_quota").notNull().default(50000),
    periodStart: timestamp("period_start").notNull().defaultNow(),
    periodEnd: timestamp("period_end"),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("ai_usage_user_idx").on(table.userId),
  })
);