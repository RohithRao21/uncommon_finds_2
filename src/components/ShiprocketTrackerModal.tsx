import React, { useState } from 'react';
import { 
  X, Truck, MapPin, Calendar, Clock, CheckCircle2, 
  ExternalLink, Copy, Check, ShieldCheck, Box, RefreshCw 
} from 'lucide-react';
import { trackShiprocketShipment, ShiprocketTrackingResult } from '../lib/shiprocket';

interface ShiprocketTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  awbNumber: string;
  orderNumber?: string;
  orderDate?: string;
  isDarkMode?: boolean;
}

export const ShiprocketTrackerModal: React.FC<ShiprocketTrackerModalProps> = ({
  isOpen,
  onClose,
  awbNumber,
  orderNumber,
  orderDate,
  isDarkMode = true,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !awbNumber) return null;

  const tracking: ShiprocketTrackingResult = trackShiprocketShipment(awbNumber, orderDate);

  const handleCopy = () => {
    navigator.clipboard.writeText(awbNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className={`relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden my-auto flex flex-col ${
        isDarkMode ? 'bg-[#0f1115] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDarkMode ? 'border-white/10 bg-black/40' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">SHIPROCKET EXPRESS</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold">LIVE TELEMETRY</span>
              </div>
              <h2 className="text-base font-display font-bold">
                {tracking.courierName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDarkMode ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:text-black hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* AWB Card */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">AIRWAY BILL (AWB) NUMBER</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-base font-bold text-white tracking-wider">{awbNumber}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy AWB Number"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs">
              <span className="text-[10px] uppercase text-slate-400 block">ESTIMATED DELIVERY</span>
              <span className="text-emerald-400 font-bold">{tracking.estimatedDelivery}</span>
            </div>
          </div>

          {/* Current Status Highlight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping mt-1 shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 block uppercase">Current Package Status</span>
              <p className="text-sm font-semibold text-white mt-0.5">{tracking.currentStatus}</p>
              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 mt-2">
                <span>Origin: <strong className="text-slate-200">{tracking.origin}</strong></span>
                <span>•</span>
                <span>Destination: <strong className="text-slate-200">{tracking.destination}</strong></span>
              </div>
            </div>
          </div>

          {/* Checkpoints Timeline */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-400">
              Shipment Activity Log
            </h4>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {tracking.activities.map((act, index) => (
                <div key={index} className="relative group">
                  {/* Dot */}
                  <span className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                    index === 0
                      ? 'bg-red-500 border-red-400 shadow-md shadow-red-500/50'
                      : 'bg-[#181820] border-slate-600'
                  }`}>
                    {index === 0 && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold font-mono uppercase ${index === 0 ? 'text-white' : 'text-slate-300'}`}>
                        {act.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{act.date}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{act.activity}</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">{act.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* External Track Link */}
          <div className="pt-2 flex justify-end">
            <a
              href={`https://shiprocket.co/tracking/${awbNumber}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <span>View On Shiprocket.co</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
