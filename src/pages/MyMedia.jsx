import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "../utils/motion";
import { inscriptionArray } from "../globalState";
import ordImage from "/images/ordinals.svg";
import iomImage from "/images/idesofmarch.png";
import MimeTypeFilter from "../components/MimeTypeFilter"; // Import the MimeTypeFilter component


const mimeTypes = [
  "audio/ogg",
  "audio/mpeg",
  "application/json",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
  "text/css",
  "text/html",
  "text/javascript",
  "text/plain",
  "video/mp4",
  // Add more MIME types as required
];

const MyMedia = () => {
  const [localInscriptionArray, setLocalHtmlArray] = useState([...inscriptionArray]);
  const [selectedMimeTypes, setSelectedMimeTypes] = useState([]); // New state for MIME type filtering

  useEffect(() => {
    setLocalHtmlArray([...inscriptionArray]); // Ensure a new reference is set
    console.log("inscriptionArray updated", inscriptionArray);
  }, [inscriptionArray]);

  useEffect(() => {
    // Apply the filtering logic based on selected MIME types
    if (selectedMimeTypes.length > 0) {
      setLocalHtmlArray((prevArray) =>
        prevArray.filter((item) =>
          selectedMimeTypes.includes(item.contentType)
        )
      );
    } else {
      // If no MIME types are selected, reset to original inscriptionArray
      setLocalHtmlArray([...inscriptionArray]);
    }
  }, [selectedMimeTypes, inscriptionArray]); // Adding inscriptionArray to dependencies ensures it updates when the global state changes.

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
        {/* Add MimeTypeFilter Component here */}
        <MimeTypeFilter
          mimeTypes={mimeTypes}
          selectedMimeTypes={selectedMimeTypes}
          onChange={setSelectedMimeTypes} // Set selected MIME types when changed
        />

        <div id="inscriptionArray" className="flex flex-wrap  gap-2 justify-center">
          {localInscriptionArray.map((item, index) => (
            <div key={index} className="card max-w-2xl transition duration-300 hover:-translate-y-1 bg-base-200 rounded-box mt-4 gap-4">

              {item.contentType.startsWith("text/html") ? (
                <div className="card-body shadow-inner">
                  <iframe
                    key={item.id}
                    src={item.isBRC420 ? item.brc420Url : `https://ordinals.com/content/${item.id}`}
                    height="100%"
                    width="100%"
                    allowFullScreen
                  />
                  <h2 className="font-urbanist card-title text-3xl font-black"></h2>
                  <p className="text-md font-urbanist font-medium opacity-60">
                    {item.isBRC420 ? "BRC420" : "Ordinal"}
                  </p>
                  <div className="card-actions justify-center">
                    <ul className="menu menu-horizontal bg-base-200 rounded-box mt-1">
                      <li>
                        <a
                          className="tooltip"
                          data-tip="Details"
                          href={`https://ordinals.com/inscription/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </a>
                      </li>
                      <li>
                        <a
                          className="tooltip"
                          data-tip="Ordinal"
                          href={`https://ordinals.com/content/${item.id}`}
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
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="card-body shadow-inner">
                  {item.contentType.startsWith("text") && (
                    <iframe
                    key={item.id}
                    src={item.isBRC420 ? item.brc420Url : `https://ordinals.com/content/${item.id}`}
                    height="100%"
                    width="100%"
                    allowFullScreen
                  />
                  )}

                  {item.contentType.startsWith("audio") && (
                    <audio controls>
                      <source src={`https://ordinals.com/content/${item.id}`} type={item.contentType} />  
                    </audio>
                  )}

                  {item.contentType.startsWith("image") && (
                    <div id={item.id} className="card-body shadow-inner">
                      <img src={`https://ordinals.com/content/${item.id}`} alt="Inscription" />
                    </div>
                  )}



                  <p className="text-md font-urbanist font-medium opacity-60">
                    {item.isBRC420 ? "BRC420" : "Ordinal"}
                  </p>
                  <div className="card-actions justify-center">
                    <ul className="menu menu-horizontal bg-base-200 rounded-box mt-1">
                      <li>
                        <a
                          className="tooltip"
                          data-tip="Details"
                          href={`https://ordinals.com/inscription/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </a>
                      </li>
                      <li>
                        <a
                          className="tooltip"
                          data-tip="Ordinal"
                          href={`https://ordinals.com/content/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img id="img" className="size-5" src={ordImage} alt="Ordinal" />
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
                            <img id="image" className="size-10" src={iomImage} alt="IOM" />
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>


      </motion.div>
    </motion.div>
  );
};

export default MyMedia;
