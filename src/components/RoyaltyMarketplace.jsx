import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RoyaltyCard from './RoyaltyCard';
import bitcoinroyaltyimg from '/images/bitcoinroyalty2.jpg';

// Reusable components from RoyaltyKit
const Card = ({ children, className = '' }) => (
  <div className={`border border-gray-700 rounded-xl shadow-lg p-6 backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, disabled = false, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 font-semibold text-white rounded-md transition-all duration-300 ${disabled
        ? 'bg-gray-600 cursor-not-allowed'
        : 'bg-red-600 hover:bg-red-700 active:scale-95'
      } ${className}`}
  >
    {children}
  </button>
);

const RoyaltyMarketplace = ({ listings = [], onPurchase }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredListings = listings.filter(listing => {
    if (filter === 'all') return true;
    if (filter === 'images') return listing.inscription?.contentType?.startsWith('image/');
    if (filter === 'audio') return listing.inscription?.contentType?.startsWith('audio/');
    if (filter === 'text') return listing.inscription?.contentType?.startsWith('text/');
    return true;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'price-low') return (a.royaltyAmount || 0) - (b.royaltyAmount || 0);
    if (sortBy === 'price-high') return (b.royaltyAmount || 0) - (a.royaltyAmount || 0);
    return 0; // 'recent' - maintain original order
  });

  if (listings.length === 0) {
    return (
      <div className="">
        <div className="">
          <header className="flex justify-center items-center gap-4 mb-8">
            <img src={bitcoinroyaltyimg} alt="Bitcoin Royalty" className="h-16 w-16 rounded-md" />
            <div className="text-left">
              <h1 className="text-4xl font-bold text-red-400">Bitcoin Royalty Marketplace</h1>
              <p className="text-gray-400 mt-1">Discover and purchase royalty-enabled ordinal inscriptions.</p>
            </div>
          </header>
          
          <main>
            <Card className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-4xl">🏪</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-300 mb-4">No Listings Available</h2>
              <p className="text-gray-500 mb-2">No royalty-enabled listings available yet.</p>
              <p className="text-sm text-gray-600 mb-6">Create your first royalty listing to see it here!</p>
              
              <Link to="/royaltykit">
                <Button className="!bg-red-600 !hover:bg-red-700">
                  Create Your First Listing
                </Button>
              </Link>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        {/* Header - matching RoyaltyKit style */}
        <header className="flex justify-center items-center gap-4 mb-8">
          <img src={bitcoinroyaltyimg} alt="Bitcoin Royalty" className="h-16 w-16 rounded-md" />
          <div className="text-left">
            <h1 className="text-4xl font-bold text-red-400">Bitcoin Royalty Marketplace</h1>
            <p className="text-gray-400 mt-1">Discover and purchase royalty-enabled ordinal inscriptions.</p>
          </div>
        </header>

        <main>
          <div className="grid grid-cols-1 gap-6">
            
            {/* Filters and Sort Card */}
            <Card>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-300">Filter:</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-gray-600 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Types</option>
                    <option value="images">Images</option>
                    <option value="audio">Audio</option>
                    <option value="text">Text</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-300">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-600 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                <div className="ml-auto text-sm text-gray-400">
                  {sortedListings.length} listing{sortedListings.length !== 1 ? 's' : ''} found
                </div>

                <Link to="/royaltykit">
                  <Button className="!bg-red-600 !hover:bg-red-700 !text-sm !px-4 !py-2">
                    + Create Listing
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedListings.map((listing, index) => (
                <div key={`${listing.inscription?.id || index}`}>
                  <RoyaltyCard
                    inscription={listing.inscription}
                    royaltyAmount={listing.royaltyAmount}
                    royaltyKey={listing.royaltyKey}
                    artist={listing.artist || 'Unknown Artist'}
                    description={listing.description || 'A unique royalty-enabled ordinal'}
                    psbtData={listing.psbtData}
                    onPurchase={onPurchase}
                    showPurchaseButton={true}
                    isListing={true}
                  />
                </div>
              ))}
            </div>

            {/* How It Works Section */}
            <Card className="mt-8">
              <h2 className="text-2xl font-bold text-red-300 mb-4 text-center">How Bitcoin Royalty Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h3 className="font-semibold text-gray-200">Create Listing</h3>
                      <p className="text-gray-400 text-sm">Artists create royalty-enabled ordinal listings using Bitcoin Royalty Kit</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h3 className="font-semibold text-gray-200">Purchase with Royalties</h3>
                      <p className="text-gray-400 text-sm">Buyers purchase inscriptions with built-in royalty enforcement</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h3 className="font-semibold text-gray-200">Native Enforcement</h3>
                      <p className="text-gray-400 text-sm">Royalties are enforced by native Bitcoin multisig scripts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <h3 className="font-semibold text-gray-200">No Intermediaries</h3>
                      <p className="text-gray-400 text-sm">Direct Bitcoin transactions with automatic royalty splits</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
};

export default RoyaltyMarketplace;
