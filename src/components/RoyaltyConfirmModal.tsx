import React, { useState } from 'react';
import { X } from 'lucide-react';
import { MediaCard } from '../pages/MyMedia';
 
interface RoyaltyConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (royaltyFee: string) => void;
  inscriptionId: string;
  inscriptionPreview?: string;
  initialFee?: string;
}

const Input = ({ label, placeholder, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full bg-gray-600 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
    />
  </div>
);

const Button = ({ children, onClick, disabled = false, className = '', variant = 'primary' }) => {
  const baseClass = "px-4 py-2 font-semibold rounded-md transition-all duration-300";
  const variantClass = variant === 'primary' 
    ? 'bg-red-600 hover:bg-red-700 text-white' 
    : 'bg-gray-600 hover:bg-gray-700 text-white';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default function RoyaltyConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  inscriptionId,
  inscriptionPreview,
  initialFee = '5000'
}: RoyaltyConfirmModalProps) {
  const [royaltyFee, setRoyaltyFee] = useState(initialFee);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (royaltyFee && parseInt(royaltyFee) > 0) {
      onConfirm(royaltyFee);
      onClose();
    }
  };

  const shortId = inscriptionId ? `${inscriptionId.slice(0, 8)}...${inscriptionId.slice(-8)}` : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6  mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-red-300">Create Royalty Asset</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400">
            Inscription: <span className="text-white font-mono">{shortId}</span>
          </p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <div className="text-center">
            {inscriptionPreview ? (
              <img 
                src={inscriptionPreview} 
                alt="Inscription preview" 
                className="w-24 h-24 mx-auto rounded-md mb-2 object-cover"
              />
            ) : (
              <div className="w-24 h-24 mx-auto rounded-md mb-2 bg-gray-600 flex items-center justify-center">
                <span className="text-xs text-gray-400">Inscription</span>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2 font-mono break-all">{shortId}</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">What happens next:</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• This inscription will become a royalty-enforced asset</li>
              <li>• Future sales will automatically include the royalty fee</li>
              <li>• You'll receive royalties from all secondary sales</li>
            </ul>
            
            <div className="mt-4">
              <Input
                label="Royalty Fee (sats)"
                placeholder="5000"
                value={royaltyFee}
                onChange={(e) => setRoyaltyFee(e.target.value)}
                type="number"
              />
              <div className="text-xs text-gray-400 mt-1">
                Estimated fee: ~{Math.round(parseInt(royaltyFee || '0') / 100000000 * 100000) / 1000}k sats
              </div>
            </div>
          </div>

          

          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={onClose} 
              variant="secondary" 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!royaltyFee || parseInt(royaltyFee) <= 0}
              className="flex-1"
            >
              Create Royalty Asset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
