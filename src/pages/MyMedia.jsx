import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "../utils/motion";
import { htmlArray } from "../globalState";
import ordImage from '/images/ordinals.svg';
import iomImage from '/images/idesofmarch.png';

const MyMedia = () => {
  const [localHtmlArray, setLocalHtmlArray] = useState([...htmlArray]);

  useEffect(() => {
    setLocalHtmlArray([...htmlArray]); // Ensure a new reference is set
    console.log("htmlArray updated", htmlArray);
  }, [htmlArray]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      id="team"
      className="flex flex-col items-center justify-center"
    >
      <motion.div
        variants={fadeIn("up", "tween", 0.2, 1)}
        className="flex flex-col items-center justify-center"
      >
        <div id="htmlArray" className="flex flex-wrap gap-4 justify-center">
          {localHtmlArray.map((item, index) => (
            <div
              key={index}
              className="card max-w-2xl transition duration-300 hover:-translate-y-1 bg-base-200 rounded-box mt-4 gap-4"
            >
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
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MyMedia;
