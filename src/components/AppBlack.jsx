import React, { useState, useEffect } from 'react';
import Samplerr from './Samplerr.jsx';
import { colors, vinylLabelImage, vinylLabelAudio } from 'https://radinals.bitcoinaudio.co/content/acbbb181a17b4c5c6146d6451dd42794c735677122f475094b27c7e9c2175be3i0';
 

function VinylRecord({ onClick, isFlipping }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 300 300"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        transform: isFlipping ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 0.6s',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
      }}
    >
      <defs>
        <linearGradient id="vinylGradient" gradientTransform="rotate(45)">
          {colors.map((color, idx) => (
            <stop
              key={idx}
              offset={`${(idx * 100) / (colors.length - 1)}%`}
              stopColor={color}
            />
          ))}
        </linearGradient>
      </defs>

      <circle cx="150" cy="150" r="145" fill="url(#vinylGradient)" />
      <circle cx="150" cy="150" r="140" fill="black" opacity="0.8" />

      {[...Array(9)].map((_, i) => (
        <circle
          key={i}
          cx="150"
          cy="150"
          r={120 - i * 15}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      ))}

      <circle cx="150" cy="150" r="45" fill="white" />
      <image
        href={vinylLabelImage}
        x="105"
        y="105"
        width="100"
        height="100"
        clipPath="circle(40px at 45px 45px)"
      />

    </svg>
  );
}

const gradientColors = colors.join(', ');
export default function App() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [text, setText] = useState('The Ides of March');
  const [corsSuccess, setCorsSuccess] = useState(null);
  const [showSamplerrThumbnail, setShowSamplerrThumbnail] = useState(false);
  const [showSamplerrComponent, setShowSamplerrComponent] = useState(false);
  const [showVinylRecord, setShowVinylRecord] = useState(false);
  const [audioUrl, setAudioUrl] = useState(vinylLabelAudio);
  const [imageUrl, setImageUrl] = useState(vinylLabelImage);

  useEffect(() => {
    function handleCorsCheckComplete(event) {
      setCorsSuccess(event.detail);
      console.log("CORS check complete useeffect", event.detail);
    }

    window.addEventListener('corsCheckComplete', handleCorsCheckComplete);

    return () => {
      window.removeEventListener('corsCheckComplete', handleCorsCheckComplete);
    };
  }, []);

 
  
  useEffect(() => {
    if (isFlipping) {
      const timer = setTimeout(() => {
        setIsFlipping(false);
        setShowSamplerrComponent(true);
      }, 150);
      return () => clearTimeout(timer);
    }

    console.log('Component mounted');

    return () => {
      console.log('Component will unmount');
    };
  }, [isFlipping]);


  if (corsSuccess === true || corsSuccess == null) {
    return (
      <div>
        <div
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            height: '100vh',
            width: '100vw',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        />
        <div
          style={{
            background: `linear-gradient(45deg, ${gradientColors})`,
            height: '100vh',
            width: '100vw',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          {!showSamplerrComponent ? (
            <>
              <VinylRecord
                text={text}
                onClick={() => {
                  setIsFlipping(true);
                  setAudioUrl(audioUrl);
                  setImageUrl(imageUrl);
                  setTimeout(() => {
                    setIsFlipping(false);
                    setShowSamplerrComponent(true);
                    setShowVinylRecord(false);
                  }, 150);
                }}
                isFlipping={isFlipping}
              />


              {showSamplerrThumbnail && (
                <img
                  src={imageUrl}
                  alt="Samplerr Thumbnail"
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    height: '300px',
                    cursor: 'pointer',
                    zIndex: 1,
                  }}
                  onClick={() => setShowSamplerrComponent(true)}
                />
              )}
            </>
          ) : (
            <Samplerr
              audioUrl={audioUrl}
              imageUrl={imageUrl}
              onBack={() => {
                setShowSamplerrComponent(false);
              }}

            />
          )}

        </div>
      </div>
    );
  } else if (corsSuccess === false) {
    return (
      <iframe
        src="https://arweave.net/0AphIk6Qiuu3RwGtYL02w9weo3Cci5Xp-M0LRgZ42Gg"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          margin: 0,
          padding: 0,
          overflow: 'hidden'
        }}
        title="Fullscreen Content"
      />
    )
  };

}