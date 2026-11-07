/** Respuestas del API público del portal (armio-api, `GET /public/portal/...`). Solo campos públicos. */

export type PortalPurposeSlug = "rent" | "sale" | "both" | (string & {});

export interface PortalCardLocation {
  area: string | null;
  city: string | null;
  department: string | null;
}

export interface PortalPropertyCard {
  code: number;
  slug: string;
  title: string;
  purpose: { slug: PortalPurposeSlug; name: string };
  type: { slug: string; name: string };
  price: number;
  currency: string;
  admin_fee: number | null;
  admin_included: boolean;
  area_m2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spaces: number | null;
  stratum: number | null;
  location: PortalCardLocation;
  primary_image: { url: string; thumbnail_url?: string | null } | null;
  image_count: number;
  is_featured: boolean;
  badge: "reservada" | null;
  published_at: string | null;
  updated_at: string;
}

export interface PortalPropertyDetail extends Omit<PortalPropertyCard, "location"> {
  location: PortalCardLocation & {
    /** Solo con location_mode = exact */
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  description: string | null;
  images: { url: string; order: number; thumbnail_url?: string | null }[];
  characteristics: { slug: string; name: string }[];
  private_area_m2: number | null;
  total_area_m2: number | null;
  half_bathrooms: number | null;
  storage_rooms: number | null;
  floor: number | null;
  floors_in_unit: number | null;
  built_year: number | null;
  furnished: boolean | null;
  pet_friendly: boolean | null;
  condition: string | null;
  available_from: string | null;
  building?: string;
  agent?: { first_name: string };
  contact: { whatsapp: string | null; phone: string | null };
}

export interface PortalProfile {
  slug: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  tagline: string | null;
  about: string | null;
  seo_description: string | null;
  contact: { whatsapp: string | null; phone: string | null; email: string | null };
  office_address: string | null;
  city: string | null;
  social: { instagram: string | null; facebook: string | null };
  privacy: {
    policy_url: string | null;
    contact_email: string | null;
    responsible_name: string | null;
  };
  facets: {
    purposes: string[];
    types: { slug: string; name: string; count: number }[];
    cities: { code: string; name: string; count: number }[];
    neighborhoods: { name: string; count: number }[];
    price_range: { min: number | null; max: number | null };
  };
  featured: PortalPropertyCard[];
}

export interface PortalListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PortalSitemapEntry {
  code: number;
  slug: string;
  updated_at: string;
  image: string | null;
}

export interface PortalIndexEntry {
  slug: string;
  updated_at: string;
}

/** Filtros del listado (nombres idénticos a los del API). */
export interface PortalFilters {
  operacion?: "arriendo" | "venta";
  tipo?: string;
  ciudad?: string;
  barrio?: string;
  precio_min?: number;
  precio_max?: number;
  habitaciones_min?: number;
  banos_min?: number;
  orden?: "recientes" | "precio_asc" | "precio_desc" | "destacadas";
  page?: number;
}
