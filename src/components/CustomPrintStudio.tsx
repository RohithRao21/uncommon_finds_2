import React, { useState } from 'react';
import { X, Cpu, Sparkles, Upload, Sliders, Check, ShieldCheck, ArrowRight, Layers, Box, Info } from 'lucide-react';
import { MaterialType, CartItem, Product } from '../types';
import { PriceDisplay } from './PriceDisplay';
import { formatINR, formatUSD } from '../utils/currency';
import { useCart } from '../context/CartContext';
import defaultCustomImage from '../assets/images/P1/BLACK/p1-black-1.png';

interface CustomPrintStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomToCart?: (customItem: CartItem) => void;
  currencySymbol: string;
  isDarkMode: boolean;
}

export const CustomPrintStudio: React.FC<CustomPrintStudioProps> = ({
  isOpen,
  onClose,
  onAddCustomToCart,
  currencySymbol,
  isDarkMode,
}) => {
  const { addToCart } = useCart();
  const [modelName, setModelName] = useState('Custom Parametric Enclosure');
  const [material, setMaterial] = useState<MaterialType>('PETG-CF');
  const [infill, setInfill] = useState<number>(30);
  const [layerHeight, setLayerHeight] = useState<string>('0.08 mm');
  const [dimX, setDimX] = useState<number>(120);
  const [dimY, setDimY] = useState<number>(80);
  const [dimZ, setDimZ] = useState<number>(45);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [added, setAdded] = useState(false);

  if (!isOpen) return null;

  // Real-time mass, print time, and price calculator algorithm
  const volumeCm3 = (dimX * dimY * dimZ * (infill / 100 + 0.15)) / 1000;
  const estimatedWeightGrams = Math.round(volumeCm3 * 1.25);
  const estimatedHours = (volumeCm3 * 0.18 * (layerHeight === '0.08 mm' ? 1.8 : 1.1)).toFixed(1);
  const calculatedPrice = Math.max(25, Math.round(estimatedWeightGrams * 0.45 + parseFloat(estimatedHours) * 4.5));

  const handleAddCustom = () => {
    const customProduct: Product = {
      id: `custom-job-${Date.now().toString().slice(-4)}`,
      slug: `custom-job-${Date.now().toString().slice(-4)}`,
      name: `Custom Print: ${modelName}`,
      tagline: `Parametric Custom Job (${dimX}x${dimY}x${dimZ}mm, ${infill}% Infill)`,
      category: 'parametric',
      price: calculatedPrice,
      rating: 5.0,
      reviewCount: 1,
      image: defaultCustomImage,
      description: `Custom 3D print request in ${material} with ${infill}% gyroid infill at ${layerHeight} layer height. Dimensions: ${dimX}x${dimY}x${dimZ}mm.`,
      storyHeading: 'Custom Parametric Print Job',
      storyBody: specialInstructions || 'Printed according to user CAD specifications with precision post-processing.',
      specs: {
        layerHeight,
        infillType: `${infill}% Gyroid Infill`,
        printTime: `${estimatedHours} Hours`,
        weight: `${estimatedWeightGrams}g`,
        nozzleSize: '0.4mm Hardened Steel',
        durabilityRating: 'Tuned for Custom CAD',
      },
      colors: [
        {
          name: material,
          stock: 99,
          hexColor: '#1c1e22',
          images: [defaultCustomImage]
        }
      ],
      availableMaterials: [
        { id: material, name: material, hexColor: '#1c1e22', textureName: 'Custom Choice', priceModifier: 0 },
      ],
      explodedComponents: [],
      inStock: true,
      stockCount: 1,
    };

    addToCart({
      productId: customProduct.id,
      productName: customProduct.name,
      selectedColor: material,
      price: calculatedPrice,
      image: customProduct.image || '',
      quantity: 1,
      maxStock: 99,
      selectedLayerHeight: layerHeight,
      customEngraving: specialInstructions.slice(0, 12),
      product: customProduct,
    });

    if (onAddCustomToCart) {
      const cartItem: CartItem = {
        id: `custom-${Date.now()}`,
        productId: customProduct.id,
        productName: customProduct.name,
        selectedColor: material,
        quantity: 1,
        price: calculatedPrice,
        image: customProduct.image || '',
        product: customProduct,
        selectedMaterial: material,
        selectedLayerHeight: layerHeight,
        customEngraving: specialInstructions.slice(0, 12),
        unitPrice: calculatedPrice,
      };
      onAddCustomToCart(cartItem);
    }

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg overflow-y-auto">
      <div className={`relative w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden my-auto flex flex-col ${
        isDarkMode ? 'bg-[#0f1115] border-white/15 text-white' : 'bg-white border-black/15 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-white" />
            <h2 className="font-display font-bold text-lg">CUSTOM PRINT LAB // CAD STUDIO</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Form Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* File Upload Zone */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-white/20 bg-black/40 text-center space-y-3 hover:border-white/50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-white mx-auto" />
            <div>
              <h3 className="font-mono-tech text-xs font-bold text-white uppercase">
                {fileUploaded ? '✓ CAD STL / STEP FILE LOADED' : 'DROP STL, STEP, OR OBJ FILE HERE'}
              </h3>
              <p className="text-[11px] text-slate-400 font-sans-clean mt-1">
                Supports up to 250MB. Auto slicer calculates volume, mass & print parameters instantly.
              </p>
            </div>
            <button
              onClick={() => setFileUploaded(!fileUploaded)}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono-tech text-xs cursor-pointer"
            >
              {fileUploaded ? 'CHANGE CAD FILE' : 'SELECT FILE FROM DEVICE'}
            </button>
          </div>

          {/* Model Name & Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono-tech font-bold text-slate-300 block mb-1">
                PROJECT / MODEL NAME
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs font-mono-tech text-white outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="text-xs font-mono-tech font-bold text-slate-300 block mb-1">
                BOUNDING DIMENSIONS (X × Y × Z mm)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={dimX}
                  onChange={(e) => setDimX(Number(e.target.value))}
                  className="px-2 py-2 rounded-xl bg-black/60 border border-white/15 text-xs font-mono-tech text-white text-center"
                  placeholder="X"
                />
                <input
                  type="number"
                  value={dimY}
                  onChange={(e) => setDimY(Number(e.target.value))}
                  className="px-2 py-2 rounded-xl bg-black/60 border border-white/15 text-xs font-mono-tech text-white text-center"
                  placeholder="Y"
                />
                <input
                  type="number"
                  value={dimZ}
                  onChange={(e) => setDimZ(Number(e.target.value))}
                  className="px-2 py-2 rounded-xl bg-black/60 border border-white/15 text-xs font-mono-tech text-white text-center"
                  placeholder="Z"
                />
              </div>
            </div>
          </div>

          {/* Material & Infill Config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Filament Selection */}
            <div>
              <label className="text-xs font-mono-tech font-bold text-slate-300 block mb-1.5">
                FILAMENT MATERIAL
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value as MaterialType)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs font-mono-tech text-white outline-none focus:border-slate-400"
              >
                <option value="PETG-CF">Onyx PETG Carbon Fiber (High Temp & Rigidity)</option>
                <option value="PLA-CARBON">Carbon Fiber PLA (Crisp Precision)</option>
                <option value="TITANIUM-GREY">Anodized Titanium Matte (Satin Metallic)</option>
                <option value="TRANSLUCENT-FROST">Polycarbonate Frost (Cyberpunk Diffuse)</option>
                <option value="BRASS-PLA">Brass-Infused Heavy PLA (Polished Metal Weight)</option>
                <option value="MATTE-ONYX">Stealth Black PLA+ (Ultra Matte)</option>
              </select>
            </div>

            {/* Layer Height */}
            <div>
              <label className="text-xs font-mono-tech font-bold text-slate-300 block mb-1.5">
                PRECISION LAYER RESOLUTION
              </label>
              <select
                value={layerHeight}
                onChange={(e) => setLayerHeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs font-mono-tech text-white outline-none focus:border-slate-400"
              >
                <option value="0.08 mm">0.08 mm Ultra-Fine (Smooth Glass Finish)</option>
                <option value="0.12 mm">0.12 mm Precision (Balanced High Detail)</option>
                <option value="0.20 mm">0.20 mm Standard (Fast Turnaround)</option>
              </select>
            </div>

          </div>

          {/* Infill Density Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono-tech">
              <span className="text-slate-300 font-bold">GYROID INFILL DENSITY</span>
              <span className="text-white font-bold">{infill}% GYROID</span>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              step="5"
              value={infill}
              onChange={(e) => setInfill(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Live Calculated Quote Box */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/15 space-y-3 font-mono-tech text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-bold">REAL-TIME SLICER ESTIMATE</span>
              <span className="text-white font-bold text-lg">
                <PriceDisplay amount={calculatedPrice} usdClassName="text-slate-300 font-normal" />
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300">
              <div>
                <span className="text-slate-400 block">EST. WEIGHT</span>
                <span className="font-bold text-white">{estimatedWeightGrams} grams</span>
              </div>
              <div>
                <span className="text-slate-400 block">EST. PRINT TIME</span>
                <span className="font-bold text-white">{estimatedHours} hours</span>
              </div>
              <div>
                <span className="text-slate-400 block">PRINTER ALLOCATION</span>
                <span className="font-bold text-emerald-400">Bambu X1-Carbon #04</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-black/40 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/20 text-xs font-mono-tech text-slate-300 hover:text-white cursor-pointer"
          >
            CANCEL
          </button>
          <button
            onClick={handleAddCustom}
            className={`px-6 py-3 rounded-xl font-mono-tech text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xl ${
              added ? 'bg-emerald-500 text-black' : 'bg-white text-black hover:bg-slate-200'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>ADDED TO QUEUE!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>ADD CUSTOM PRINT TO QUEUE ({formatINR(calculatedPrice)} / ~{formatUSD(calculatedPrice)})</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
