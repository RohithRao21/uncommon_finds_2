import { 
  db, 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  deleteDoc,
  query, 
  where 
} from './firebase';
import { Product, ProductColor, CategoryType } from '../types';
import { PRODUCTS } from '../data/products';

// Export local products as the catalog foundation
export const INITIAL_FIRESTORE_PRODUCTS: Product[] = PRODUCTS;

/**
 * Normalizes a product document from Firestore or local data.
 * CRITICAL: For catalog products, image assets ALWAYS come from local bundled imports
 * so that production builds (Vite) hash and bundle them directly, without depending
 * on Firestore string paths.
 */
export function normalizeProduct(id: string, data: any): Product {
  const targetId = id || data?.id || data?.slug || '';
  const dName = (data?.name || '').toLowerCase();
  const dId = (data?.id || id || '').toLowerCase();
  const dSlug = (data?.slug || '').toLowerCase();

  const builtIn = INITIAL_FIRESTORE_PRODUCTS.find(p => 
    p.id === targetId || 
    p.slug === targetId || 
    p.slug === data?.slug || 
    p.id === data?.id ||
    p.name.toLowerCase() === dName ||
    (dName.includes('meridian') && p.name.toLowerCase().includes('meridian')) ||
    (dName.includes('ripple') && p.name.toLowerCase().includes('ripple')) ||
    (dId.includes('meridian') && p.name.toLowerCase().includes('meridian')) ||
    (dId.includes('honeycomb') && p.id === 'honeycomb-lattice-lighter-sleeve') ||
    (dSlug.includes('meridian') && p.name.toLowerCase().includes('meridian')) ||
    (dSlug.includes('honeycomb') && p.id === 'honeycomb-lattice-lighter-sleeve') ||
    (dId.includes('rubble') && p.id === 'ripple-lighter-sleeve') ||
    (dSlug.includes('rubble') && p.id === 'ripple-lighter-sleeve') ||
    (dName.includes('prism') && p.id === 'prism-lighter-sleeve') ||
    (dId.includes('prism') && p.id === 'prism-lighter-sleeve') ||
    (dSlug.includes('prism') && p.id === 'prism-lighter-sleeve') ||
    (dId.includes('p3') && p.id === 'prism-lighter-sleeve') ||
    (dSlug.includes('p3') && p.id === 'prism-lighter-sleeve')
  );

  // If this product matches one of our local catalog products, enforce local bundled images!
  if (builtIn) {
    const colors: ProductColor[] = builtIn.colors.map(bc => {
      const matchingDbColor = (Array.isArray(data?.colors) ? data.colors : []).find(
        (c: any) => c.name && c.name.toLowerCase().trim() === bc.name.toLowerCase().trim()
      );
      return {
        ...bc,
        // ALWAYS use the local bundled image assets from bc.images!
        images: bc.images && bc.images.length > 0 ? bc.images : [builtIn.image],
        stock: matchingDbColor?.stock !== undefined ? Number(matchingDbColor.stock) : bc.stock,
        priceModifier: matchingDbColor?.priceModifier !== undefined ? Number(matchingDbColor.priceModifier) : (bc.priceModifier || 0),
      };
    });

    const totalStock = colors.reduce((acc, c) => acc + (c.stock || 0), 0);

    return {
      ...builtIn,
      name: data?.name || builtIn.name,
      tagline: data?.tagline || builtIn.tagline,
      description: data?.description || builtIn.description,
      price: Number(data?.price) || builtIn.price,
      category: (data?.category as CategoryType) || builtIn.category,
      colors,
      rating: data?.rating !== undefined ? Number(data.rating) : builtIn.rating,
      reviewCount: data?.reviewCount !== undefined ? Number(data.reviewCount) : builtIn.reviewCount,
      storyHeading: data?.storyHeading || builtIn.storyHeading,
      storyBody: data?.storyBody || builtIn.storyBody,
      isNew: data?.isNew !== undefined ? data.isNew : builtIn.isNew,
      isBestseller: data?.isBestseller !== undefined ? data.isBestseller : builtIn.isBestseller,
      specs: data?.specs || builtIn.specs,
      availableMaterials: builtIn.availableMaterials,
      // CRITICAL: ALWAYS use the local bundled images
      image: builtIn.image,
      secondaryImage: builtIn.secondaryImage,
      galleryImages: builtIn.galleryImages,
      inStock: totalStock > 0,
      stockCount: totalStock,
    };
  }

  // Fallback for custom products added strictly via Firestore Admin Dashboard
  const defaultFallbackImage = INITIAL_FIRESTORE_PRODUCTS[0]?.image || '';

  const colors: ProductColor[] = Array.isArray(data?.colors) && data.colors.length > 0
    ? data.colors.map((c: any) => ({
        name: c.name || 'Default',
        hexColor: c.hexColor || '#161616',
        stock: c.stock !== undefined ? Number(c.stock) : 10,
        priceModifier: c.priceModifier || 0,
        images: Array.isArray(c.images) && c.images.length > 0 && typeof c.images[0] === 'string' && c.images[0].trim()
          ? c.images
          : [data?.image || defaultFallbackImage]
      }))
    : [
        {
          name: 'Default',
          stock: data?.stockCount || 10,
          images: [data?.image || defaultFallbackImage],
          hexColor: '#161616'
        }
      ];

  const totalStock = colors.reduce((acc, c) => acc + (c.stock || 0), 0);
  const primaryColor = colors[0];
  const galleryImages = colors.flatMap(c => (c.images && c.images.length > 0 ? c.images : []));
  const primaryImage = primaryColor?.images?.[0] || data?.image || defaultFallbackImage;
  const secondaryImage = primaryColor?.images?.[1] || galleryImages[1] || primaryImage;

  return {
    id: targetId || 'product',
    slug: data?.slug || targetId,
    name: data?.name || 'Custom Product',
    tagline: data?.tagline || data?.description?.slice(0, 60) || '',
    description: data?.description || '',
    price: Number(data?.price) || 0,
    category: (data?.category as CategoryType) || 'lighter',
    colors,
    rating: data?.rating || 5.0,
    reviewCount: data?.reviewCount || 0,
    storyHeading: data?.storyHeading || 'Crafted with Precision',
    storyBody: data?.storyBody || data?.description || '',
    isNew: data?.isNew !== undefined ? data.isNew : false,
    isBestseller: data?.isBestseller !== undefined ? data.isBestseller : false,
    specs: data?.specs || {
      layerHeight: '0.12 mm',
      infillType: '100% Perimeter',
      printTime: '2 Hours',
      weight: '50g',
      nozzleSize: '0.4mm',
      durabilityRating: 'Industrial Toughness'
    },
    availableMaterials: colors.map(c => ({
      id: c.name.toUpperCase().replace(/\s+/g, '-'),
      name: c.name,
      hexColor: c.hexColor || '#333333',
      textureName: 'Matte Finish',
      priceModifier: c.priceModifier || 0,
      image: (c.images && c.images[0]) || primaryImage,
      galleryImages: c.images && c.images.length > 0 ? c.images : [primaryImage]
    })),
    image: primaryImage,
    secondaryImage,
    galleryImages,
    inStock: totalStock > 0,
    stockCount: totalStock,
  };
}

