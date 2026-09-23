import { Product, CategoryType } from '../types';

// ==========================================
// LOCAL IMAGE ASSETS (Imported via standard Vite asset bundling)
// ==========================================

// P1 MERIDIAN IMAGES
import p1Black1 from '../assets/images/p1/BLACK/p1-black-1.png';
import p1Black2 from '../assets/images/p1/BLACK/p1-black-2.png';
import p1Black3 from '../assets/images/p1/BLACK/p1-black-3.png';
import p1Black4 from '../assets/images/p1/BLACK/p1-black-4.png';
import p1Black5 from '../assets/images/p1/BLACK/p1-black-5.png';

import p1Blue1 from '../assets/images/p1/BLUE/p1-blue-1.png';
import p1Blue2 from '../assets/images/p1/BLUE/p1-blue-2.png';
import p1Blue3 from '../assets/images/p1/BLUE/p1-blue-3.png';
import p1Blue4 from '../assets/images/p1/BLUE/p1-blue-4.png';
import p1Blue5 from '../assets/images/p1/BLUE/p1-blue-5.png';

import p1Db1 from '../assets/images/p1/DB/p1-darkblue-1.png';
import p1Db2 from '../assets/images/p1/DB/p1-darkblue-2.png';
import p1Db3 from '../assets/images/p1/DB/p1-darkblue-3.png';
import p1Db4 from '../assets/images/p1/DB/p1-darkblue-4.png';
import p1Db5 from '../assets/images/p1/DB/p1-darkblue-5.png';

import p1Green1 from '../assets/images/p1/GREEN/p1-green-1.png';
import p1Green2 from '../assets/images/p1/GREEN/p1-green-2.png';
import p1Green3 from '../assets/images/p1/GREEN/p1-green-3.png';
import p1Green4 from '../assets/images/p1/GREEN/p1-green-4.png';
import p1Green5 from '../assets/images/p1/GREEN/p1-green-5.png';

import p1Neon1 from '../assets/images/p1/NEON GREEN/p1-neon-1.png';
import p1Neon2 from '../assets/images/p1/NEON GREEN/p1-neon-2.png';
import p1Neon3 from '../assets/images/p1/NEON GREEN/p1-neon-3.png';
import p1Neon4 from '../assets/images/p1/NEON GREEN/p1-neon-4.png';
import p1Neon5 from '../assets/images/p1/NEON GREEN/p1-neon-5.png';

import p1Orange1 from '../assets/images/p1/ORANGE/p1-orange-1.png';
import p1Orange2 from '../assets/images/p1/ORANGE/p1-orange-2.png';
import p1Orange3 from '../assets/images/p1/ORANGE/p1-orange-3.png';
import p1Orange4 from '../assets/images/p1/ORANGE/p1-orange-4.png';
import p1Orange5 from '../assets/images/p1/ORANGE/p1-orange-5.png';

import p1Pink1 from '../assets/images/p1/PINK/p1-pink-1.png';
import p1Pink2 from '../assets/images/p1/PINK/p1-pink-2.png';
import p1Pink3 from '../assets/images/p1/PINK/p1-pink-3.png';
import p1Pink4 from '../assets/images/p1/PINK/p1-pink-4.png';
import p1Pink5 from '../assets/images/p1/PINK/p1-pink-5.png';

import p1Red1 from '../assets/images/p1/RED/p1-red-1.png';
import p1Red2 from '../assets/images/p1/RED/p1-red-2.png';
import p1Red3 from '../assets/images/p1/RED/p1-red-3.png';
import p1Red4 from '../assets/images/p1/RED/p1-red-4.png';
import p1Red5 from '../assets/images/p1/RED/p1-red-5.png';

import p1White1 from '../assets/images/p1/WHITE/p1-white-1.png';
import p1White2 from '../assets/images/p1/WHITE/p1-white-2.png';
import p1White3 from '../assets/images/p1/WHITE/p1-white-3.png';
import p1White4 from '../assets/images/p1/WHITE/p1-white-4.png';
import p1White5 from '../assets/images/p1/WHITE/p1-white-5.png';

import p1Yellow1 from '../assets/images/p1/YELLOW/p1-yellow-1.png';
import p1Yellow2 from '../assets/images/p1/YELLOW/p1-yellow-2.png';
import p1Yellow3 from '../assets/images/p1/YELLOW/p1-yellow-3.png';
import p1Yellow4 from '../assets/images/p1/YELLOW/p1-yellow-4.png';
import p1Yellow5 from '../assets/images/p1/YELLOW/p1-yellow-5.png';

// P2 RIPPLE IMAGES
import p2Black1 from '../assets/images/p2/BLACK/p2-black-1.png';
import p2Black2 from '../assets/images/p2/BLACK/p2-black-2.png';
import p2Black3 from '../assets/images/p2/BLACK/p2-black-3.png';
import p2Black4 from '../assets/images/p2/BLACK/p2-black-4.png';
import p2Black5 from '../assets/images/p2/BLACK/p2-black-5.png';

