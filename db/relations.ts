import { relations } from "drizzle-orm";
import {
  user,
  session,
  account,
  subscription,
  profiles,
  birthPlaces,
  astrologySystems,
  natalCharts,
  priorities,
  notifications,
  aiReports,
  astrologicalData,
  aiUsage,
} from "./schema";

// --- User relations ---
export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  accounts: many(account),
  subscriptions: many(subscription),
  profiles: many(profiles),
  notifications: many(notifications),
  natalCharts: many(natalCharts), // if you keep ownerUserId
}));

// --- Session relations ---
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

// --- Account relations ---
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// --- Subscription relations ---
export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, {
    fields: [subscription.userId],
    references: [user.id],
  }),
}));

// --- Profiles relations ---
export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(user, {
    fields: [profiles.userId],
    references: [user.id],
  }),
  birthPlace: one(birthPlaces, {
    fields: [profiles.birthPlaceId],
    references: [birthPlaces.id],
  }),
  priorities: many(priorities),
  natalCharts: many(natalCharts),
  astrologicalData: one(astrologicalData, {
    fields: [profiles.id],
    references: [astrologicalData.profileId],
  }),
}));

// --- BirthPlaces relations ---
export const birthPlacesRelations = relations(birthPlaces, ({ many }) => ({
  profiles: many(profiles),
  natalCharts: many(natalCharts),
}));

// --- AstrologySystems relations ---
export const astrologySystemsRelations = relations(astrologySystems, ({ many }) => ({
  natalCharts: many(natalCharts),
  aiReports: many(aiReports),
}));

// --- NatalCharts relations ---
export const natalChartsRelations = relations(natalCharts, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [natalCharts.profileId],
    references: [profiles.id],
  }),
  ownerUser: one(user, {
    fields: [natalCharts.ownerUserId],
    references: [user.id],
  }),
  birthPlace: one(birthPlaces, {
    fields: [natalCharts.subjectBirthPlaceId],
    references: [birthPlaces.id],
  }),
  system: one(astrologySystems, {
    fields: [natalCharts.systemId],
    references: [astrologySystems.id],
  }),
  reports: many(aiReports),
}));

// --- Priorities relations ---
export const prioritiesRelations = relations(priorities, ({ one }) => ({
  profile: one(profiles, {
    fields: [priorities.profileId],
    references: [profiles.id],
  }),
}));

// --- Notifications relations ---
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
}));

// --- AI Reports relations ---
export const aiReportsRelations = relations(aiReports, ({ one }) => ({
  chart: one(natalCharts, {
    fields: [aiReports.chartId],
    references: [natalCharts.id],
  }),
  system: one(astrologySystems, {
    fields: [aiReports.systemId],
    references: [astrologySystems.id],
  }),
}));

// --- AstrologicalData relations ---
export const astrologicalDataRelations = relations(astrologicalData, ({ one }) => ({
  profile: one(profiles, {
    fields: [astrologicalData.profileId],
    references: [profiles.id],
  }),
}));

// --- AI Usage relations ---
export const aiUsageRelations = relations(aiUsage, ({ one }) => ({
  user: one(user, {
    fields: [aiUsage.userId],
    references: [user.id],
  }),
}));
