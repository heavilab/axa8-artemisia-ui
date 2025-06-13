export type User = {
  email: string;
  role: "Admin" | "Standard" | "Viewer";
  agency: string;
  country: string;
  brand: string;
  entity: string;
};

export type Contact = {
  name: string;
  title: string;
  scope: string;
  email: string;
  phoneNumber: string;
};

export type BusinessRuleSet = {
  datasetId: string;
  owner: string;
  status: "main" | "draft";
  createdAt: FirebaseFirestore.Timestamp;
  publishedAt?: FirebaseFirestore.Timestamp;
  emptyFieldRatio?: number;
  lastModifiedBy?: string;
};

export type MappingSet = {
  datasetId: string;
  owner: string;
  status: "main" | "draft";
  createdAt: FirebaseFirestore.Timestamp;
  publishedAt?: FirebaseFirestore.Timestamp;
};

export type MDCTTemplate = {
  type: string;
  version: string;
  owner: string;
  fileUrl: string;
  uploadedAt: FirebaseFirestore.Timestamp;
  isMain: boolean;
};
