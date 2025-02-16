import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "../utils/motion";
import { inscriptionArray } from "../globalState";
import ordImage from "/images/ordinals.svg";
import iomImage from "/images/idesofmarch.png";
import woman from "/images/woman-sticker.webp";
import MimeTypeFilter from "../components/MimeTypeFilter"; // Import the MimeTypeFilter component

const mimeTypes = [
  "application/json",
  "text/css",
  "text/javascript",
  "text/plain",
];

const mediaTypes = [
  "audio/ogg",
  "audio/mpeg",
  "image/png",
  "image/gif",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
  "text/html",
  "video/mp4",
];

const ITEMS_PER_PAGE = 10; // Number of items per page

const MyMedia = () => {
  const [selectedMimeTypes, setSelectedMimeTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and paginate inscriptions
  const paginatedItems = useMemo(() => {
    let filteredArray = inscriptionArray;

    if (selectedMimeTypes.length > 0) {
      filteredArray = filteredArray.filter((item) =>
        selectedMimeTypes.includes(item.contentType)
      );
    }

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

    return filteredArray.slice(indexOfFirstItem, indexOfLastItem);
  }, [selectedMimeTypes, currentPage, inscriptionArray]);

  // Total pages calculation
  const totalPages = Math.ceil(inscriptionArray.length / ITEMS_PER_PAGE);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      id="mymedia"
      className="flex flex-col items-center justify-center"
    >
      <motion.div
        variants={fadeIn("up", "tween", 0.2, 1)}
        className="flex flex-col items-center justify-center"
      >
        <MimeTypeFilter
          mimeTypes={mimeTypes}
          mediaTypes={mediaTypes}
          selectedMimeTypes={selectedMimeTypes}
          onChange={setSelectedMimeTypes}
        />

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="text-center">
              <span className="text-sm font-bold">
                Total Items: {inscriptionArray.length}
              </span>
            </div>
            <div className="flex justify-center items-center">
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <div className="flex justify-center items-center">
              <button
                className="btn btn-ghost font-urbanist text-lg font-semibold gap-4"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <input
                type="number"
                className="input input-bordered mx-2"
                value={currentPage}
                onChange={(e) => setCurrentPage(Math.min(Math.max(Number(e.target.value), 1), totalPages))}
                min="1"
                max={totalPages}
              />

              <button
                className="btn btn-ghost font-urbanist text-lg font-semibold gap-4"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Render Inscription Items */}
        <div id="inscriptionArray" className="flex flex-wrap gap-4 justify-center">
          {paginatedItems.map((item, index) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Extracted Reusable Media Card Component
const MediaCard = ({ item }) => {
  return (
    <div className="card max-w-2xl transition duration-300 hover:-translate-y-1 bg-base-200 rounded-box mt-4 gap-4">
      <div className="card-body shadow-inner">
        {/* Render content based on MIME type */}
        {item.contentType.startsWith("text/html") ? (
          <iframe
            src={item.isBRC420 ? item.brc420Url : `https://radinals.bitcoinaudio.co/content/${item.id}`}
            height="100%"
            width="100%"
            allowFullScreen
          />
        ) : item.contentType.startsWith("image/") ? (
          <img className="size-48" src={`https://radinals.bitcoinaudio.co/content/${item.id}`} alt="Inscription" />
        
        ) : null}

        {/* Metadata */}
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

        {/* Actions */}
        <div className="card-actions justify-center">
          <ul className="menu menu-horizontal bg-base-200 rounded-box mt-1">
            <li>
              <a
                className="tooltip"
                data-tip="Details"
                href={`https://radinals.bitcoinaudio.co/inscription/${item.id}`}
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
                href={`https://radinals.bitcoinaudio.co/content/${item.id}`}
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
};

export default MyMedia;
