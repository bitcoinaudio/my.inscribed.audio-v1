import React from 'react';

const Button = ({ children, onClick, disabled = false, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full px-4 py-2 font-semibold text-white rounded-md transition-all duration-300 ${disabled
        ? 'bg-gray-600 cursor-not-allowed'
        : 'bg-red-600 hover:bg-red-700 active:scale-95'
      } ${className}`}
  >
    {children}
  </button>
);

export default function InscriptionCard({ inscription, onSelect, disabled = false }) {
  const contentUrl = `https://radinals.bitcoinaudio.co/content/${inscription.id}`;
  const shortId = `${inscription.id.slice(0, 8)}...${inscription.id.slice(-8)}`;
  
  const renderPreview = () => {
    if (inscription.contentType?.startsWith('image/')) {
      return (
        <img 
          src={contentUrl} 
          alt="Inscription"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      );
    }
    
    if (inscription.contentType?.startsWith('text/html')) {
      return (
        <iframe 
          src={contentUrl} 
          className="w-full h-full border-0"
          title="Inscription preview"
        />
      );
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 text-center p-2">
        {inscription.contentType || 'Unknown format'}
      </div>
    );
  };

  return (
    <div className="border border-gray-600 rounded-lg p-3 bg-gray-700 hover:bg-gray-650 transition-colors">
      <div className="aspect-square mb-2 bg-gray-800 rounded flex items-center justify-center overflow-hidden relative">
        {renderPreview()}
        {/* Fallback for failed images */}
        <div className="absolute inset-0 hidden items-center justify-center text-xs text-gray-400 text-center p-2">
          {inscription.contentType || 'Preview unavailable'}
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-xs text-gray-400 font-mono">{shortId}</p>
        
        {inscription.isEnhanced && (
          <span className="inline-block px-2 py-1 text-xs bg-blue-600 text-white rounded">
            Enhanced
          </span>
        )}
        
        {inscription.isBRC420 && (
          <span className="inline-block px-2 py-1 text-xs bg-purple-600 text-white rounded">
            BRC420
          </span>
        )}
        
        <Button
          onClick={() => onSelect(inscription)}
          className="!w-full !py-1 !text-xs"
          disabled={disabled}
        >
          Select for Royalty
        </Button>
      </div>
    </div>
  );
}
