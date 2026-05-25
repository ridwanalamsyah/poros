export type SanityImageAsset = {
  _ref: string;
  _type: "reference";
  metadata?: { lqip?: string; dimensions?: { width: number; height: number; aspectRatio: number } };
};

export type SanityImage = {
  _type: "image";
  asset?: SanityImageAsset;
  alt?: string;
  caption?: string;
  hotspot?: { x: number; y: number };
  lqip?: string;
};

export type Category = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  sortOrder?: number;
  color?: string;
};

export type Author = {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  image?: SanityImage;
  twitter?: string;
  instagram?: string;
  website?: string;
};

export type Edition = {
  _id: string;
  title: string;
  slug: string;
  issueNumber?: string;
  description?: string;
  coverImage?: SanityImage;
  publishedAt?: string;
};

export type PortableTextBlock = {
  _type: string;
  _key?: string;
  [key: string]: unknown;
};

export type Article = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: PortableTextBlock[];
  bodyText?: string; // mock convenience
  coverImage?: SanityImage;
  category?: Category;
  author?: Author;
  authors?: Author[];
  edition?: Edition;
  tags?: string[];
  publishedAt?: string;
  editorsPick?: boolean;
  views?: number;
  readingMinutes?: number;
};

export type Note = {
  _id: string;
  body: string;
  author?: Author;
  publishedAt?: string;
};

export type ProductSpec = {
  _key?: string;
  label?: string;
  value?: string;
};

export type Product = {
  _id: string;
  title: string;
  slug: string;
  tagline?: string;
  description?: string;
  body?: PortableTextBlock[];
  price: number; // IDR
  image?: SanityImage;
  gallery?: SanityImage[];
  specs?: ProductSpec[];
  shippingNote?: string;
  inStock?: boolean;
  featured?: boolean;
};

export type OrderItem = {
  sku: string;
  title: string;
  price: number;
  qty: number;
};

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";

export type Order = {
  _id?: string;
  orderNumber?: string;
  status: OrderStatus;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping?: number;
  total: number;
  paymentProvider?: "doku" | "manual";
  paymentRef?: string;
  paymentUrl?: string;
  placedAt?: string;
};

export type HomepageSectionKind =
  | "hero"
  | "editors"
  | "edition"
  | "notes"
  | "popular"
  | "feed"
  | "shop";

export type HomepageSection = {
  _key?: string;
  kind: HomepageSectionKind;
  enabled?: boolean;
  title?: string;
};

export type HomepageLayout = {
  sections?: HomepageSection[];
  heroArticleSlug?: string;
};

export type TipJarPlacement = "footer-center" | "footer-right" | "button" | "hidden";

export type Settings = {
  siteTitle?: string;
  siteDescription?: string;
  brandWordmark?: string;
  footerTagline?: string;
  copyrightLine?: string;
  tipJarHeading?: string;
  tipJarBlurb?: string;
  tipJarPlacement?: TipJarPlacement;
  tipJarSaweria?: string;
  tipJarTrakteer?: string;
  tipJarPatreon?: string;
  cusdisAppId?: string;
  newsletterEndpoint?: string;
  homepageLayout?: HomepageLayout;
  reactionLabels?: string[];
  colophon?: PortableTextBlock[];
};
