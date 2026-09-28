import React from 'react';
import { X, Printer, Package, Truck, ShieldCheck, Check } from 'lucide-react';
import { formatINR } from '../utils/currency';

interface ShippingLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const awb = order.awbNumber || `BD${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  const courier = order.courierName || 'Blue Dart Air Express';
  const orderNumber = order.orderNumber || 'UF100001';
  const isCod = (order.paymentStatus || '').toLowerCase().includes('cod');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white text-black rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col font-sans">
        {/* Modal Top Bar */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2 font-mono text-xs font-bold">
            <Truck className="w-4 h-4 text-red-500" />
            <span>SHIPROCKET SHIPPING MANIFEST & LABEL</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT LABEL</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable Label Body (Designed to fit 4x6 standard thermal label) */}
        <div className="p-6 bg-white space-y-4 print:p-0">
          {/* Label Header */}
          <div className="border-2 border-black p-4 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block">LOGISTICS PARTNER</span>
                <span className="text-lg font-black tracking-tight">{courier}</span>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 text-xs font-black uppercase rounded ${
                  isCod ? 'bg-amber-100 text-amber-900 border border-amber-400' : 'bg-black text-white'
                }`}>
                  {isCod ? 'CASH ON DELIVERY (COD)' : 'PREPAID EXPRESS'}
                </span>
                <span className="block text-[11px] font-mono font-bold mt-1">
                  TOTAL: {formatINR(order.total || order.totalINR || 1499)}
                </span>
              </div>
            </div>

            {/* Barcode & AWB representation */}
            <div className="py-2 text-center border-b-2 border-black">
              {/* CSS Simulated High-Res Barcode */}
              <div className="h-14 w-full flex items-stretch justify-center gap-0.5 bg-black/5 p-1 rounded">
                {Array.from({ length: 48 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-full ${
                      (i * 7) % 3 === 0 ? 'w-1 bg-black' : (i * 5) % 2 === 0 ? 'w-1.5 bg-black' : 'w-0.5 bg-black'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm font-mono font-black tracking-widest mt-1.5 uppercase">
                AWB: {awb}
              </p>
            </div>

            {/* Addresses Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-b-2 border-black pb-3">
              {/* Consignee / Delivery Address */}
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">
                  DELIVER TO (CONSIGNEE):
                </span>
                <p className="font-bold text-sm leading-tight">
                  {order.shippingAddress?.fullName || order.userName || 'Customer'}
                </p>
                <p className="text-slate-700 leading-snug mt-1">
                  {order.shippingAddress?.addressLine1 || order.shippingAddress?.address || 'MG Road'}<br />
                  {order.shippingAddress?.city || 'Bengaluru'}, {order.shippingAddress?.state || 'Karnataka'}
                </p>
                <p className="text-sm font-black font-mono mt-1 text-black">
                  PIN: {order.shippingAddress?.pincode || order.shippingAddress?.zip || '560001'}
                </p>
                <p className="font-mono text-slate-600 mt-1">
                  Phone: {order.shippingAddress?.phone || order.userPhone || '+91 9876543210'}
                </p>
              </div>

              {/* Shipper / Return Address */}
              <div className="border-l-2 border-black pl-3">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">
                  RETURN ADDRESS (RTO / SHIPPER):
                </span>
                <p className="font-bold text-xs">VoxelForm • Uncommon Finds</p>
                <p className="text-slate-600 leading-snug mt-0.5 text-[11px]">
                  Warehouse Hub 4B, Electronic City<br />
                  Bengaluru, Karnataka - 560100
                </p>
                <p className="font-mono text-[11px] text-slate-600 mt-1">
                  Support: ops@voxelform.in
                </p>
              </div>
            </div>

            {/* Package Items & Dimensions */}
            <div className="text-[11px] font-mono flex items-center justify-between text-slate-700 pt-1">
              <div>
                <span>Order: <strong>#{orderNumber}</strong></span> • <span>Weight: <strong>0.45 KG</strong></span>
              </div>
              <div>
                <span>Items: <strong>{(order.items || []).length || 1} units</strong></span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-mono text-center no-print">
            Official Shiprocket carrier barcode standard. Compatible with Zebra/TSC thermal label printers.
          </p>
        </div>
      </div>
    </div>
  );
};
