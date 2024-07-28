import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => organizations.id),
    email: text("email").notNull(),
    externalAuthId: text("external_auth_id").notNull(), // Store the ID from the external auth provider
    firstName: text("first_name"),
    lastName: text("last_name"),
    role: text("role").default("user"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex("email_idx").on(table.email),
      externalAuthIdIdx: uniqueIndex("external_auth_id_idx").on(
        table.externalAuthId
      ),
    };
  }
);

export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  barcode: text("barcode").notNull(),
  scannedAt: timestamp("scanned_at").defaultNow().notNull(),
  productName: text("product_name"),
  productCategory: text("product_category"),
  notes: text("notes"),
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    barcode: text("barcode").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      barcodeIdx: uniqueIndex("barcode_idx").on(table.barcode),
    };
  }
);

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  scans: many(scans),
}));

export const scansRelations = relations(scans, ({ one }) => ({
  user: one(users, {
    fields: [scans.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [scans.barcode],
    references: [products.barcode],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  scans: many(scans),
}));
