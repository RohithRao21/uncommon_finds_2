import React, { useState } from 'react';
import { Plus, MapPin, Edit3, Trash2, CheckCircle, Star, Phone, Home } from 'lucide-react';
import { Address } from '../types';
import { useAddress } from '../context/AddressContext';
import { AddressFormModal } from './AddressFormModal';

interface AddressManagerProps {
  isDarkMode?: boolean;
  selectable?: boolean;
  selectedAddressId?: string;
  onSelectAddress?: (address: Address) => void;
  compact?: boolean;
}

export const AddressManager: React.FC<AddressManagerProps> = ({
  isDarkMode = true,
  selectable = false,
  selectedAddressId,
  onSelectAddress,
  compact = false,
}) => {
  const { addresses, isLoadingAddresses, deleteAddress, setDefaultAddress } = useAddress();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setAddressToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddressToEdit(addr);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this address?')) {
      setDeletingId(id);
      await deleteAddress(id);
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await setDefaultAddress(id);
  };

  return (
    <div className="space-y-4 font-mono-tech">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-500" />
          <h3 className={`font-bold text-xs uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            SAVED ADDRESSES ({addresses.length})
          </h3>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-red-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>ADD NEW</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoadingAddresses ? (
        <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>LOADING ADDRESSES...</span>
        </div>
      ) : addresses.length === 0 ? (
        /* Empty State */
        <div className={`p-6 rounded-xl border text-center space-y-3 ${
          isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <Home className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
          <p className="text-xs text-slate-400 uppercase font-bold">NO ADDRESSES SAVED YET</p>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            Save delivery addresses to speed up future checkouts.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer hover:bg-slate-200"
          >
            + ADD FIRST ADDRESS
          </button>
        </div>
      ) : (
        /* List of saved addresses */
        <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-3`}>
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id;

            return (
              <div
                key={addr.id}
                onClick={() => selectable && onSelectAddress && onSelectAddress(addr)}
                className={`p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                  selectable ? 'cursor-pointer' : ''
                } ${
                  isSelected
                    ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10'
                    : isDarkMode
                    ? 'bg-black/40 border-white/10 hover:border-white/30'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-400'
                }`}
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-wide truncate max-w-[180px]">
                        {addr.fullName}
                      </span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-500 text-white flex items-center gap-1 shrink-0">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>DEFAULT</span>
                        </span>
                      )}
                    </div>

                    {selectable && isSelected && (
                      <CheckCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                  </div>

                  {/* Address Body */}
                  <div className="text-[11px] text-slate-300 space-y-0.5 font-sans mb-3">
                    <p className="font-medium text-white">{addr.addressLine1}</p>
                    {addr.addressLine2 && <p className="text-slate-400">{addr.addressLine2}</p>}
                    <p className="text-slate-400">
                      {addr.city}, {addr.state} - <span className="font-mono text-white font-bold">{addr.pincode}</span>
                    </p>
                    <p className="text-slate-400">{addr.country}</p>
                    <div className="flex items-center gap-1.5 pt-1 text-slate-400 font-mono text-[10px]">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{addr.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px]">
                  {!addr.isDefault ? (
                    <button
                      type="button"
                      onClick={(e) => handleSetDefault(addr.id, e)}
                      className="text-slate-400 hover:text-white underline font-bold uppercase cursor-pointer"
                    >
                      SET AS DEFAULT
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-bold uppercase text-[9px]">
                      PRIMARY SHIPPING
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(addr, e)}
                      title="Edit Address"
                      className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === addr.id}
                      onClick={(e) => handleDelete(addr.id, e)}
                      title="Delete Address"
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addressToEdit={addressToEdit}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
