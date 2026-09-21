import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Box, 
  Truck, 
  Check, 
  Clock, 
  MapPin, 
  Hash, 
  CreditCard,
  Calendar,
  Zap
} from 'lucide-react';
import { PriceDisplay } from './PriceDisplay';

export interface ProductionStageInfo {
  id: number;
  title: string;
  code: string;
  description: string;
}

export const PRODUCTION_STAGES: ProductionStageInfo[] = [
  {
    id: 1,
    title: 'Order Confirmed',
    code: 'CONFIRMED',
    description: "Your order has been successfully placed and added to today's production queue.",
  },
  {
    id: 2,
    title: 'Preparing Production',
    code: 'PREPARING',
    description: 'Our team is preparing your product for manufacturing.',
  },
  {
    id: 3,
    title: 'Crafting Your Product',
    code: 'CRAFTING',
    description: 'Your product is currently being precision manufactured.',
  },
  {
    id: 4,
    title: 'Quality Inspection',
    code: 'INSPECTION',
    description: 'Every product is carefully inspected before shipping.',
  },
  {
    id: 5,
    title: 'Packed',
    code: 'PACKED',
    description: 'Your order has been securely packed and is ready for dispatch.',
  },
  {
    id: 6,
    title: 'Shipped',
    code: 'SHIPPED',
    description: 'Your order is on its way.',
  },
  {
    id: 7,
    title: 'Delivered',
    code: 'DELIVERED',
    description: 'Your Uncommon Find has arrived.',
  },
];

export function getStageIndex(statusStr: string): number {
  if (!statusStr) return 1;
  const s = statusStr.trim().toLowerCase();

  if (s.includes('delivered')) return 7;
  if (s.includes('shipped') || s.includes('out for delivery')) return 6;
  if (s.includes('packed')) return 5;
  if (s.includes('inspection') || s.includes('quality')) return 4;
  if (s.includes('crafting') || s.includes('printing') || s.includes('manufacturing')) return 3;
  if (s.includes('preparing') || s.includes('processing')) return 2;
  if (s.includes('confirmed') || s.includes('pending') || s.includes('paid')) return 1;

  return 1;
}

interface ProductionTrackerProps {
  currentStatus: string;
  orderNumber: string;
  estimatedDispatch?: string;
  deliveryAddress?: string;
  totalPaid?: number;
  isDarkMode?: boolean;
  showCardDetails?: boolean;
}