import p2Blue1 from '../assets/images/p2/BLUE/p2-blue-1.png';
import p2Blue2 from '../assets/images/p2/BLUE/p2-blue-2.png';
import p2Blue3 from '../assets/images/p2/BLUE/p2-blue-3.png';
import p2Blue4 from '../assets/images/p2/BLUE/p2-blue-4.png';
import p2Blue5 from '../assets/images/p2/BLUE/p2-blue-5.png';

import p2Db1 from '../assets/images/p2/DB/p2-db-1.png';
import p2Db2 from '../assets/images/p2/DB/p2-db-2.png';
import p2Db3 from '../assets/images/p2/DB/p2-db-3.png';
import p2Db4 from '../assets/images/p2/DB/p2-db-4.png';
import p2Db5 from '../assets/images/p2/DB/p2-db-5.png';

import p2Green1 from '../assets/images/p2/GREEN/p2-green-1.png';
import p2Green2 from '../assets/images/p2/GREEN/p2-green-2.png';
import p2Green3 from '../assets/images/p2/GREEN/p2-green-3.png';
import p2Green4 from '../assets/images/p2/GREEN/p2-green-4.png';
import p2Green5 from '../assets/images/p2/GREEN/p2-green-5.png';

import p2Neon1 from '../assets/images/p2/NEON/p2-neon-1.png';
import p2Neon2 from '../assets/images/p2/NEON/p2-neon-2.png';
import p2Neon3 from '../assets/images/p2/NEON/p2-neon-3.png';
import p2Neon4 from '../assets/images/p2/NEON/p2-neon-4.png';
import p2Neon5 from '../assets/images/p2/NEON/p2-neon-5.png';

import p2Orange1 from '../assets/images/p2/ORANGE/p2-orange-1.png';
import p2Orange2 from '../assets/images/p2/ORANGE/p2-orange-2.png';
import p2Orange3 from '../assets/images/p2/ORANGE/p2-orange-3.png';
import p2Orange4 from '../assets/images/p2/ORANGE/p2-orange-4.png';
import p2Orange5 from '../assets/images/p2/ORANGE/p2-orange-5.png';

import p2Pink1 from '../assets/images/p2/PINK/p2-pink-1.png';
import p2Pink2 from '../assets/images/p2/PINK/p2-pink-2.png';
import p2Pink3 from '../assets/images/p2/PINK/p2-pink-3.png';
import p2Pink4 from '../assets/images/p2/PINK/p2-pink-4.png';
import p2Pink5 from '../assets/images/p2/PINK/p2-pink-5.png';

import p2Red1 from '../assets/images/p2/RED/p2-red-1.png';
import p2Red2 from '../assets/images/p2/RED/p2-red-2.png';
import p2Red3 from '../assets/images/p2/RED/p2-red-3.png';
import p2Red4 from '../assets/images/p2/RED/p2-red-4.png';
import p2Red5 from '../assets/images/p2/RED/p2-red-5.png';

import p2White1 from '../assets/images/p2/WHITE/p2-white-1.png';
import p2White2 from '../assets/images/p2/WHITE/p2-white-2.png';
import p2White3 from '../assets/images/p2/WHITE/p2-white-3.png';
import p2White4 from '../assets/images/p2/WHITE/p2-white-4.png';
import p2White5 from '../assets/images/p2/WHITE/p2-white-5.png';

import p2Yellow1 from '../assets/images/p2/YELLOW/p2-yellow-1.png';
import p2Yellow2 from '../assets/images/p2/YELLOW/p2-yellow-2.png';
import p2Yellow3 from '../assets/images/p2/YELLOW/p2-yellow-3.png';
import p2Yellow4 from '../assets/images/p2/YELLOW/p2-yellow-4.png';
import p2Yellow5 from '../assets/images/p2/YELLOW/p2-yellow-5.png';

// P3 PRISM IMAGES
import p3Black1 from '../assets/images/p3/BLACK/p3-black-1.png';
import p3Black2 from '../assets/images/p3/BLACK/p3-black-2.png';
import p3Black3 from '../assets/images/p3/BLACK/p3-black-3.png';
import p3Black4 from '../assets/images/p3/BLACK/p3-black-4.png';
import p3Black5 from '../assets/images/p3/BLACK/p3-black-5.png';

import p3Blue1 from '../assets/images/p3/BLUE/p3-blue-1.png';
import p3Blue2 from '../assets/images/p3/BLUE/p3-blue-2.png';
import p3Blue3 from '../assets/images/p3/BLUE/p3-blue-3.png';
import p3Blue4 from '../assets/images/p3/BLUE/p3-blue-4.png';
import p3Blue5 from '../assets/images/p3/BLUE/p3-blue-5.png';

