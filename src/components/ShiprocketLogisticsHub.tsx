import React, { useState, useEffect } from 'react';
import { 
  Truck, ShieldCheck, MapPin, Calculator, RefreshCw, Key, 
  ExternalLink, Printer, CheckCircle2, AlertCircle, Search, 
  Package, ArrowRight, Clock, Copy, Check, Eye, EyeOff 
} from 'lucide-react';
import { 
  getShiprocketCredentials, saveShiprocketCredentials, 
  isShiprocketConfigured, checkPincodeServiceability, 
  pushOrderToShiprocket, PincodeServiceabilityResult, CourierOption 
} from '../lib/shiprocket';
import { formatINR } from '../utils/currency';
import { db, doc, updateDoc, collection, getDocs, setDoc } from '../lib/firebase';
import { ShiprocketTrackerModal } from './ShiprocketTrackerModal';
import { ShippingLabelModal } from './ShippingLabelModal';

interface ShiprocketLogisticsHubProps {
  orders: any[];
  onOrderUpdated?: () => void;
  isDarkMode?: boolean;
}

export const ShiprocketLogisticsHub: React.FC<ShiprocketLogisticsHubProps> = ({
  orders,
  onOrderUpdated,
  isDarkMode = true,
}) => {
  // Credentials State
  const [credentials, setCredentials] = useState(getShiprocketCredentials());
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Rate & Pincode Tool State
  const [testPincode, setTestPincode] = useState('560001');
  const [testWeight, setTestWeight] = useState(0.5);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [serviceabilityResult, setServiceabilityResult] = useState<PincodeServiceabilityResult | null>(null);

  // Shipment Action State
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [selectedCourierId, setSelectedCourierId] = useState<Record<string, number>>({});
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string>('');

  // Modals
  const [activeTrackingAwb, setActiveTrackingAwb] = useState<string | null>(null);
  const [labelModalOrder, setLabelModalOrder] = useState<any | null>(null);

  useEffect(() => {
    // Initial pincode test
    handleCheckPincode();
  }, []);

  const handleSaveCredentials = async () => {
    saveShiprocketCredentials(credentials);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    try {
      await setDoc(doc(db, 'settings', 'shiprocket'), {
        email: credentials.email,
        pickupLocation: credentials.pickupLocation,
        pickupPincode: credentials.pickupPincode,
        isSandbox: credentials.isSandbox,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      // Ignored if rules don't permit
    }
  };

  const handleCheckPincode = async () => {
    if (testPincode.length !== 6) return;
    setIsCheckingPincode(true);
    const res = await checkPincodeServiceability(testPincode, testWeight);
    setServiceabilityResult(res);
    setIsCheckingPincode(false);
  };

  const handleCreateShipment = async (order: any) => {
    setProcessingOrderId(order.id);
    setActionSuccessMessage('');

    try {
      const courierId = selectedCourierId[order.id] || 1;
      const res = await pushOrderToShiprocket(order, courierId);

      if (res.success) {
        // Update Firestore order
        const orderRef = doc(db, 'orders', order.id);
        await updateDoc(orderRef, {
          orderStatus: 'Shipped',
          status: 'SHIPPED',
          shiprocketOrderId: res.shiprocketOrderId,
          shiprocketShipmentId: res.shiprocketShipmentId,
          awbNumber: res.awbNumber,
          courierName: res.courierName,
          courierTrackingUrl: res.courierTrackingUrl,
          pickupScheduledDate: res.pickupScheduledDate,
          shippingLabelUrl: res.shippingLabelUrl,
          manifestUrl: res.manifestUrl,
          updatedAt: new Date().toISOString(),
        });

        setActionSuccessMessage(`Order #${order.orderNumber} successfully manifested on Shiprocket! AWB: ${res.awbNumber}`);
        if (onOrderUpdated) {
          onOrderUpdated();
        }
      }
    } catch (err: any) {
      console.error('Shiprocket shipment error:', err);
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Orders that haven't been shipped yet vs shipped
  const pendingOrders = orders.filter((o) => !o.awbNumber && o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled');
  const activeShipments = orders.filter((o) => !!o.awbNumber);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner: Shiprocket Configuration */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isDarkMode ? 'bg-[#111116] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold uppercase tracking-tight font-display text-white">
                  Shiprocket Logistics Hub
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                  MULTI-COURIER SYNC
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono-tech mt-0.5">
                Automated Blue Dart, Delhivery, DTDC, XpressBees dispatch & AWB label generation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Environment:</span>
            <button
              type="button"
              onClick={() => setCredentials({ ...credentials, isSandbox: !credentials.isSandbox })}
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors cursor-pointer ${
                credentials.isSandbox
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {credentials.isSandbox ? 'SANDBOX SIMULATOR' : 'LIVE PRODUCTION'}
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-slate-400 mb-1.5">
              Shiprocket Email ID
            </label>
            <input
              type="email"
              placeholder="admin@voxelform.in"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                isDarkMode ? 'bg-black/50 border-slate-700 text-white focus:border-red-500' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-slate-400 mb-1.5">
              API Password / Token
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className={`w-full px-3 py-2 pr-9 rounded-xl border text-xs font-mono outline-none ${
                  isDarkMode ? 'bg-black/50 border-slate-700 text-white focus:border-red-500' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-slate-400 mb-1.5">
              Primary Pickup Location
            </label>
            <input
              type="text"
              placeholder="Warehouse Hub Bangalore"
              value={credentials.pickupLocation}
              onChange={(e) => setCredentials({ ...credentials, pickupLocation: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                isDarkMode ? 'bg-black/50 border-slate-700 text-white focus:border-red-500' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase font-bold text-slate-400 mb-1.5">
              Hub Pincode
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="560001"
                value={credentials.pickupPincode}
                onChange={(e) => setCredentials({ ...credentials, pickupPincode: e.target.value.replace(/\D/g, '') })}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                  isDarkMode ? 'bg-black/50 border-slate-700 text-white focus:border-red-500' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={handleSaveCredentials}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-3 text-xs text-emerald-400 font-mono flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Shiprocket configuration updated successfully!</span>
          </div>
        )}
      </div>

      {actionSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Two Column Grid: Pincode Rate Calculator & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pincode & Rate Calculator */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${
          isDarkMode ? 'bg-[#111116] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-white">
                Live Courier Rate & Pincode Serviceability Engine
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Origin: {credentials.pickupPincode}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative w-48">
              <input
                type="text"
                maxLength={6}
                placeholder="Indian Pincode (e.g. 560001)"
                value={testPincode}
                onChange={(e) => setTestPincode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 bg-black/50 border border-slate-700 rounded-xl text-xs font-mono text-white outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <span>Weight:</span>
              <select
                value={testWeight}
                onChange={(e) => setTestWeight(parseFloat(e.target.value))}
                className="px-2 py-2 bg-black/50 border border-slate-700 rounded-xl text-xs font-mono text-white outline-none"
              >
                <option value={0.25}>0.25 KG (Small Artifact)</option>
                <option value={0.5}>0.5 KG (Standard Box)</option>
                <option value={1.0}>1.0 KG (Multi-Item)</option>
                <option value={2.0}>2.0 KG (Heavy Object)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleCheckPincode}
              disabled={isCheckingPincode}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isCheckingPincode ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>CALCULATE RATES</span>
            </button>
          </div>

          {/* Results Table */}
          {serviceabilityResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 pb-2 border-b border-white/5">
                <span>Destination: <strong className="text-white">{serviceabilityResult.city}, {serviceabilityResult.state} ({serviceabilityResult.pincode})</strong></span>
                <span className="text-emerald-400">Serviceable across all major air couriers</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {serviceabilityResult.availableCouriers.slice(0, 4).map((c) => (
                  <div
                    key={c.courierId}
                    className="p-3 rounded-xl bg-black/40 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{c.courierName}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                          {c.mode}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                        Est. Transit: {c.estimatedDeliveryDays}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-emerald-400">
                        {formatINR(c.rate)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Rating: ★ {c.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Logistics Stats */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-[#111116] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-red-500" />
            <span>Shipment Pipeline</span>
          </h3>

          <div className="space-y-3 font-mono">
            <div className="p-3 rounded-xl bg-black/40 border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">Pending Manifestation</span>
              <span className="text-base font-bold text-amber-400">{pendingOrders.length}</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">Active In Transit</span>
              <span className="text-base font-bold text-emerald-400">{activeShipments.length}</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">Pickup Location</span>
              <span className="text-xs font-bold text-white truncate max-w-[140px]">{credentials.pickupLocation}</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 font-mono leading-relaxed">
            All orders manifested on Shiprocket automatically synchronize AWB tracking to the customer's "My Orders" account.
          </div>
        </div>
      </div>

      {/* SECTION 1: Orders Ready for Shiprocket Dispatch */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        isDarkMode ? 'bg-[#111116] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold uppercase font-mono tracking-wider text-white">
              Orders Ready for Dispatch ({pendingOrders.length})
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Click "Ship via Shiprocket" to assign courier, generate AWB & schedule warehouse pickup
            </p>
          </div>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-60" />
            <span>All confirmed orders have been manifested and assigned AWBs!</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3">Order</th>
                  <th className="py-3 px-3">Customer & Destination</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Select Courier</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pendingOrders.map((ord) => {
                  const isProcessing = processingOrderId === ord.id;
                  const currentCourier = selectedCourierId[ord.id] || 1;

                  return (
                    <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-white block">#{ord.orderNumber}</span>
                        <span className="text-[10px] text-slate-500">{(ord.items || []).length} items</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-white block font-medium">
                          {ord.shippingAddress?.fullName || ord.userName || 'Customer'}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {ord.shippingAddress?.city || 'Bengaluru'} - {ord.shippingAddress?.pincode || ord.shippingAddress?.zip || '560001'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-white font-bold block">
                          {formatINR(ord.total || ord.totalINR || 0)}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">
                          {ord.paymentStatus || 'Paid'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          value={currentCourier}
                          onChange={(e) => setSelectedCourierId({ ...selectedCourierId, [ord.id]: parseInt(e.target.value) })}
                          className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-xs font-mono text-white outline-none"
                        >
                          <option value={1}>Blue Dart Air Express (~₹99)</option>
                          <option value={2}>Delhivery Prime (~₹79)</option>
                          <option value={3}>DTDC Priority (~₹69)</option>
                          <option value={4}>XpressBees Surface (~₹59)</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleCreateShipment(ord)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white rounded-xl font-mono text-xs font-bold transition-all shadow-md shadow-red-600/20 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>MANIFESTING...</span>
                            </>
                          ) : (
                            <>
                              <Truck className="w-3.5 h-3.5" />
                              <span>SHIP VIA SHIPROCKET</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: Active Shipments & AWB Registry */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        isDarkMode ? 'bg-[#111116] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold uppercase font-mono tracking-wider text-white">
              Active Shipments & AWB Registry ({activeShipments.length})
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Real-time courier telemetry, printable shipping labels & customer tracking
            </p>
          </div>
        </div>

        {activeShipments.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs">
            No dispatched shipments found yet. Use the dispatch queue above to create your first shipment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3">Order</th>
                  <th className="py-3 px-3">Carrier & AWB</th>
                  <th className="py-3 px-3">Customer / City</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeShipments.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-white block">#{ord.orderNumber}</span>
                      <span className="text-[10px] text-slate-500">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-white font-bold block">{ord.courierName || 'Blue Dart Express'}</span>
                      <span className="text-[11px] text-red-400 font-mono font-bold block">
                        {ord.awbNumber}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-white block">
                        {ord.shippingAddress?.fullName || ord.userName || 'Customer'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {ord.shippingAddress?.city || 'Bengaluru'} ({ord.shippingAddress?.pincode || ord.shippingAddress?.zip || '560001'})
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>IN TRANSIT</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setActiveTrackingAwb(ord.awbNumber)}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 bg-black/40 hover:bg-slate-800 text-white font-mono text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5 text-red-400" />
                        <span>Track</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLabelModalOrder(ord)}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 bg-black/40 hover:bg-slate-800 text-white font-mono text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span>4x6 Label</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {activeTrackingAwb && (
        <ShiprocketTrackerModal
          isOpen={!!activeTrackingAwb}
          onClose={() => setActiveTrackingAwb(null)}
          awbNumber={activeTrackingAwb}
          isDarkMode={isDarkMode}
        />
      )}

      {labelModalOrder && (
        <ShippingLabelModal
          isOpen={!!labelModalOrder}
          onClose={() => setLabelModalOrder(null)}
          order={labelModalOrder}
        />
      )}
    </div>
  );
};
