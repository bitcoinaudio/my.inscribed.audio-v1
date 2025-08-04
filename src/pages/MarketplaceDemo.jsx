import React from 'react';
import { Link } from 'react-router-dom';
import RoyaltyMarketplace from '../components/RoyaltyMarketplace';

// Mock data for marketplace demo
const mockListings = [
  {
    inscription: {
      id: 'b1ade815da823de16f0dc26417c5bfb9caefc9005f0e9585b1f0072eb7e43605i1536',
      contentType: 'image/jpeg'
    },
    royaltyAmount: 5000,
    royaltyKey: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    artist: 'Alice',
    description: 'A beautiful digital artwork with enforced royalties',
    psbtData: {
      ordinalInput: 'b1ade815da823de16f0dc26417c5bfb9caefc9005f0e9585b1f0072eb7e43605:0',
      ordinalValue: 777,
      fundingInput: 'f8d2e3c4b5a69788234567890abcdef1234567890abcdef1234567890abcdef:1',
      fundingValue: 25000
    }
  },
  {
    inscription: {
      id: 'c2bdf926eb934ef27f1ed37528d6cfg0dbfed0106f1fa696c2g1083fc8f54716i0',
      contentType: 'text/plain'
    },
    royaltyAmount: 2000,
    royaltyKey: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    artist: 'Bob',
    description: 'Inspirational text inscription with royalty protection',
    psbtData: {
      ordinalInput: 'c2bdf926eb934ef27f1ed37528d6cfg0dbfed0106f1fa696c2g1083fc8f54716:0',
      ordinalValue: 777,
      fundingInput: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef:1',
      fundingValue: 15000
    }
  },
  {
    inscription: {
      id: 'd3ceg037fc045fg38g2fe48639e7dhg1ecgfe1217g2gb707d3h2194gd9g65827i42',
      contentType: 'audio/mpeg'
    },
    royaltyAmount: 10000,
    royaltyKey: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    artist: 'Charlie',
    description: 'Exclusive music track with built-in royalty enforcement',
    psbtData: {
      ordinalInput: 'd3ceg037fc045fg38g2fe48639e7dhg1ecgfe1217g2gb707d3h2194gd9g65827:0',
      ordinalValue: 777,
      fundingInput: 'b2c3d4e5f6789012345678901bcdef12345678901bcdef12345678901bcdef0:1',
      fundingValue: 35000
    }
  }
];

const MarketplaceDemo = () => {
  const handlePurchase = (inscription, psbtData) => {
    alert(`Purchase functionality would be implemented here for inscription: ${inscription.id}`);
    console.log('Purchase requested:', { inscription, psbtData });
  };

  return (
    <div>
      {/* Back to RoyaltyKit link */}
      <div className="mb-4">
        <Link 
          to="/royaltykit" 
          className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
        >
          ← Back to Royalty Kit
        </Link>
      </div>
      
      <RoyaltyMarketplace 
        listings={mockListings} 
        onPurchase={handlePurchase}
      />
    </div>
  );
};

export default MarketplaceDemo;