import p3Db1 from '../assets/images/p3/DB/p3-db-1.png';
import p3Db2 from '../assets/images/p3/DB/p3-db-2.png';
import p3Db3 from '../assets/images/p3/DB/p3-db-3.png';
import p3Db4 from '../assets/images/p3/DB/p3-db-4.png';
import p3Db5 from '../assets/images/p3/DB/p3-db-5.png';

import p3Green1 from '../assets/images/p3/GREEN/p3-green-1.png';
import p3Green2 from '../assets/images/p3/GREEN/p3-green-2.png';
import p3Green3 from '../assets/images/p3/GREEN/p3-green-3.png';
import p3Green4 from '../assets/images/p3/GREEN/p3-green-4.png';
import p3Green5 from '../assets/images/p3/GREEN/p3-green-5.png';

import p3Neon1 from '../assets/images/p3/NEON/p3-neon-1.png';
import p3Neon2 from '../assets/images/p3/NEON/p3-neon-2.png';
import p3Neon3 from '../assets/images/p3/NEON/p3-neon-3.png';
import p3Neon4 from '../assets/images/p3/NEON/p3-neon-4.png';
import p3Neon5 from '../assets/images/p3/NEON/p3-neon-5.png';

import p3Orange1 from '../assets/images/p3/ORANGE/p3-orange-1.png';
import p3Orange2 from '../assets/images/p3/ORANGE/p3-orange-2.png';
import p3Orange3 from '../assets/images/p3/ORANGE/p3-orange-3.png';
import p3Orange4 from '../assets/images/p3/ORANGE/p3-orange-4.png';
import p3Orange5 from '../assets/images/p3/ORANGE/p3-orange-5.png';

import p3Pink1 from '../assets/images/p3/PINK/p3-pink-1.png';
import p3Pink2 from '../assets/images/p3/PINK/p3-pink-2.png';
import p3Pink3 from '../assets/images/p3/PINK/p3-pink-3.png';
import p3Pink4 from '../assets/images/p3/PINK/p3-pink-4.png';
import p3Pink5 from '../assets/images/p3/PINK/p3-pink-5.png';

import p3Red1 from '../assets/images/p3/RED/p3-red-1.png';
import p3Red2 from '../assets/images/p3/RED/p3-red-2.png';
import p3Red3 from '../assets/images/p3/RED/p3-red-3.png';
import p3Red4 from '../assets/images/p3/RED/p3-red-4.png';
import p3Red5 from '../assets/images/p3/RED/p3-red-5.png';

import p3White1 from '../assets/images/p3/WHITE/p3-white-1.png';
import p3White2 from '../assets/images/p3/WHITE/p3-white-2.png';
import p3White3 from '../assets/images/p3/WHITE/p3-white-3.png';
import p3White4 from '../assets/images/p3/WHITE/p3-white-4.png';
import p3White5 from '../assets/images/p3/WHITE/p3-white-5.png';

import p3Yellow1 from '../assets/images/p3/YELLOW/p3-yellow-1.png';
import p3Yellow2 from '../assets/images/p3/YELLOW/p3-yellow-2.png';
import p3Yellow3 from '../assets/images/p3/YELLOW/p3-yellow-3.png';
import p3Yellow4 from '../assets/images/p3/YELLOW/p3-yellow-4.png';
import p3Yellow5 from '../assets/images/p3/YELLOW/p3-yellow-5.png';

// P4 SOAP BAR / FIGHT CLUB IMAGES
import p4Pink1 from '../assets/images/p4/PINK/p4-pink-1.png';
import p4Pink2 from '../assets/images/p4/PINK/p4-pink-2.png';
import p4Pink3 from '../assets/images/p4/PINK/p4-pink-3.png';
import p4Pink4 from '../assets/images/p4/PINK/p4-pink-4.png';
import p4Pink5 from '../assets/images/p4/PINK/p4-pink-5.png';

export const MATERIAL_DETAILS: Record<string, {
  name: string;
  tagline: string;
  density: string;
  tensile: string;
  tempResistance: string;
  finishDescription: string;
  bestFor: string;
  description: string;
  highlights: string[];
}> = {
  'PETG-CF': {
    name: 'Cobalt Blue Soft-Touch',
    tagline: 'High Durability Polymer with Silky Tactile Grip',
    density: '1.27 g/cm³',
    tensile: '52 MPa',
    tempResistance: '78°C',
    finishDescription: 'Vibrant cobalt blue matte finish engineered for ergonomic handfeel.',
    bestFor: 'Everyday Carry & Tactical Sleeves',
    description: 'Vibrant cobalt blue matte finish engineered for ergonomic handfeel and high impact strength.',
    highlights: ['Ergonomic Grip', 'Impact Resistant', 'Pocket Carry']
  },
  'MATTE-ONYX': {
    name: 'Stealth Black Matte',
    tagline: 'Deep Non-Reflective Ultra-Matte Surface',
    density: '1.24 g/cm³',
    tensile: '48 MPa',
    tempResistance: '70°C',
    finishDescription: 'Sleek dark matte finish absorbing surface reflection.',
    bestFor: 'Minimalist & Stealth Aesthetics',
    description: 'Ultra-matte black polymer absorbing reflections for a stealth minimal appearance.',
    highlights: ['Non-Reflective', 'Ultra-Lightweight', 'Stealth Aesthetic']
  },
  'TRANSLUCENT-FROST': {
    name: 'Frost White Polycarbonate',
    tagline: 'Semi-Glassy Diffuse White Finish',
    density: '1.20 g/cm³',
    tensile: '60 MPa',
    tempResistance: '95°C',
    finishDescription: 'Semi-transparent diffuse finish with clean frosted glow.',
    bestFor: 'High Temperature & Crisp Visual Impact',
    description: 'Translucent polycarbonate shell with frosted diffuse light qualities.',
    highlights: ['High Temp Shield', 'Diffuse Glow', 'Shatter-Proof']
  }
};

