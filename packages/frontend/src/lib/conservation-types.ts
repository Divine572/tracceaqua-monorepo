export interface SamplingLocation {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  waterBodyType: "freshwater" | "marine" | "brackish";
  region: string;
  description?: string;
}

export interface OrganismInfo {
  category:
    | "molluscs"
    | "crustaceans"
    | "finfish"
    | "echinoderms"
    | "algae"
    | "aquatic-plants"
    | "processed";
  species: string;
  commonName?: string;
  sampleCount: number;
  individualCount?: number;
  sampleImages: string[];
}

export interface WaterParameters {
  pH?: number;
  temperature?: number;
  salinity?: number;
  dissolvedOxygen?: number;
  turbidity?: number;
  ammonia?: number;
  nitrite?: number;
  nitrate?: number;
  conductivity?: number;
  other?: { [key: string]: number };
  instrumentImages: string[];
}

export interface SedimentSample {
  collectionLocation: string;
  depth: number;
  textureDescription: string;
  sampleImages: string[];
  notes?: string;
}

export interface LabResults {
  physicochemical?: {
    pH?: number;
    dissolvedSolids?: number;
    turbidity?: number;
    conductivity?: number;
    nutrients?: {
      nitrate?: number;
      phosphate?: number;
      ammonia?: number;
      [key: string]: number | undefined;
    };
    documents: string[];
  };
  proximateAnalysis?: {
    moisture?: number;
    crudeProtein?: number;
    lipid?: number;
    ash?: number;
    fiber?: number;
    documents: string[];
  };
  heavyMetals?: {
    lead?: number;
    cadmium?: number;
    mercury?: number;
    zinc?: number;
    iron?: number;
    copper?: number;
    chromium?: number;
    documents: string[];
  };
  nutrientAnalysis?: {
    organicCarbon?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    documents: string[];
  };
  morphometric?: {
    length?: number;
    width?: number;
    weight?: number;
    sex?: "male" | "female" | "unknown";
    shellHardness?: string;
    documents: string[];
  };
  microplastics?: {
    present: boolean;
    description?: string;
    quantity?: number;
    type?: string[];
    images: string[];
  };
}

export interface SamplingRecord {
  id: string;
  samplingId: string;
  researcherId: string;
  status: "draft" | "in-progress" | "completed" | "verified";
  createdAt: Date;
  updatedAt: Date;

  // Step 1: Site & Sampling Info
  location: SamplingLocation;
  samplingDate: Date;
  weatherConditions?: string;
  siteImages: string[];

  // Step 2: Organism Category
  organism: OrganismInfo;

  // Step 3: Water Parameters
  waterParams: WaterParameters;

  // Step 4: Sediment Sample
  sediment: SedimentSample;

  // Step 5: Lab Results
  labResults: LabResults;

  // Additional metadata
  notes?: string;
  collaborators?: string[];
  tags?: string[];
}
