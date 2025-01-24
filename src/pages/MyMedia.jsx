import React from "react"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "../utils/motion"
import IOM from '../lib/collections/idesofmarch.json'
import { htmlArray } from "../globalState";
import ordImage from '/images/ordinals.svg';
import { useWallet } from "../context/WalletContext";

 
const MyMedia = () => {
  const { isWalletConnected } = useWallet();
   
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      id="team"
      className="flex flex-col items-center justify-center">
      <motion.div
        variants={fadeIn("up", "tween", 0.2, 1)}
        className="flex flex-col items-center justify-center">

<div className="flex flex-wrap gap-4 justify-center">
    {htmlArray.map((item, index) => (
      <div  
        className="card max-w-2xl  transition duration-300 hover:-translate-y-1 bg-base-200 rounded-box mt-4 gap-4"
      >
        <div className="card-body shadow-inner">
          
          <iframe src={"https://ordinals.com/content/" + item.id} title="IOM"  height="100%" width="100%" allowfullscreen></iframe>
         

          <h2 className="font-urbanist card-title text-3xl font-black ">
            
          </h2>
          <p className="text-md font-urbanist font-medium opacity-60">
            
          </p> 

          <div  className="card-actions justify-center">
            <ul className="menu menu-horizontal bg-base-200 rounded-box mt-1">
              <li>
                 <a className="tooltip" data-tip="Home">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </a>
              </li>
              <li>
                <a className="tooltip" data-tip="Details" href={"https://ordinals.com/inscription/" + item.id} target="_blank">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </a>
              </li>
              <li>
                <a className="tooltip" data-tip="Ordinal" href={"https://ordinals.com/content/" + item.id} target="_blank">
                  <img className="size-5" src={ordImage} alt="IOM" />
                </a>
              </li>
         
            </ul>
            </div>
        </div>
      </div>
      
    ))}
    
  </div>


      </motion.div>
      
    </motion.div>
  )

}

export default MyMedia