/**
 * Fetch all products, guaranteeing that built-in catalog products use local image assets
 */
export async function getProductsFromFirestore(): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    const dbDocsMap = new Map<string, any>();
    snapshot.docs.forEach(docSnap => {
      dbDocsMap.set(docSnap.id, docSnap.data());
    });

    // Start with all local PRODUCTS from src/data/products.ts
    const resultProducts: Product[] = PRODUCTS.map(localProd => {
      const dbData = dbDocsMap.get(localProd.id) || 
                     dbDocsMap.get(localProd.slug) || 
                     Array.from(dbDocsMap.values()).find((d: any) => 
                       (d?.name && d.name.toLowerCase() === localProd.name.toLowerCase()) ||
                       (localProd.name.toLowerCase().includes('meridian') && (d?.name?.toLowerCase().includes('meridian') || d?.slug?.includes('meridian') || d?.slug?.includes('honeycomb'))) ||
                       (localProd.name.toLowerCase().includes('ripple') && (d?.name?.toLowerCase().includes('ripple') || d?.slug?.includes('ripple') || d?.slug?.includes('rubble')))
                     );

      if (dbData) {
        return normalizeProduct(localProd.id, dbData);
      }
      return localProd;
    });

    // Add any non-standard products from Firestore (excluding obsolete dummy IDs)
    const obsoleteIds = ['nomad-edc-tray', 'apex-headphone-stand', 'rubble-lighter-sleeve-01', 'meridian-lighter-sleeve', 'p2-lighter-sleeve'];
    for (const [docId, dbData] of dbDocsMap.entries()) {
      if (obsoleteIds.includes(docId)) continue;
      const isAlreadyInResult = resultProducts.some(p => 
        p.id === docId || 
        p.slug === dbData.slug || 
        p.name.toLowerCase() === (dbData.name || '').toLowerCase() ||
        ((dbData.name || '').toLowerCase().includes('meridian') && p.name.toLowerCase().includes('meridian')) ||
        ((dbData.name || '').toLowerCase().includes('ripple') && p.name.toLowerCase().includes('ripple'))
      );
      if (!isAlreadyInResult) {
        resultProducts.push(normalizeProduct(docId, dbData));
      }
    }

    return resultProducts;
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
    // Fallback directly to static initial dataset with local images
    return PRODUCTS;
  }
}

/**
 * Fetch a single product by slug from Firestore or local catalog
 */
