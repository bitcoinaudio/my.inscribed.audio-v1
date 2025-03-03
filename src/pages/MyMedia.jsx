import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "../utils/motion";
import { inscriptionArray } from "../globalState";
import ordImage from "/images/ordinals.svg";
import iomImage from "/images/idesofmarch.png";
import woman from "/images/woman-sticker.webp";
import MimeTypeFilter from "../components/MimeTypeFilter";
import { useLaserEyes } from "@omnisat/lasereyes";
import GLTFViewer from "../components/GLTFViewer";

// Constants
const ORD_SERVER = "https://radinals.bitcoinaudio.co";
const ITEMS_PER_PAGE = 10;

const MIME_TYPES = {
  text: [
    "application/json",
    "text/css",
    "text/javascript",
    "text/plain",
    "text/plain;charset=utf-8",
    "text/html",
    "text/html;charset=utf-8",
  ],
  audio: ["audio/ogg", "audio/mpeg"],
  video: ["video/mp4"],
  image: [
    "image/png",
    "image/gif",
    "image/jpeg",
    "image/svg+xml",
    "image/webp",
  ],
  model: ["model/gltf+json", "model/gltf-binary"],
};

const ALL_MIME_TYPES = Object.values(MIME_TYPES).flat();

const getContentCategory = (contentType) => {
  if (MIME_TYPES.text.includes(contentType)) return "text";
  if (MIME_TYPES.audio.includes(contentType)) return "audio";
  if (MIME_TYPES.video.includes(contentType)) return "video";
  if (MIME_TYPES.image.includes(contentType)) return "image";
  if (MIME_TYPES.model.includes(contentType)) return "model";
  return "unknown";
};

// LazyIframe Component
const LazyIframe = ({ src, placeholderSrc, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" } // Preload 100px before entering viewport
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        <iframe
          src={src}
          height="100%"
          width="100%"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <div className="skeleton size-48" /> // Fallback to skeleton; replace with img if you have placeholders
        // <img src={placeholderSrc || "/placeholder.jpg"} alt="Placeholder" className="size-48" />
      )}
    </div>
  );
};

// MediaCard Component
const MediaCard = React.memo(({ item }) => {
  const contentCategory = getContentCategory(item.contentType);
  const isBitmap = item.isBitmap;
  const contentUrl = item.isBRC420 ? item.brc420Url : `${ORD_SERVER}/content/${item.id}`;
  const previewUrl = `${ORD_SERVER}/preview/${item.id}`;

  const renderContent = () => {
    switch (contentCategory) {
      case "text":
        return item.contentType.startsWith("text/html") ? (
          <LazyIframe src={contentUrl} />
        ) : isBitmap ? (
          <div>
            <LazyIframe src={`https://ord.bitmapstr.io/block/height/${item.bitmap}`} />
             <p className="text-lg font-urbanist font-medium text-orange-400 opacity-60 py-4">
              {item.bitmap + '.bitmap'}
            </p>
          </div>
        ) : (
          <p className="text-md font-urbanist font-medium opacity-60">
            {item.contentType}
          </p>
        );
      case "image":
        return (
          <div className="card-body shadow-inner">
            <img className="size-48" src={contentUrl} alt="Inscription" />
          </div>
        );
      case "model":
        return  <GLTFViewer src={contentUrl} />
      case "video":
      case "audio":
        return (
          <video width="320" height="240" controls>
            <source src={contentUrl} />
          </video>
        );
      default:
        return <LazyIframe src={contentUrl} />;
    }
  };

  return (
    <div className="card max-w-2xl transition duration-300 hover:-translate-y-1 bg-base-200 rounded-box mt-4 gap-4">
      <div className="card-body shadow-inner">
        {renderContent()}
        
        <p className="text-md font-urbanist font-medium opacity-60">
          {item.isEnhanced ? "Enhanced" : "Basic"} {item.isBRC420 ? "BRC420" : "Ordinal"}
          <hr />
          {item.attributes && (
            <div>
              <h3 className="font-urbanist text-xl font-bold">Attributes:</h3>
              <ul className="list-disc list-inside">
                {Object.entries(item.attributes[0] || {}).map(([key, value]) => (
                  <li key={key} className="text-md font-urbanist font-medium opacity-60">
                    {key}: {value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </p>

        <div className="card-actions justify-center">
          <ul className="menu menu-horizontal bg-base-200 rounded-box mt-1">
            <li>
              <a
                className="tooltip"
                data-tip="Details"
                href={`${ORD_SERVER}/inscription/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </a>
            </li>
            <li>
              <a
                className="tooltip"
                data-tip="Ordinal"
                href={`${ORD_SERVER}/content/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img className="size-5" src={ordImage} alt="Ordinal" />
              </a>
            </li>
            {item.isIOM && (
              <li>
                <a
                  className="tooltip"
                  data-tip="IOM"
                  href="https://arweave.net/0AphIk6Qiuu3RwGtYL02w9weo3Cci5Xp-M0LRgZ42Gg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img className="size-10" src={iomImage} alt="IOM" />
                </a>
              </li>
            )}
            {item.attributes && (
              <div>
                <ul className="">
                  {Object.entries(item.attributes[0] || {}).map(([key, value]) => (
                    <div key={key} className="">
                      {value === "Woman" && (
                        <img id="image" className="w-12 h-10" src={woman} alt="Woman" />
                      )}
                    </div>
                  ))}
                </ul>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
});

// MyMedia Component
const MyMedia = () => {
  const { connect, disconnect, address, provider, hasUnisat, hasXverse, hasMagicEden } = useLaserEyes();
  const [selectedMimeTypes, setSelectedMimeTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedItems = useMemo(() => {
    const filteredArray = selectedMimeTypes.length > 0
      ? inscriptionArray.filter(item => selectedMimeTypes.includes(item.contentType))
      : inscriptionArray;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArray.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [selectedMimeTypes, currentPage]);

  const totalPages = Math.ceil(inscriptionArray.length / ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.min(Math.max(newPage, 1), totalPages));
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      id="mymedia"
      className="flex flex-col items-center justify-center"
    >
      <motion.div variants={fadeIn("up", "tween", 0.2, 1)} className="w-full">
        <MimeTypeFilter
          mimeTypes={ALL_MIME_TYPES}
          selectedMimeTypes={selectedMimeTypes}
          onChange={setSelectedMimeTypes}
        />

        <div className="flex flex-col items-center mt-4">
          <div className="text-center mb-4">
            <span className="text-sm font-bold">Total Items: {inscriptionArray.length}</span>
            <div className="text-sm mt-2">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="btn btn-ghost font-urbanist text-lg font-semibold"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <input
              type="number"
              className="input input-bordered w-20 text-center"
              value={currentPage}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              min="1"
              max={totalPages}
            />
            <button
              className="btn btn-ghost font-urbanist text-lg font-semibold"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {paginatedItems.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MyMedia;