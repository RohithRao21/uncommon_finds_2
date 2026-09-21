import React, { useState, useEffect } from 'react';
import { X, Check, MapPin, AlertCircle } from 'lucide-react';
import { Address } from '../types';
import { useAddress } from '../context/AddressContext';

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit?: Address | null;
  isDarkMode?: boolean;
  onSaved?: (addressId: string) => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
];

export const AddressFormModal: React.FC<AddressFormModalProps> = ({
  isOpen,
  onClose,
  addressToEdit,
  isDarkMode = true,
  onSaved,
}) => {
  const { addAddress, updateAddress, validatePincode } = useAddress();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [pincodeError, setPincodeError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (addressToEdit) {
      setFullName(addressToEdit.fullName || '');
      setPhone(addressToEdit.phone || '');
      setAddressLine1(addressToEdit.addressLine1 || '');
      setAddressLine2(addressToEdit.addressLine2 || '');
      setCity(addressToEdit.city || '');
      setState(addressToEdit.state || 'Karnataka');
      setCountry(addressToEdit.country || 'India');
      setPincode(addressToEdit.pincode || '');
      setIsDefault(!!addressToEdit.isDefault);
    } else {
      setFullName('');
      setPhone('');
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setState('Karnataka');
      setCountry('India');
      setPincode('');
      setIsDefault(false);
    }
    setPincodeError('');
    setFormError('');
  }, [addressToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);

    if (val.length === 6) {
      const check = validatePincode(val);
      if (!check.isValid) {
        setPincodeError(check.message || 'Invalid Indian Pincode');
      } else {
        setPincodeError('');
      }
    } else if (val.length > 0) {
      setPincodeError('Pincode must be 6 digits');
    } else {
      setPincodeError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validate pincode
    const pinCheck = validatePincode(pincode);
    if (!pinCheck.isValid) {
      setPincodeError(pinCheck.message || 'Invalid Indian Pincode');
      setFormError(pinCheck.message || 'Please provide a valid Indian pincode.');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !state.trim()) {
      setFormError('Please fill in all required fields marked with *');
      return;
    }

    setIsSubmitting(true);

    try {
      if (addressToEdit) {
        const res = await updateAddress(addressToEdit.id, {
          fullName: fullName.trim(),
          phone: phone.trim(),
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim() || 'India',
          pincode: pincode.trim(),
          isDefault,
        });

        if (!res.success) {
          setFormError(res.error || 'Failed to update address.');
        } else {
          if (onSaved) onSaved(addressToEdit.id);
          onClose();
        }
      } else {
        const res = await addAddress({
          fullName: fullName.trim(),
          phone: phone.trim(),
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim() || 'India',
          pincode: pincode.trim(),
          isDefault,
        });

        if (!res.success) {
          setFormError(res.error || 'Failed to save address.');
        } else {
          if (onSaved && res.id) onSaved(res.id);
          onClose();
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Error processing address form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto font-mono-tech">
      <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden my-auto ${
        isDarkMode ? 'bg-[#0f1115] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDarkMode ? 'border-white/10 bg-black/40' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-sm tracking-wide uppercase">
              {addressToEdit ? 'EDIT ADDRESS' : 'ADD NEW DELIVERY ADDRESS'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-black hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                FULL NAME *
              </label>
              <input
                type="text"
                required
                placeholder="Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all ${
                  isDarkMode
                    ? 'bg-black/60 border-white/20 text-white focus:border-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-black'
                }`}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                PHONE NUMBER *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all ${
                  isDarkMode
                    ? 'bg-black/60 border-white/20 text-white focus:border-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-black'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              ADDRESS LINE 1 (FLAT, HOUSE NO., STREET) *
            </label>
            <input
              type="text"
              required
              placeholder="Flat 302, Cyber Heights, MG Road"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all ${
                isDarkMode
                  ? 'bg-black/60 border-white/20 text-white focus:border-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-black'
              }`}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              ADDRESS LINE 2 (AREA, LANDMARK - OPTIONAL)
            </label>
            <input
              type="text"
              placeholder="Near Indiranagar Metro Station"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all ${
                isDarkMode
                  ? 'bg-black/60 border-white/20 text-white focus:border-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-black'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                CITY / TOWN *
              </label>
              <input
                type="text"
                required
                placeholder="Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all ${
                  isDarkMode
                    ? 'bg-black/60 border-white/20 text-white focus:border-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-black'
                }`}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                STATE *
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all ${
                  isDarkMode
                    ? 'bg-black/60 border-white/20 text-white focus:border-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-black'
                }`}
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  INDIAN PINCODE *
                </label>
                <span className="text-[9px] text-slate-500 font-mono">6 DIGITS</span>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="560001"
                value={pincode}
                onChange={handlePincodeChange}
                className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all font-mono tracking-widest ${
                  pincodeError
                    ? 'border-red-500 bg-red-500/10 text-red-300'
                    : isDarkMode
                    ? 'bg-black/60 border-white/20 text-white focus:border-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-black'
                }`}
              />
              {pincodeError && (
                <p className="text-[10px] text-red-400 font-bold mt-1">{pincodeError}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                COUNTRY
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all ${
                  isDarkMode
                    ? 'bg-black/60 border-white/20 text-white focus:border-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-black'
                }`}
              />
            </div>
          </div>

          {/* Set Default Address Toggle */}
          <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-black text-red-500 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs text-slate-300 font-medium">
              Set as default shipping address
            </span>
          </label>

          {/* Action buttons */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                isDarkMode ? 'border-white/20 text-slate-300 hover:bg-white/10' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!pincodeError}
              className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg ${
                isSubmitting || pincodeError
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'SAVING...' : addressToEdit ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
