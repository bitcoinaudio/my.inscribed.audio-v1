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
  "image/png",
  "application/json",
  "image/gif",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
  "model/gltf-binary",
  "text/css",
  "text/html",
  "text/javascript",
  "text/plain",
  "video/mp4",
  // Add more MIME types as required
];

const ITEMS_PER_PAGE = 10; // Adjust this number to change how many items per page

const MyMedia = () => {
  const [localInscriptionArray, setLocalHtmlArray] = useState([...inscriptionArray]);
  const [selectedMimeTypes, setSelectedMimeTypes] = useState([]); // New state for MIME type filtering
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [paginatedItems, setPaginatedItems] = useState([]);

  useEffect(() => {
    setLocalHtmlArray([...inscriptionArray]); // Ensure a new reference is set
    setPaginatedItems([...localInscriptionArray])
    console.log("inscriptionArray updated", inscriptionArray);
  }, [inscriptionArray]);

  useEffect(() => {
    // Apply the filtering logic based on selected MIME types
    let filteredArray = [...inscriptionArray];
    if (selectedMimeTypes.length > 0) {
      filteredArray = filteredArray.filter((item) =>
        selectedMimeTypes.includes(item.contentType)
      );
    }
    // Paginate the filtered array
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredArray.slice(indexOfFirstItem, indexOfLastItem);
    setPaginatedItems(currentItems);
  }, [selectedMimeTypes, currentPage, inscriptionArray]); // Re-run on filtering or page change

  // Change page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Calculate total pages
  const totalPages = Math.ceil(localInscriptionArray.length / ITEMS_PER_PAGE);

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
          selectedMimeTypes={selectedMimeTypes}
          onChange={setSelectedMimeTypes} // Set selected MIME types when changed
        />

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="text-center">
              <span className="text-sm font-bold">Total Items: {localInscriptionArray.length}</span>
            </div>
            <div className="flex justify-center items-center">
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <div className="flex justify-center items-center">
              <button
                className="btn btn-ghost font-urbanist text-lg font-semibold gap-4"
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <input
                type="number"
                className="input input-bordered mx-2"
                value={currentPage}
                onChange={(e) => handlePageChange(Math.min(Math.max(Number(e.target.value), 1), totalPages))}
                min="1"
                max={totalPages}
              />
              <button
                className="btn btn-ghost font-urbanist text-lg font-semibold gap-4"
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div id="inscriptionArray" className="flex flex-wrap gap-4 justify-center">
          {paginatedItems.map((item, index) => (
            <div key={index} className="card max-w-2xl transition duration-300 hover:-translate-y-1 bg-base-200 rounded-box mt-4 gap-4">

              {item.contentType.startsWith("text/html") ? (
                <div key={index} className="card-body shadow-inner">
                  <iframe
                    key={item.id}
                    src={item.isBRC420 ? item.brc420Url : `https://radinals.bitcoinaudio.co/content/${item.id}`}
                    height="100%"
                    width="100%"
                    allowFullScreen
                  />
                  <h2 className="font-urbanist card-title text-3xl font-black"></h2>
                  <p className="text-md font-urbanist font-medium opacity-60">
                  {item.isEnhanced ? " Enhanced " : " Basic "}
                  {item.isBRC420 ? " BRC420 " : " Ordinal "}
                    <hr />
                  {item.attributes && (
                    <div>
                      <h3 className="font-urbanist text-xl font-bold">Attributes:</h3>
                      <ul className="list-disc list-inside">
                        {Object.entries(item.attributes[0]).map(([key, value]) => (
                          <li key={key} className="text-md font-urbanist font-medium opacity-60">
                            {key}: {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  </p>

                  <div key={index} className="card-actions justify-center">
                    <ul className="menu menu-horizontal bg-base-200 rounded-box mt-1">
                      <li>
                        <a
                          className="tooltip"
                          data-tip="Details"
                          href={`https://radinals.bitcoinaudio.co/inscription/${item.id}`}
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
                    </ul>
                  </div>
                </div>
              ) : (
                <div key={item.id} className="card-body shadow-inner">
                  {item.contentType.startsWith("image/") && (
                    <div className="card-body shadow-inner">
                      <img className="size-48" src={`https://radinals.bitcoinaudio.co/content/${item.id}`} alt="Inscription" />
                    </div>
                  )}
                  
                  <div key={item.id} className="card-actions justify-center">
                  <p className="text-md font-urbanist font-medium opacity-60">
                  {item.isEnhanced ? " Enhanced " : " Basic "}
                  {item.isBRC420 ? " BRC420 " : " Ordinal "}
                    <hr />
                    {item.attributes && (
                    <div>
                      <h3 className="font-urbanist text-xl font-bold">Attributes:</h3>
                      <ul className="list-disc list-inside">
                        {/* {Object.entries(item.attributes).map(([key, value]) => (
                          <li key={key} className="text-md font-urbanist font-medium opacity-60">
                            {key}: {value}
                          </li>
                        ))} */}
                      </ul>
                    </div>
                  )}
                  </p>
                    <ul className="menu menu-horizontal bg-base-200 rounded-box mt-1">
                      <li>
                        <a
                          className="tooltip"
                          data-tip="Details"
                          href={`https://radinals.bitcoinaudio.co/inscription/${item.id}`}
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
                          href={`https://radinals.bitcoinaudio.co/content/${item.id}`}
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
