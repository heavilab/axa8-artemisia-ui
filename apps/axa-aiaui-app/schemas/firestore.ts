import { z } from "zod";
import { Timestamp } from "firebase/firestore";

// User Schema
export const userSchema = z.object({
  email: z.string().email(),
  role: z.enum(["Admin", "Standard", "Viewer"]),
  agency: z.string(),
  country: z.string(),
  brand: z.string(),
  entity: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const businessRulesSchema = z.object({
  setId: z.string(),
  status: z.enum(["main", "deprecated", "draft"]),
  createdAt: z.instanceof(Timestamp),
  createdBy: z.string(),
  emptyFieldRatio: z.number().optional(),

  country: z.string(),
  entity: z.string(),
  agency: z.string(),
  dataSource: z.string(),

  field: z.string().optional(),
  targetField: z.string(),

  startDate: z.string().optional(),
  endDate: z.string().optional(),

  rulesOrder: z.number().optional(),
  matchType: z.string().optional(),
  condition: z.string().optional(),
  results: z.string().optional(),
  id: z.string().optional(),
  updatedAt: z.instanceof(Timestamp).optional(),
  publishedAt: z.instanceof(Timestamp).optional(),
});

export type BusinessRules = z.infer<typeof businessRulesSchema>;

// Country Schema
export const countrySchema = z.object({
  id: z.union([z.number(), z.string()]), // Firestore might use string IDs
  country: z.string().min(2).max(2), // ISO Alpha-2 country code
  data_currency: z.string().min(3).max(3), // ISO 4217 currency code
  language: z.string(), // e.g., "EN", or "FA,PS"
});

export type Country = z.infer<typeof countrySchema>;

// Forex Spots Schema
export const currencyExchangeRatesSchema = z.object({
  forex: z.string(), // Currency pair e.g., "EUR/USD"
  value: z.number(), // Exchange rate value
  date: z.string(), // Date in YYYY-MM-DD format
  id: z.string().optional(),
});

export type CurrencyExchangeRates = z.infer<typeof currencyExchangeRatesSchema>;

// Node Mappings Schema
export const nodeMappingsSchema = z.object({
  dataSource: z.string(),
  field: z.string(),
  targetField: z.string(),
  matchType: z.string(),
  status: z.enum(["main", "deprecated", "draft"]),
  createdAt: z.instanceof(Timestamp),
  createdBy: z.string(),
  publishedAt: z.instanceof(Timestamp).optional(),
  updatedAt: z.instanceof(Timestamp).optional(),
  datasetId: z.string().optional(),
  // Additional fields displayed in the table
  advertiser: z.string().optional(),
  nodeName: z.string().optional(),
  fundingEntity: z.string().optional(),
  mediaLevel_1: z.string().optional(),
  // Add other fields as needed based on the CSV structure
  id: z.string().optional(),
});

export type NodeMappings = z.infer<typeof nodeMappingsSchema>;

// Data Glossary Schema
export const dataGlossarySchema = z.object({
  priorityOnline: z.string(),
  priorityOffline: z.string(),
  dataFieldName: z.string(),
  outputType: z.string(),
  description: z.string(),
  example: z.string(),
  userId: z.string().optional(),
  createdAt: z.any().optional(),
  publishedAt: z.any().optional(),
});

export type DataGlossary = z.infer<typeof dataGlossarySchema>;

// Business Classification Levels Schema
export const businessClassificationLevelsSchema = z.object({
  term: z.string(),
  businessClassificationLevel1: z.string(),
  definition: z.string(),
  examples: z.string(),
  userId: z.string().optional(),
  createdAt: z.any().optional(),
  publishedAt: z.any().optional(),
});

export type BusinessClassificationLevels = z.infer<
  typeof businessClassificationLevelsSchema
>;

// Media Categorizations Schema
export const mediaCategorizationsSchema = z.object({
  parentName: z.string(),
  name: z.string(),
  definition: z.string(),
  dataType: z.string(),
  userId: z.string().optional(),
  createdAt: z.any().optional(),
  publishedAt: z.any().optional(),
});

export type MediaCategorizations = z.infer<typeof mediaCategorizationsSchema>;