export async function getProductBySlugFromFirestore(slug: string): Promise<Product | null> {
  const localMatch = PRODUCTS.find(p => p.slug === slug || p.id === slug);
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return normalizeProduct(docSnap.id, docSnap.data());
    }

    const directDoc = await getDoc(doc(db, 'products', slug));
    if (directDoc.exists()) {
      return normalizeProduct(directDoc.id, directDoc.data());
    }

    return localMatch || null;
  } catch (error) {
    console.error(`Error fetching product by slug '${slug}' from Firestore:`, error);
    return localMatch || null;
  }
}

/**
 * Seed initial products into Firestore and remove obsolete dummy products
 */
export async function seedProductsIfEmpty(): Promise<void> {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    const obsoleteIds = [
      'nomad-edc-tray',
      'apex-headphone-stand',
      'rubble-lighter-sleeve-01',
      'meridian-lighter-sleeve',
      'p2-lighter-sleeve'
    ];

    for (const docSnap of snapshot.docs) {
      if (obsoleteIds.includes(docSnap.id)) {
        try {
          await deleteDoc(doc(db, 'products', docSnap.id));
        } catch (e) {
          console.warn(`Could not delete obsolete doc ${docSnap.id}`, e);
        }
      }
    }

    // Seed / update built-in catalog items in Firestore
    for (const prod of INITIAL_FIRESTORE_PRODUCTS) {
      const docRef = doc(db, 'products', prod.id);
      await setDoc(docRef, {
        id: prod.id,
        slug: prod.slug,
        name: prod.name,
        description: prod.description,
        price: prod.price,
        category: prod.category,
        colors: prod.colors.map(c => ({
          name: c.name,
          stock: c.stock,
          hexColor: c.hexColor,
          priceModifier: c.priceModifier || 0,
        })),
        tagline: prod.tagline,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        storyHeading: prod.storyHeading,
        storyBody: prod.storyBody,
        isNew: prod.isNew,
        isBestseller: prod.isBestseller,
        specs: prod.specs,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error seeding initial products into Firestore:', error);
  }
}

/**
 * Create a new product in Firestore
 */
export async function createProductInFirestore(product: Partial<Product>): Promise<string> {
  const docId = product.id || product.slug || `prod-${Date.now()}`;
  const slug = product.slug || docId;
  const docRef = doc(db, 'products', docId);
  const primaryImg = product.image || product.colors?.[0]?.images?.[0] || INITIAL_FIRESTORE_PRODUCTS[0]?.image || '';

  const payload = {
    id: docId,
    slug: slug,
    name: product.name || 'New 3D Print Product',
    tagline: product.tagline || '',
    description: product.description || '',
    price: Number(product.price) || 0,
    category: product.category || 'lighter',
    image: primaryImg,
    colors: product.colors || [
      { name: 'Onyx Black', stock: 10, hexColor: '#161616', images: [primaryImg] }
    ],
    rating: product.rating || 5.0,
    reviewCount: product.reviewCount || 0,
    storyHeading: product.storyHeading || 'Precision Additive Manufacturing',
    storyBody: product.storyBody || product.description || '',
    isNew: product.isNew !== undefined ? product.isNew : true,
    isBestseller: product.isBestseller || false,
    specs: product.specs || {
      layerHeight: '0.12 mm',
      infillType: '100% Perimeter',
      printTime: '2 Hours',
      weight: '30g',
      nozzleSize: '0.4mm',
      durabilityRating: 'Industrial Toughness'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, payload, { merge: true });
  return docId;
}

/**
 * Update an existing product in Firestore
 */
export async function updateProductInFirestore(id: string, productData: Partial<Product>): Promise<void> {
  const docRef = doc(db, 'products', id);
  const payload: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };

  if (productData.name !== undefined) payload.name = productData.name;
  if (productData.slug !== undefined) payload.slug = productData.slug;
  if (productData.tagline !== undefined) payload.tagline = productData.tagline;
  if (productData.description !== undefined) payload.description = productData.description;
  if (productData.price !== undefined) payload.price = Number(productData.price);
  if (productData.category !== undefined) payload.category = productData.category;
  if (productData.colors !== undefined) payload.colors = productData.colors;
  if (productData.rating !== undefined) payload.rating = Number(productData.rating);
  if (productData.reviewCount !== undefined) payload.reviewCount = Number(productData.reviewCount);
  if (productData.storyHeading !== undefined) payload.storyHeading = productData.storyHeading;
  if (productData.storyBody !== undefined) payload.storyBody = productData.storyBody;
  if (productData.isNew !== undefined) payload.isNew = productData.isNew;
  if (productData.isBestseller !== undefined) payload.isBestseller = productData.isBestseller;
  if (productData.specs !== undefined) payload.specs = productData.specs;

  await setDoc(docRef, payload, { merge: true });
}

/**
 * Delete a product from Firestore
 */
export async function deleteProductFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, 'products', id);
  await deleteDoc(docRef);
}

/**
 * Update stock count for a specific color variant or full colors list
 */
export async function updateProductStockInFirestore(id: string, updatedColors: ProductColor[]): Promise<void> {
  const docRef = doc(db, 'products', id);
  await setDoc(docRef, {
    colors: updatedColors,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}