export const ProductionTracker: React.FC<ProductionTrackerProps> = ({
  currentStatus,
  orderNumber,
  estimatedDispatch = '1-2 Business Days',
  deliveryAddress = 'Specified at checkout',
  totalPaid = 0,
  isDarkMode = true,
  showCardDetails = true,
}) => {
  const currentStageIdx = getStageIndex(currentStatus);
  const currentStageObj = PRODUCTION_STAGES[currentStageIdx - 1] || PRODUCTION_STAGES[0];

  const getStageIcon = (id: number) => {
    switch (id) {
      case 1: return <CheckCircle2 className="w-4 h-4" />;
      case 2: return <Sparkles className="w-4 h-4" />;
      case 3: return <Cpu className="w-4 h-4" />;
      case 4: return <ShieldCheck className="w-4 h-4" />;
      case 5: return <Box className="w-4 h-4" />;
      case 6: return <Truck className="w-4 h-4" />;
      case 7: return <Check className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HORIZONTAL PRECISION MANUFACTURING PROGRESS TRACKER */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden font-mono-tech ${
        isDarkMode ? 'bg-[#0a0c10] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Subtle Ambient Studio Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                UNCOMMON FINDS • PRECISION MANUFACTURING JOURNEY
              </span>
            </div>
            <h3 className="font-display font-bold text-lg sm:text-xl tracking-tight text-white mt-1">
              PRODUCTION PROGRESS
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs uppercase font-mono">
              STAGE {currentStageIdx} OF 7: {currentStageObj.title.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Desktop / Mobile Horizontal Flow */}
        <div className="pt-8 pb-4 relative">
          
          {/* Progress Line Container */}
          <div className="hidden lg:block absolute top-[44px] left-8 right-8 h-1 bg-slate-800/80 rounded-full z-0">
            <motion.div 
              className="h-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.6)]"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStageIdx - 1) / (PRODUCTION_STAGES.length - 1)) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {/* Stepper Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 relative z-10">
            {PRODUCTION_STAGES.map((stage) => {
              const isCompleted = stage.id < currentStageIdx;
              const isCurrent = stage.id === currentStageIdx;
              const isUpcoming = stage.id > currentStageIdx;

              return (
                <div 
                  key={stage.id}
                  className={`flex lg:flex-col items-center lg:items-center text-left lg:text-center gap-3 lg:gap-2.5 p-3 lg:p-0 rounded-2xl transition-all ${
                    isCurrent 
                      ? 'bg-red-500/10 border border-red-500/30 lg:bg-transparent lg:border-none' 
                      : 'bg-white/5 border border-white/5 lg:bg-transparent lg:border-none'
                  }`}
                >
                  {/* Circle Node with Icon */}
                  <div className="relative shrink-0">
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: isCurrent ? 1.1 : 1 }}
                      transition={{ duration: 0.3 }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold transition-all ${
                        isCompleted
                          ? 'bg-red-500 text-white shadow-md shadow-red-500/30 border border-red-400'
                          : isCurrent
                          ? 'bg-red-500 text-white ring-4 ring-red-500/20 shadow-lg shadow-red-500/50 border border-white'
                          : 'bg-slate-800/90 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5 text-white" /> : getStageIcon(stage.id)}
                    </motion.div>

                    {/* Active pulse ring for current stage */}
                    {isCurrent && (
                      <span className="absolute -inset-1 rounded-2xl border-2 border-red-500 animate-pulse pointer-events-none" />
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="space-y-0.5 min-w-0">
                    <span className={`text-[10px] font-mono uppercase block font-bold tracking-wider ${
                      isCompleted ? 'text-red-400' : isCurrent ? 'text-red-400' : 'text-slate-500'
                    }`}>
                      STAGE 0{stage.id}
                    </span>
                    <h4 className={`text-xs font-bold font-sans tracking-tight leading-tight ${
                      isCurrent 
                        ? 'text-white' 
                        : isCompleted 
                        ? 'text-slate-200' 
                        : 'text-slate-500'
                    }`}>
                      {stage.title}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Active Stage Description Callout */}
        <motion.div 
          key={currentStageObj.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6 p-4 rounded-2xl bg-[#141822] border border-red-500/30 flex items-start gap-3 text-xs"
        >
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase font-mono tracking-wider">
                CURRENT STAGE STATUS:
              </span>
              <span className="text-red-400 font-bold uppercase">{currentStageObj.title}</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">
              {currentStageObj.description}
            </p>
          </div>
        </motion.div>

      </div>

      {/* 2. PRODUCTION STATUS CARD */}
      {showCardDetails && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 font-mono-tech ${
          isDarkMode ? 'bg-[#0f1117] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          {/* Card Title */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base sm:text-lg tracking-wide uppercase text-white">
                PRODUCTION STATUS
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] uppercase">
              ACTIVE
            </span>
          </div>

          {/* Grid of 5 Key Card Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            {/* Field 1: Current Stage */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                CURRENT STAGE
              </span>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                <span>{currentStageObj.title}</span>
              </div>
            </div>

            {/* Field 2: Estimated Dispatch */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                ESTIMATED DISPATCH
              </span>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>{estimatedDispatch}</span>
              </div>
            </div>

            {/* Field 3: Order Number */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                ORDER NUMBER
              </span>
              <div className="font-bold text-red-400 text-sm font-mono flex items-center gap-2">
                <Hash className="w-4 h-4 text-red-500" />
                <span>{orderNumber}</span>
              </div>
            </div>

            {/* Field 4: Delivery Address */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1 md:col-span-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                DELIVERY ADDRESS
              </span>
              <div className="font-bold text-slate-200 text-sm flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{deliveryAddress}</span>
              </div>
            </div>

            {/* Field 5: Total Paid */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                TOTAL PAID
              </span>
              <div className="font-bold text-white text-sm font-mono flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <PriceDisplay amount={totalPaid} currencySymbol="₹" />
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
