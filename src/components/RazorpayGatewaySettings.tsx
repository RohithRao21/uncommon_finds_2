import React, { useState, useEffect } from 'react';
import { 
  CreditCard, ShieldCheck, Zap, Key, CheckCircle2, AlertCircle, 
  ExternalLink, Sparkles, RefreshCw, Copy, Check, Eye, EyeOff 
} from 'lucide-react';
import { 
  getRazorpayKeyId, setStoredRazorpayKeyId, clearStoredRazorpayKeyId, 
  getRazorpayMode, openRazorpayCheckout 
} from '../lib/razorpay';
import { doc, getDoc, setDoc, db } from '../lib/firebase';

interface RazorpayGatewaySettingsProps {
  isDarkMode?: boolean;
}

export const RazorpayGatewaySettings: React.FC<RazorpayGatewaySettingsProps> = ({ isDarkMode = true }) => {
  const [currentKey, setCurrentKey] = useState<string>('');
  const [inputKey, setInputKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const key = getRazorpayKeyId() || '';
    setCurrentKey(key);
    setInputKey(key);

    // Also try to read from Firestore settings if available
    const fetchRemoteSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'paymentGateway'));
        if (snap.exists() && snap.data().razorpayKeyId) {
          const remoteKey = snap.data().razorpayKeyId;
          if (!key) {
            setStoredRazorpayKeyId(remoteKey);
            setCurrentKey(remoteKey);
            setInputKey(remoteKey);
          }
        }
      } catch (err) {
        // Ignored if permissions restrict
      }
    };
    fetchRemoteSettings();
  }, []);

  const handleSave = async () => {
    const trimmed = inputKey.trim();
    setStoredRazorpayKeyId(trimmed);
    setCurrentKey(trimmed);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    // Attempt to persist to Firestore
    try {
      await setDoc(doc(db, 'settings', 'paymentGateway'), {
        razorpayKeyId: trimmed,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      // Ignored if offline or rules forbid
    }
  };

  const handleClear = () => {
    clearStoredRazorpayKeyId();
    setCurrentKey('');
    setInputKey('');
  };

  const handleTestCheckout = async () => {
    setIsTesting(true);
    setTestStatus('Opening Razorpay modal...');

    const success = await openRazorpayCheckout({
      amountINR: 1,
      orderNumber: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'Test Customer',
      customerEmail: 'customer@example.com',
      customerPhone: '+91 9999999999',
      description: 'Razorpay Gateway Diagnostic Test (₹1.00)',
      onSuccess: (res) => {
        setIsTesting(false);
        setTestStatus(`Payment Diagnostic Successful! ID: ${res.razorpay_payment_id}`);
      },
      onFailure: (err) => {
        setIsTesting(false);
        setTestStatus(`Test Failed/Dismissed: ${err?.description || err?.message || 'Cancelled'}`);
      },
      onDismiss: () => {
        setIsTesting(false);
        setTestStatus('Diagnostic modal closed by user');
      }
    });

    if (!success) {
      setIsTesting(false);
    }
  };

  const mode = getRazorpayMode();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isDarkMode ? 'bg-[#111116] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-xl font-bold uppercase tracking-tight font-display ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Razorpay Payment Gateway
              </h2>
              <p className="text-xs text-slate-400 font-mono-tech mt-0.5">
                Instant UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking & Wallets
              </p>
            </div>
          </div>

          {/* Current Status Badge */}
          <div>
            {mode === 'live' ? (
              <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE PRODUCTION GATEWAY</span>
              </div>
            ) : mode === 'test' ? (
              <div className="px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/40 text-blue-400 text-xs font-mono font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>RAZORPAY TEST SANDBOX</span>
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>SIMULATION MODE (KEY NEEDED)</span>
              </div>
            )}
          </div>
        </div>

        {/* Key Input Section */}
        <div className="pt-6 space-y-4">
          <div>
            <label className={`block text-xs font-bold font-mono-tech uppercase tracking-wider mb-2 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              RAZORPAY KEY ID (<span className="text-red-400">rzp_test_...</span> or <span className="text-emerald-400">rzp_live_...</span>)
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder="e.g. rzp_test_1DP5mmOlF5G5ag or rzp_live_xxxxxxxxxxxxxx"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className={`w-full px-4 py-3 pr-10 rounded-xl border font-mono text-xs outline-none transition-colors ${
                    isDarkMode 
                      ? 'bg-black/60 border-slate-700 text-white focus:border-red-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 cursor-pointer flex items-center gap-2 shrink-0"
                >
                  <Key className="w-4 h-4" />
                  <span>ACTIVATE KEY</span>
                </button>

                {currentKey && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className={`px-3 py-3 rounded-xl border text-xs font-mono-tech uppercase font-bold transition-colors cursor-pointer ${
                      isDarkMode ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-300 text-slate-600 hover:text-black'
                    }`}
                    title="Remove custom key"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {savedSuccess && (
              <div className="mt-3 text-xs text-emerald-400 font-mono flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>Razorpay Key saved successfully! The checkout is now active with this key.</span>
              </div>
            )}
          </div>

          {/* Quick Diagnostic Test Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              type="button"
              disabled={isTesting}
              onClick={handleTestCheckout}
              className={`px-4 py-2.5 rounded-xl border font-mono-tech text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                isDarkMode 
                  ? 'border-slate-700 bg-white/5 text-white hover:bg-white/10' 
                  : 'border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin text-red-500" /> : <Sparkles className="w-4 h-4 text-red-500" />}
              <span>LAUNCH TEST PAYMENT POPUP (₹1.00)</span>
            </button>

            {testStatus && (
              <span className="text-xs font-mono text-slate-300 truncate max-w-md">
                {testStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Guide & Setup Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step-by-Step Instructions */}
        <div className={`p-6 rounded-2xl border ${
          isDarkMode ? 'bg-[#111116] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-sm font-bold uppercase font-mono-tech tracking-wider mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <ShieldCheck className="w-4 h-4 text-red-500" />
            <span>How to get your Razorpay Key</span>
          </h3>

          <ol className="space-y-3 text-xs font-mono text-slate-400 list-decimal list-inside leading-relaxed">
            <li>
              Log in to your <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" className="text-red-400 underline inline-flex items-center gap-1">Razorpay Dashboard <ExternalLink className="w-3 h-3 inline" /></a>.
            </li>
            <li>
              Switch toggle at the top to <strong>Test Mode</strong> (for testing) or <strong>Live Mode</strong> (for real money).
            </li>
            <li>
              Go to <strong>Settings</strong> &rarr; <strong>API Keys</strong> &rarr; Click <strong>Generate Key</strong>.
            </li>
            <li>
              Copy the <strong>Key ID</strong> (starts with <code className="text-white">rzp_test_</code> or <code className="text-white">rzp_live_</code>) and paste it into the input above.
            </li>
            <li className="text-slate-500">
              <em>Note: The Secret Key is private and never exposed to the client app.</em>
            </li>
          </ol>
        </div>

        {/* Supported Payment Channels */}
        <div className={`p-6 rounded-2xl border ${
          isDarkMode ? 'bg-[#111116] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-sm font-bold uppercase font-mono-tech tracking-wider mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Supported Payment Channels</span>
          </h3>

          <div className="space-y-3 text-xs font-mono text-slate-400">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="font-bold text-white">UPI Apps</span>
              <span className="text-emerald-400">Google Pay, PhonePe, Paytm, CRED, BHIM QR</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="font-bold text-white">Cards</span>
              <span className="text-emerald-400">Visa, Mastercard, RuPay, Maestro, Amex</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="font-bold text-white">NetBanking</span>
              <span className="text-emerald-400">HDFC, ICICI, SBI, Axis, Kotak + 50 banks</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span className="font-bold text-white">Cash on Delivery</span>
              <span className="text-amber-400">Built-in option during checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