export const PRODUCTS: Product[] = [
  {
    id: 'honeycomb-lattice-lighter-sleeve',
    slug: 'honeycomb-lattice-lighter-sleeve',
    name: 'Meridian',
    tagline: 'Precision 3D geometric lattice armor sleeve for standard lighters',
    category: 'lighter' as CategoryType,
    price: 299,
    rating: 5.0,
    reviewCount: 48,
    image: p1Black1,
    secondaryImage: p1Black2,
    galleryImages: [
      p1Black1,
      p1Black2,
      p1Black3,
      p1Black4,
      p1Black5
    ],
    description: 'A precision lighter sleeve with an open honeycomb lattice architecture. The geometric structure dissipates impact, gives a textured non-slip hold, and sheds pocket lint while staying ultra-light. (Note: Lighter is not included).',
    storyHeading: 'Generative Honeycomb Geometry',
    storyBody: 'Engineered using algorithmic honeycomb matrices that distribute drop forces evenly across the exoskeleton while drastically cutting weight. Designed for seamless daily carry.',
    isNew: false,
    isBestseller: true,
    specs: {
      layerHeight: '0.10 mm',
      infillType: 'Generative Gyroid Structure',
      printTime: '2.2 Hours',
      weight: '19g',
      nozzleSize: '0.4mm Hardened Steel',
      durabilityRating: 'Impact Resistant Polymer Matrix',
      hardwareIncluded: 'Engineered Internal Retention Ribs'
    },
    colors: [
      {
        name: 'Onyx Black',
        stock: 18,
        hexColor: '#161616',
        images: [p1Black1, p1Black2, p1Black3, p1Black4, p1Black5]
      },
      {
        name: 'Cobalt Blue',
        stock: 12,
        hexColor: '#1d72f3',
        images: [p1Blue1, p1Blue2, p1Blue3, p1Blue4, p1Blue5]
      },
      {
        name: 'Dark Blue',
        stock: 15,
        hexColor: '#0a2540',
        images: [p1Db1, p1Db2, p1Db3, p1Db4, p1Db5]
      },
      {
        name: 'Emerald Green',
        stock: 14,
        hexColor: '#10b981',
        images: [p1Green1, p1Green2, p1Green3, p1Green4, p1Green5]
      },
      {
        name: 'Neon Cyber Green',
        stock: 8,
        hexColor: '#30d158',
        images: [p1Neon1, p1Neon2, p1Neon3, p1Neon4, p1Neon5]
      },
      {
        name: 'Signal Orange',
        stock: 14,
        hexColor: '#ff6b00',
        images: [p1Orange1, p1Orange2, p1Orange3, p1Orange4, p1Orange5]
      },
      {
        name: 'Blush Pink',
        stock: 11,
        hexColor: '#ffb6c1',
        images: [p1Pink1, p1Pink2, p1Pink3, p1Pink4, p1Pink5]
      },
      {
        name: 'Signal Red',
        stock: 15,
        hexColor: '#e63946',
        images: [p1Red1, p1Red2, p1Red3, p1Red4, p1Red5]
      },
      {
        name: 'Frost White',
        stock: 16,
        hexColor: '#f2f2f7',
        images: [p1White1, p1White2, p1White3, p1White4, p1White5]
      },
      {
        name: 'Cyber Yellow',
        stock: 16,
        hexColor: '#f59e0b',
        images: [p1Yellow1, p1Yellow2, p1Yellow3, p1Yellow4, p1Yellow5]
      }
    ],
    availableMaterials: [
      { id: 'BLACK', name: 'Onyx Black', hexColor: '#161616', textureName: 'Matte Polymer', priceModifier: 0, image: p1Black1, galleryImages: [p1Black1, p1Black2, p1Black3, p1Black4, p1Black5] },
      { id: 'BLUE', name: 'Cobalt Blue', hexColor: '#1d72f3', textureName: 'Matte Polymer', priceModifier: 0, image: p1Blue1, galleryImages: [p1Blue1, p1Blue2, p1Blue3, p1Blue4, p1Blue5] },
      { id: 'DARK BLUE', name: 'Dark Blue', hexColor: '#0a2540', textureName: 'Matte Polymer', priceModifier: 0, image: p1Db1, galleryImages: [p1Db1, p1Db2, p1Db3, p1Db4, p1Db5] },
      { id: 'GREEN', name: 'Emerald Green', hexColor: '#10b981', textureName: 'Matte Polymer', priceModifier: 0, image: p1Green1, galleryImages: [p1Green1, p1Green2, p1Green3, p1Green4, p1Green5] },
      { id: 'NEON GREEN', name: 'Neon Cyber Green', hexColor: '#30d158', textureName: 'Matte Polymer', priceModifier: 0, image: p1Neon1, galleryImages: [p1Neon1, p1Neon2, p1Neon3, p1Neon4, p1Neon5] },
      { id: 'ORANGE', name: 'Signal Orange', hexColor: '#ff6b00', textureName: 'Matte Polymer', priceModifier: 0, image: p1Orange1, galleryImages: [p1Orange1, p1Orange2, p1Orange3, p1Orange4, p1Orange5] },
      { id: 'PINK', name: 'Blush Pink', hexColor: '#ffb6c1', textureName: 'Matte Polymer', priceModifier: 0, image: p1Pink1, galleryImages: [p1Pink1, p1Pink2, p1Pink3, p1Pink4, p1Pink5] },
      { id: 'RED', name: 'Signal Red', hexColor: '#e63946', textureName: 'Matte Polymer', priceModifier: 0, image: p1Red1, galleryImages: [p1Red1, p1Red2, p1Red3, p1Red4, p1Red5] },
      { id: 'WHITE', name: 'Frost White', hexColor: '#f2f2f7', textureName: 'Matte Polymer', priceModifier: 0, image: p1White1, galleryImages: [p1White1, p1White2, p1White3, p1White4, p1White5] },
      { id: 'YELLOW', name: 'Cyber Yellow', hexColor: '#f59e0b', textureName: 'Matte Polymer', priceModifier: 0, image: p1Yellow1, galleryImages: [p1Yellow1, p1Yellow2, p1Yellow3, p1Yellow4, p1Yellow5] }
    ],
    explodedComponents: [
      { id: 'm1', name: 'Geometric Matrix Armor', description: 'Honeycomb lattice generative architecture dispersing heat and impact shock.', material: 'Engineering Matte Polymer', offsetY: -25 },
      { id: 'm2', name: 'Hexagonal Ventilation Grid', description: 'Open lattice geometry maintaining minimum weight and positive grip friction.', material: 'Precision Polymer', offsetY: 0 },
      { id: 'm3', name: 'Retention Snap Collar', description: 'Internal friction collar locking standard lighters firmly in place.', material: 'Impact Resistant Resin', offsetY: 25 }
    ],
    inStock: true,
    stockCount: 139
  },
  {
    id: 'ripple-lighter-sleeve',
    slug: 'ripple-lighter-sleeve',
    name: 'Ripple',
    tagline: 'A sculpted sleeve for a standard lighter with wave grip profile',
    category: 'lighter' as CategoryType,
    price: 249,
    rating: 5.0,
    reviewCount: 128,
    image: p2Black1,
    secondaryImage: p2Black2,
    galleryImages: [
      p2Black1,
      p2Black2,
      p2Black3,
      p2Black4,
      p2Black5
    ],
    description: "A sculpted sleeve for a standard lighter. The Ripple's wave profile locks into your grip, so it sits naturally in the hand and never slips out of a pocket. Soft matte finish, precise fit, and a clean cut-out for the striker and flame guard. (Note: Lighter is not included).",
    storyHeading: 'Tactile Wave Ergonomics',
    storyBody: 'Calculated with smooth wave profiles that align naturally with finger posture. Crafted in distinct colourways for everyday carry and minimalist spaces.',
    isNew: true,
    isBestseller: true,
    specs: {
      layerHeight: '0.12 mm',
      infillType: '100% Perimeter Walls',
      printTime: '1.8 Hours',
      weight: '24g',
      nozzleSize: '0.4mm Diamond-Coated',
      durabilityRating: 'Impact Resistant Polymer',
      hardwareIncluded: 'Precision Snap-Fit Retention'
    },
    colors: [
      {
        name: 'Onyx Black',
        stock: 25,
        hexColor: '#161616',
        images: [p2Black1, p2Black2, p2Black3, p2Black4, p2Black5]
      },
      {
        name: 'Cobalt Blue',
        stock: 18,
        hexColor: '#2563eb',
        images: [p2Blue1, p2Blue2, p2Blue3, p2Blue4, p2Blue5]
      },
      {
        name: 'Dark Blue',
        stock: 14,
        hexColor: '#0a2540',
        images: [p2Db1, p2Db2, p2Db3, p2Db4, p2Db5]
      },
      {
        name: 'Emerald Green',
        stock: 15,
        hexColor: '#10b981',
        images: [p2Green1, p2Green2, p2Green3, p2Green4, p2Green5]
      },
      {
        name: 'Neon Cyber Green',
        stock: 12,
        hexColor: '#30d158',
        images: [p2Neon1, p2Neon2, p2Neon3, p2Neon4, p2Neon5]
      },
      {
        name: 'Signal Orange',
        stock: 19,
        hexColor: '#ff6b00',
        images: [p2Orange1, p2Orange2, p2Orange3, p2Orange4, p2Orange5]
      },
      {
        name: 'Blush Pink',
        stock: 10,
        hexColor: '#ffb6c1',
        images: [p2Pink1, p2Pink2, p2Pink3, p2Pink4, p2Pink5]
      },
      {
        name: 'Signal Red',
        stock: 20,
        hexColor: '#e63946',
        images: [p2Red1, p2Red2, p2Red3, p2Red4, p2Red5]
      },
      {
        name: 'Frost White',
        stock: 14,
        hexColor: '#f2f2f7',
        images: [p2White1, p2White2, p2White3, p2White4, p2White5]
      },
      {
        name: 'Cyber Yellow',
        stock: 17,
        hexColor: '#f59e0b',
        images: [p2Yellow1, p2Yellow2, p2Yellow3, p2Yellow4, p2Yellow5]
      }
    ],
    availableMaterials: [
      { id: 'BLACK', name: 'Onyx Black', hexColor: '#161616', textureName: 'Matte Finish', priceModifier: 0, image: p2Black1, galleryImages: [p2Black1, p2Black2, p2Black3, p2Black4, p2Black5] },
      { id: 'BLUE', name: 'Cobalt Blue', hexColor: '#2563eb', textureName: 'Matte Finish', priceModifier: 0, image: p2Blue1, galleryImages: [p2Blue1, p2Blue2, p2Blue3, p2Blue4, p2Blue5] },
      { id: 'DARK BLUE', name: 'Dark Blue', hexColor: '#0a2540', textureName: 'Matte Finish', priceModifier: 0, image: p2Db1, galleryImages: [p2Db1, p2Db2, p2Db3, p2Db4, p2Db5] },
      { id: 'GREEN', name: 'Emerald Green', hexColor: '#10b981', textureName: 'Matte Finish', priceModifier: 0, image: p2Green1, galleryImages: [p2Green1, p2Green2, p2Green3, p2Green4, p2Green5] },
      { id: 'NEON GREEN', name: 'Neon Cyber Green', hexColor: '#30d158', textureName: 'Matte Finish', priceModifier: 0, image: p2Neon1, galleryImages: [p2Neon1, p2Neon2, p2Neon3, p2Neon4, p2Neon5] },
      { id: 'ORANGE', name: 'Signal Orange', hexColor: '#ff6b00', textureName: 'Matte Finish', priceModifier: 0, image: p2Orange1, galleryImages: [p2Orange1, p2Orange2, p2Orange3, p2Orange4, p2Orange5] },
      { id: 'PINK', name: 'Blush Pink', hexColor: '#ffb6c1', textureName: 'Matte Finish', priceModifier: 0, image: p2Pink1, galleryImages: [p2Pink1, p2Pink2, p2Pink3, p2Pink4, p2Pink5] },
      { id: 'RED', name: 'Signal Red', hexColor: '#e63946', textureName: 'Matte Finish', priceModifier: 0, image: p2Red1, galleryImages: [p2Red1, p2Red2, p2Red3, p2Red4, p2Red5] },
      { id: 'WHITE', name: 'Frost White', hexColor: '#f2f2f7', textureName: 'Matte Finish', priceModifier: 0, image: p2White1, galleryImages: [p2White1, p2White2, p2White3, p2White4, p2White5] },
      { id: 'YELLOW', name: 'Cyber Yellow', hexColor: '#f59e0b', textureName: 'Matte Finish', priceModifier: 0, image: p2Yellow1, galleryImages: [p2Yellow1, p2Yellow2, p2Yellow3, p2Yellow4, p2Yellow5] }
    ],
    explodedComponents: [
      { id: 'c1', name: 'Ripple Outer Exoskeleton', description: 'Ergonomic wave profile designed for anti-slip grip and tactile handfeel.', material: 'Cobalt Blue Polymer', offsetY: -25 },
      { id: 'c2', name: 'Friction Retention Core', description: 'Engineered internal ribbing providing a snug friction-lock fit for lighters.', material: 'High-Toughness PETG', offsetY: 0 },
      { id: 'c3', name: 'Weighted Stand Base', description: 'Flat weighted bottom allowing upright placement on desks and trays.', material: 'Reinforced Polymer', offsetY: 25 }
    ],
    inStock: true,
    stockCount: 164
  },
  {
    id: 'prism-lighter-sleeve',
    slug: 'prism-lighter-sleeve',
    name: 'Prism',
    tagline: 'Faceted geometric armor sleeve with architectural low-poly ergonomics',
    category: 'lighter' as CategoryType,
    price: 279,
    rating: 5.0,
    reviewCount: 64,
    image: p3Black1,
    secondaryImage: p3Black2,
    galleryImages: [
      p3Black1,
      p3Black2,
      p3Black3,
      p3Black4,
      p3Black5
    ],
    description: 'A precision-faceted lighter sleeve shaped with low-poly architectural planes. The sharp geometric facets create an extraordinary ergonomic grip that naturally indexes your fingers, while the lightweight internal lattice protects against drops and impacts. (Note: Lighter is not included).',
    storyHeading: 'Architectural Faceted Form',
    storyBody: 'Modeled after faceted stealth geometry and architectural facades. Each angular plane is precision-calibrated to catch light dynamically across matte polymer surfaces.',
    isNew: true,
    isBestseller: false,
    specs: {
      layerHeight: '0.08 mm',
      infillType: 'High-Density Angular Ribs',
      printTime: '2.0 Hours',
      weight: '22g',
      nozzleSize: '0.4mm Diamond-Coated',
      durabilityRating: 'Reinforced Impact-Tolerant Polymer',
      hardwareIncluded: 'Dual-Ridge Snap Fit Retention'
    },
    colors: [
      {
        name: 'Onyx Black',
        stock: 20,
        hexColor: '#161616',
        images: [p3Black1, p3Black2, p3Black3, p3Black4, p3Black5]
      },
      {
        name: 'Cobalt Blue',
        stock: 16,
        hexColor: '#2563eb',
        images: [p3Blue1, p3Blue2, p3Blue3, p3Blue4, p3Blue5]
      },
      {
        name: 'Dark Blue',
        stock: 14,
        hexColor: '#0a2540',
        images: [p3Db1, p3Db2, p3Db3, p3Db4, p3Db5]
      },
      {
        name: 'Emerald Green',
        stock: 18,
        hexColor: '#10b981',
        images: [p3Green1, p3Green2, p3Green3, p3Green4, p3Green5]
      },
      {
        name: 'Neon Cyber Green',
        stock: 15,
        hexColor: '#30d158',
        images: [p3Neon1, p3Neon2, p3Neon3, p3Neon4, p3Neon5]
      },
      {
        name: 'Signal Orange',
        stock: 12,
        hexColor: '#ff6b00',
        images: [p3Orange1, p3Orange2, p3Orange3, p3Orange4, p3Orange5]
      },
      {
        name: 'Blush Pink',
        stock: 14,
        hexColor: '#ffb6c1',
        images: [p3Pink1, p3Pink2, p3Pink3, p3Pink4, p3Pink5]
      },
      {
        name: 'Signal Red',
        stock: 19,
        hexColor: '#e63946',
        images: [p3Red1, p3Red2, p3Red3, p3Red4, p3Red5]
      },
      {
        name: 'Frost White',
        stock: 22,
        hexColor: '#f2f2f7',
        images: [p3White1, p3White2, p3White3, p3White4, p3White5]
      },
      {
        name: 'Cyber Yellow',
        stock: 17,
        hexColor: '#f59e0b',
        images: [p3Yellow1, p3Yellow2, p3Yellow3, p3Yellow4, p3Yellow5]
      }
    ],
    availableMaterials: [
      { id: 'BLACK', name: 'Onyx Black', hexColor: '#161616', textureName: 'Faceted Matte Polymer', priceModifier: 0, image: p3Black1, galleryImages: [p3Black1, p3Black2, p3Black3, p3Black4, p3Black5] },
      { id: 'BLUE', name: 'Cobalt Blue', hexColor: '#2563eb', textureName: 'Faceted Matte Polymer', priceModifier: 0, image: p3Blue1, galleryImages: [p3Blue1, p3Blue2, p3Blue3, p3Blue4, p3Blue5] },
      { id: 'DARK BLUE', name: 'Dark Blue', hexColor: '#0a2540', textureName: 'Faceted Matte Polymer', priceModifier: 0, image: p3Db1, galleryImages: [p3Db1, p3Db2, p3Db3, p3Db4, p3Db5] },
      { id: 'GREEN', name: 'Emerald Green', hexColor: '#10b981', textureName: 'Faceted Matte Polymer', priceModifier: 0, image: p3Green1, galleryImages: [p3Green1, p3Green2, p3Green3, p3Green4, p3Green5] },
      { id: 'NEON GREEN', name: 'Neon Cyber Green', hexColor: '#30d158', textureName: 'Faceted Matte Polymer', priceModifier: 0, image: p3Neon1, galleryImages: [p3Neon1, p3Neon2, p3Neon3, p3Neon4, p3Neon5] },
      { id: 'ORANGE', name: 'Signal Orange', hexColor: '#ff6b00', textureName: 'Faceted Matte Polymer', priceModifier: 0, image: p3Orange1, galleryImages: [p3Orange1, p3Orange2, p3Orange3, p3Orange4, p3Orange5] },
      { id: 'PINK', name: 'Blush Pink', hexColor: '#ffb6c1', textureName: 'Faceted Matte Polymer', priceModifier: 0, image: p3Pink1, galleryImages: [p3Pink1, p3Pink2, p3Pink3, p3Pink4, p3Pink5] },
      { id: 'RED', name: 'Signal Red', hexColor: '#e63946', textureName: 'Faceted Matte Polymer', priceModifier: 0, image: p3Red1, galleryImages: [p3Red1, p3Red2, p3Red3, p3Red4, p3Red5] },
      { id: 'WHITE', name: 'Frost White', hexColor: '#f2f2f7', textureName: 'Faceted Matte Polymer', priceModifier: 0, image: p3White1, galleryImages: [p3White1, p3White2, p3White3, p3White4, p3White5] },
      { id: 'YELLOW', name: 'Cyber Yellow', hexColor: '#f59e0b', textureName: 'Faceted Matte Polymer', priceModifier: 0, image: p3Yellow1, galleryImages: [p3Yellow1, p3Yellow2, p3Yellow3, p3Yellow4, p3Yellow5] }
    ],
    explodedComponents: [
      { id: 'p1', name: 'Faceted Outer Monocoque', description: 'Angular geometric surface designed to dissipate drop forces and index tactile grip.', material: 'Engineering Matte Polymer', offsetY: -25 },
      { id: 'p2', name: 'Internal Rib Retention Matrix', description: 'Calibrated friction ridges securing standard lighters without scratching.', material: 'Impact Resistant Polymer', offsetY: 0 },
      { id: 'p3', name: 'Recessed Base Bevel', description: 'Chamfered bottom profile designed for seamless pocket draw and standing stability.', material: 'Reinforced Polymer', offsetY: 25 }
    ],
    inStock: true,
    stockCount: 167
  },
  {
    id: 'soap-bar-lighter-sleeve',
    slug: 'soap-bar-lighter-sleeve',
    name: 'Soap Bar',
    tagline: 'Iconic embossed soap-bar silhouette lighter case with water-resistant grip',
    category: 'lighter' as CategoryType,
    price: 299,
    rating: 5.0,
    reviewCount: 42,
    image: p4Pink1,
    secondaryImage: p4Pink2,
    galleryImages: [
      p4Pink1,
      p4Pink2,
      p4Pink3,
      p4Pink4,
      p4Pink5
    ],
    description: 'An iconic lighter armor sleeve sculpted in the form of the cult classic pink soap bar. Features bold embossed typography, smooth rounded bar-of-soap contours, and an engineered friction-fit inner cavity that secures standard lighters. (Note: Lighter is not included).',
    storyHeading: 'Cult Classic Soap Bar Silhouette',
    storyBody: 'Inspired by the minimalist, irreverent aesthetic of cult cinema. Precision-molded with high-tactile matte pink polymer, offering an instantly recognizable silhouette that sits flush on countertops and vanity trays while slipping comfortably into pockets.',
    isNew: true,
    isBestseller: true,
    specs: {
      layerHeight: '0.08 mm',
      infillType: 'High-Density Structural Matrix',
      printTime: '2.4 Hours',
      weight: '24g',
      nozzleSize: '0.4mm Diamond-Coated',
      durabilityRating: 'Impact Resistant Tactile Polymer',
      hardwareIncluded: 'Precision Friction Fit Retention'
    },
    colors: [
      {
        name: 'Blush Pink',
        stock: 30,
        hexColor: '#ff8fb1',
        images: [p4Pink1, p4Pink2, p4Pink3, p4Pink4, p4Pink5]
      }
    ],
    availableMaterials: [
      { id: 'PINK', name: 'Bar Soap Pink', hexColor: '#ff8fb1', textureName: 'Silky Matte Finish', priceModifier: 0, image: p4Pink1, galleryImages: [p4Pink1, p4Pink2, p4Pink3, p4Pink4, p4Pink5] }
    ],
    explodedComponents: [
      { id: 's1', name: 'Embossed Outer Shell', description: 'Sculpted soap bar exterior featuring high-relief debossed lettering and chamfered edges.', material: 'Silky Touch Polymer', offsetY: -25 },
      { id: 's2', name: 'Internal Retention Chamber', description: 'Precision-toleranced cavity engineered to hold standard BIC lighters securely.', material: 'High-Toughness PETG', offsetY: 0 },
      { id: 's3', name: 'Weighted Flat Base', description: 'Sturdy flat base allowing the sleeve to stand upright on bathroom sinks, desks, and vanity trays.', material: 'Reinforced Polymer', offsetY: 25 }
    ],
    inStock: true,
    stockCount: 30
  }
];
