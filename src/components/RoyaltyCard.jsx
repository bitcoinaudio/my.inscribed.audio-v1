import React from 'react';

const RoyaltyCard = ({ 
  inscription, 
  royaltyAmount, 
  royaltyKey, 
  artist = "Unknown", 
  description = "A royalty-enabled ordinal inscription",
  psbtData = null,
  onPurchase = null,
  showPurchaseButton = false,
  isListing = false
}) => {
  if (!inscription) {
    return (
      <div className="max-w-2xl w-full bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-yellow-500/10 border border-gray-700 overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <p>No inscription selected</p>
            <p className="text-sm mt-2">Select an inscription to create a royalty listing</p>
          </div>
        </div>
      </div>
    );
  }

  const getContentUrl = (inscriptionId) => {
    return `https://radinals.bitcoinaudio.co/content/${inscriptionId}`;
  };

  const getInscriptionUrl = (inscriptionId) => {
    return `https://radinals.bitcoinaudio.co/inscription/${inscriptionId}`;
  };

  const isImage = inscription.contentType?.startsWith('image/');
  const isText = inscription.contentType?.startsWith('text/');
  const isAudio = inscription.contentType?.startsWith('audio/');
  const isVideo = inscription.contentType?.startsWith('video/');

  const formatSats = (sats) => {
    if (!sats) return '0';
    return new Intl.NumberFormat().format(sats);
  };

  const formatBTC = (sats) => {
    if (!sats) return '0';
    return (sats / 100000000).toFixed(8);
  };

  const renderContent = () => {
    if (isImage) {
      return (
        <img 
          src={getContentUrl(inscription.id)} 
          alt={description}
          className="w-full h-auto rounded-lg object-cover border-2 border-gray-600 shadow-lg max-h-96"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/600x400/1f2937/9ca3af?text=Image+Not+Found';
          }}
        />
      );
    } else if (isText) {
      return (
        <div className="w-full h-64 bg-gray-800 border-2 border-gray-600 rounded-lg p-4 overflow-auto">
          <iframe 
            src={getContentUrl(inscription.id)}
            className="w-full h-full border-none"
            title="Text content"
          />
        </div>
      );
    } else if (isAudio) {
      return (
        <div className="w-full bg-gray-800 border-2 border-gray-600 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">🎵</div>
          <audio controls className="w-full">
            <source src={getContentUrl(inscription.id)} type={inscription.contentType} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    } else if (isVideo) {
      return (
        <video 
          controls 
          className="w-full h-auto rounded-lg border-2 border-gray-600 shadow-lg max-h-96"
        >
          <source src={getContentUrl(inscription.id)} type={inscription.contentType} />
          Your browser does not support the video element.
        </video>
      );
    } else {
      return (
        <div className="w-full h-64 bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">📄</div>
            <p>Content Type: {inscription.contentType}</p>
            <a 
              href={getContentUrl(inscription.id)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-yellow-400 hover:underline text-sm mt-2 block"
            >
              View Content
            </a>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-2xl w-full bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-yellow-500/10 border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-8">
        <h1 className="title-font text-4xl md:text-5xl font-bold text-center text-yellow-400">
          {isListing ? 'Royalty Listing' : 'Bitcoin Royalty'}
        </h1>
        <p className="text-center text-gray-400 mt-2">
          Ordinal Inscription by {artist}
        </p>
        {isListing && (
          <div className="text-center mt-2">
            <span className="inline-block bg-green-600 text-white text-xs px-3 py-1 rounded-full">
              🛍️ Available for Purchase
            </span>
          </div>
        )}
      </div>
      
      {/* Content Display */}
      <div className="px-8 py-4">
        {renderContent()}
      </div>

      {/* Asset Details */}
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-200">Asset Details</h2>
        <div className="mt-4 text-gray-300 space-y-2">
          <p>
            <strong className="text-yellow-500">Description:</strong> {description}
          </p>
          <p>
            <strong className="text-yellow-500">Inscription ID:</strong> 
            <a 
              href={getInscriptionUrl(inscription.id)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline ml-1 break-all"
            >
              {inscription.id}
            </a>
          </p>
          <p>
            <strong className="text-yellow-500">Content Type:</strong> {inscription.contentType || 'Unknown'}
          </p>
          <p>
            <strong className="text-yellow-500">Artist:</strong> {artist}
          </p>
          <p>
            <strong className="text-yellow-500">Royalty Key Holder:</strong> 
            <span className="ml-1 break-all font-mono text-sm">{royaltyKey || 'Not set'}</span>
          </p>
          {royaltyAmount && (
            <p>
              <strong className="text-yellow-500">Royalty Amount:</strong> 
              <span className="ml-1">{formatSats(royaltyAmount)} sats ({formatBTC(royaltyAmount)} BTC)</span>
            </p>
          )}
          <p>
            <strong className="text-yellow-500">Royalty Script:</strong> Native Bitcoin Miniscript (2-of-2 Multisig)
          </p>
        </div>

        {/* PSBT Information (if available) */}
        {psbtData && (
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Transaction Details</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p><strong>Ordinal Input:</strong> <span className="font-mono break-all">{psbtData.ordinalInput}</span></p>
              <p><strong>Ordinal Value:</strong> {formatSats(psbtData.ordinalValue)} sats</p>
              <p><strong>Funding Input:</strong> <span className="font-mono break-all">{psbtData.fundingInput}</span></p>
              <p><strong>Funding Value:</strong> {formatSats(psbtData.fundingValue)} sats</p>
            </div>
          </div>
        )}

        {/* Purchase Button (for marketplace listings) */}
        {showPurchaseButton && onPurchase && (
          <div className="mt-6">
            <button
              onClick={() => onPurchase(inscription, psbtData)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-md transition-all duration-300 active:scale-95"
            >
              Purchase for {formatSats(royaltyAmount)} sats
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black/50 text-center p-4 text-xs text-gray-500 border-t border-gray-800">
        <p>This Ordinal's transfer is subject to a native royalty enforcement script.</p>
        {isListing && (
          <p className="mt-1 text-yellow-400">
            ⚡ Powered by Bitcoin Royalty Kit
          </p>
        )}
      </footer>
    </div>
  );
};

export default RoyaltyCard;
