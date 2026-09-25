export type MaterialType = 'PETG-CF' | 'PLA-CARBON' | 'TITANIUM-GREY' | 'TRANSLUCENT-FROST' | 'BRASS-PLA' | 'MATTE-ONYX' | 'BLACK' | 'WHITE' | 'ORANGE' | 'PINK' | 'DARK BLUE' | 'NEON GREEN' | string;

export type CategoryType = 'all' | 'lighter' | 'desk' | 'edc' | 'audio' | 'parametric';

export interface ExplodedComponent {
  id: string;
  name: string;
  description: string;
  material: string;
  offsetY: number; // For exploded view offset animation
}

export interface ProductColor {
  name: string;
  stock: number;
  images: string[];
  hexColor?: string;
  priceModifier?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: CategoryType;
  colors: ProductColor[];
  tagline?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  secondaryImage?: string;
  galleryImages?: string[];
  storyHeading?: string;
  storyBody?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  isSpecialEdition?: boolean;
  specialEditionLabel?: string;
  specialEditionReference?: string;
  specs?: {
    layerHeight: string;
    infillType: string;
    printTime: string;
    weight: string;
    nozzleSize: string;
    durabilityRating: string;
    hardwareIncluded?: string;
  };
  availableMaterials?: {
    id: MaterialType;
    name: string;
    hexColor: string;
    textureName: string;
    priceModifier: number;
    image?: string;
    galleryImages?: string[];
  }[];
  explodedComponents?: ExplodedComponent[];
  inStock?: boolean;
  stockCount?: number;
}

export interface CartItem {
  id: string; // Unique cart item ID (e.g. productId_selectedColor)
  productId: string;
  productName: string;
  selectedColor: string;
  quantity: number;
  price: number;
  image: string;
  
  // Optional metadata for UI and stock calculation
  unitPrice: number;
  selectedMaterial: MaterialType;
  selectedLayerHeight?: string;
  customEngraving?: string;
  maxStock?: number;
  product?: Product;
}

export interface CustomPrintOrder {
  modelName: string;
  material: MaterialType;
  infillDensity: number;
  layerHeight: string;
  customColor: string;
  dimensions: { x: number; y: number; z: number };
  quantity: number;
  estimatedHours: number;
  estimatedPrice: number;
  notes: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  selectedColor: string;
  quantity: number;
  price: number;
  subtotal: number;
  image: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | string;
  orderStatus: 'Pending' | 'Processing' | 'Printing' | 'Shipped' | 'Delivered' | 'Cancelled' | string;
  createdAt: any;
  deliveryMethod?: {
    id: string;
    name: string;
    price: number;
    estDays: string;
  };
  paymentMethod?: string;
  jobId?: string;
}


