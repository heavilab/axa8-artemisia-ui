import { z } from "zod";
import { Timestamp } from "firebase/firestore";

export const userSchema = z.object({
  email: z.string().email(),
  role: z.enum(["Admin", "Standard", "Viewer"]),
  agency: z.string(),
  country: z.string(),
  brand: z.string(),
  entity: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const businessRuleSetSchema = z.object({
  datasetId: z.string(),
  owner: z.string(),
  status: z.enum(["main", "draft"]),
  createdAt: z.instanceof(Timestamp),
  publishedAt: z.instanceof(Timestamp).optional(),
  emptyFieldRatio: z.number().optional(),
  lastModifiedBy: z.string().optional(),
});

export type BusinessRuleSet = z.infer<typeof businessRuleSetSchema>;

export const businessRuleSchema = z.object({
  agency: z.string(),
  data_source: z.string(),
  field: z.string().optional(),
  target_field: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  rules_order: z.string(),
  match_type: z.string(),
  condition: z.string(),
  results: z.string(),
});

export type BusinessRule = z.infer<typeof businessRuleSchema>;
