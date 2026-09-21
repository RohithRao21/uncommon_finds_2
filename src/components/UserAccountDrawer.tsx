import React, { useEffect, useState } from 'react';
import { X, LogOut, Package, User as UserIcon, Mail, Shield, CheckCircle2, AlertCircle, RefreshCw, Edit2, Save, Phone, Check, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, where, getDocs } from '../lib/firebase';
import { PriceDisplay } from './PriceDisplay';
import { AddressManager } from './AddressManager';

interface UserAccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

interface UserOrder {
  id: string;
  totalINR: number;
  status: string;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    selectedMaterial?: string;
  }>;
}

export const UserAccountDrawer: React.FC<UserAccountDrawerProps> = ({
  isOpen,
  onClose,
  isDarkMode = true,
}) => {
  const { 
    currentUser, 
    userProfile, 
    logout, 
    resendVerificationEmail, 
    refreshUserProfile,
    updateUserProfileData,
    updateUserRole,
  } = useAuth();

  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [verificationMsg, setVerificationMsg] = useState('');
  const [sendingVerification, setSendingVerification] = useState(false);

  // Profile Edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  useEffect(() => {
    if (userProfile) {
      setEditFullName(userProfile.fullName || '');
      setEditPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchUserOrders();
    }
  }, [isOpen, currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveErrorMsg('');
    setSaveSuccessMsg('');

    if (!editFullName.trim()) {
      setSaveErrorMsg('Full Name cannot be empty.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateUserProfileData({
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
      });
      setSaveSuccessMsg('Profile details updated successfully!');
      setIsEditingProfile(false);
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchUserOrders = async () => {
    if (!currentUser) return;
    setLoadingOrders(true);
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const fetched: UserOrder[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          totalINR: data.totalINR || 0,
          status: data.status || 'DISPATCHED',
          createdAt: data.createdAt || new Date().toISOString(),
          items: data.items || [],
        };
      });

      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(fetched);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleResendEmail = async () => {
    setSendingVerification(true);
    setVerificationMsg('');
    try {
      await resendVerificationEmail();
      setVerificationMsg('Verification link sent to your inbox.');
    } catch (err: any) {
      setVerificationMsg(err.message || 'Failed to send verification email.');
    } finally {
      setSendingVerification(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      onClose();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (!isOpen || !currentUser) return null;

  const displayName = userProfile?.fullName || currentUser.displayName || 'Maker';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          className={`w-screen max-w-md border-l flex flex-col shadow-2xl transition-all ${
            isDarkMode 
              ? 'bg-[#0a0c10] border-white/10 text-white' 
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div className={`p-6 border-b flex items-center justify-between ${
            isDarkMode ? 'border-white/10 bg-black/40' : 'border-slate-100 bg-slate-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white font-bold font-mono">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-mono-tech font-bold text-sm tracking-wide">
                  {displayName}
                </h3>
                <p className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-black hover:bg-slate-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className={`flex border-b font-mono-tech text-[11px] ${
            isDarkMode ? 'border-white/10 bg-black/20' : 'border-slate-100 bg-slate-100/50'
          }`}>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
                activeTab === 'orders'
                  ? (isDarkMode ? 'border-white text-white bg-white/5' : 'border-black text-black bg-white')
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>ORDERS</span>
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex-1 py-3 font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
                activeTab === 'addresses'
                  ? (isDarkMode ? 'border-white text-white bg-white/5' : 'border-black text-black bg-white')
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>ADDRESSES</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
                activeTab === 'profile'
                  ? (isDarkMode ? 'border-white text-white bg-white/5' : 'border-black text-black bg-white')
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>PROFILE</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Email Verification status banner */}
            {!currentUser.emailVerified && (
              <div className={`p-3.5 rounded-xl border font-mono-tech text-xs space-y-2 ${
                isDarkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>EMAIL NOT VERIFIED</span>
                  </div>
                  <button
                    onClick={refreshUserProfile}
                    title="Check status"
                    className="p-1 hover:bg-black/10 rounded cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] opacity-90">
                  Please verify your email address to unlock account protection.
                </p>
                {verificationMsg ? (
                  <p className="text-[10px] font-bold">{verificationMsg}</p>
                ) : (
                  <button
                    onClick={handleResendEmail}
                    disabled={sendingVerification}
                    className="text-[10px] underline uppercase font-bold cursor-pointer hover:text-amber-100"
                  >
                    {sendingVerification ? 'SENDING...' : 'RESEND VERIFICATION LINK'}
                  </button>
                )}
              </div>
            )}

            {activeTab === 'orders' ? (
              loadingOrders ? (
                <div className="py-12 text-center font-mono-tech text-xs text-slate-400 flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>FETCHING PRINT QUEUE...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center space-y-3 font-mono-tech">
                  <Package className="w-12 h-12 text-slate-600 mx-auto opacity-50" />
                  <p className="text-xs text-slate-400 uppercase font-bold">NO ORDERS RECORDED YET</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Your custom prints and queued orders will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div 
                      key={order.id}
                      className={`p-4 rounded-xl border font-mono-tech text-xs space-y-3 transition-all ${
                        isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] text-slate-400 uppercase">
                          ID: #{order.id.slice(0, 8)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-slate-300 text-[11px]">
                            <span className="truncate max-w-[200px]">
                              {item.quantity}x {item.name}
                            </span>
                            <PriceDisplay amount={item.unitPrice * item.quantity} usdClassName="text-slate-400" />
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-white/5 flex justify-between items-center font-bold">
                        <span className="text-slate-400 text-[10px]">TOTAL</span>
                        <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                          <PriceDisplay amount={order.totalINR} usdClassName="text-slate-400" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : activeTab === 'addresses' ? (
              <AddressManager isDarkMode={isDarkMode} compact />
            ) : (
              <div className="space-y-4 font-mono-tech text-xs">
                {saveSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                {saveErrorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{saveErrorMsg}</span>
                  </div>
                )}

                <div className={`p-4 rounded-xl border space-y-3 ${
                  isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h4 className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      FIRESTORE PROFILE RECORD
                    </h4>

                    {!isEditingProfile ? (
                      <button
                        onClick={() => {
                          setEditFullName(userProfile?.fullName || displayName);
                          setEditPhone(userProfile?.phone || '');
                          setIsEditingProfile(true);
                          setSaveSuccessMsg('');
                          setSaveErrorMsg('');
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                          isDarkMode 
                            ? 'border-white/20 bg-white/10 text-white hover:bg-white/20' 
                            : 'border-slate-300 bg-slate-200 text-slate-800 hover:bg-slate-300'
                        }`}
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>EDIT PROFILE</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="text-slate-400 hover:text-white text-[10px] uppercase font-bold cursor-pointer"
                      >
                        CANCEL
                      </button>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
                      <div>
                        <label className="block mb-1 text-[10px] text-slate-400 uppercase font-bold">FULL NAME</label>
                        <input
                          type="text"
                          required
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          placeholder="Your Full Name"
                          className={`w-full px-3 py-2 rounded-xl border outline-none font-sans font-medium transition-all ${
                            isDarkMode 
                              ? 'bg-black/60 border-white/20 text-white focus:border-white' 
                              : 'bg-white border-slate-300 text-slate-900 focus:border-black'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-[10px] text-slate-400 uppercase font-bold">PHONE NUMBER</label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className={`w-full px-3 py-2 rounded-xl border outline-none font-mono transition-all ${
                            isDarkMode 
                              ? 'bg-black/60 border-white/20 text-white focus:border-white' 
                              : 'bg-white border-slate-300 text-slate-900 focus:border-black'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-[10px] text-slate-500 uppercase font-bold">EMAIL ADDRESS (PRIMARY)</label>
                        <input
                          type="text"
                          disabled
                          value={currentUser.email || ''}
                          className={`w-full px-3 py-2 rounded-xl border text-slate-500 cursor-not-allowed ${
                            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
                          }`}
                        />
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className={`flex-1 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg ${
                            isDarkMode 
                              ? 'bg-white text-black hover:bg-slate-200' 
                              : 'bg-slate-900 text-white hover:bg-black'
                          }`}
                        >
                          {savingProfile ? (
                            <span>SAVING...</span>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>SAVE CHANGES</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-2.5 text-slate-300">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">FULL NAME</span>
                        <span className="font-bold text-white">{userProfile?.fullName || displayName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">EMAIL</span>
                        <span className="font-bold text-white truncate max-w-[200px]">{currentUser.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">PHONE</span>
                        <span className="font-mono text-slate-300">{userProfile?.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500">ROLE</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                            userProfile?.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-white/10 text-white'
                          }`}>
                            {userProfile?.role || 'customer'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextRole = userProfile?.role === 'admin' ? 'customer' : 'admin';
                              updateUserRole(nextRole);
                            }}
                            className="text-[10px] text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
                          >
                            {userProfile?.role === 'admin' ? 'Switch to Customer' : 'Make Admin'}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">EMAIL VERIFIED</span>
                        <span className="flex items-center gap-1 font-bold">
                          {currentUser.emailVerified ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                            </span>
                          ) : (
                            <span className="text-amber-400">UNVERIFIED</span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">UID</span>
                        <span className="font-mono text-[10px] text-slate-400">{currentUser.uid.slice(0, 16)}...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`p-4 rounded-xl border space-y-2 ${
                  isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Shield className="w-4 h-4" />
                    <span>AUTHENTICATED MAKER SESSION</span>
                  </div>
                  <p className="text-[11px] opacity-80 leading-relaxed">
                    Session state is persistently stored in Firebase Auth. All orders and 3D print queue items sync directly to your personal Firestore collection.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`p-6 border-t ${
            isDarkMode ? 'border-white/10 bg-black/40' : 'border-slate-100 bg-slate-50'
          }`}>
            <button
              onClick={handleSignOut}
              className={`w-full py-3 rounded-xl border font-mono-tech font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isDarkMode 
                  ? 'border-red-500/40 text-red-400 hover:bg-red-500/10' 
                  : 'border-red-300 text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
