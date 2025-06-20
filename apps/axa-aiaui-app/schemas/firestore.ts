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
  // Add other fields as needed based on the CSV structure
  id: z.string().optional(),
});

export type NodeMappings = z.infer<typeof nodeMappingsSchema>;
