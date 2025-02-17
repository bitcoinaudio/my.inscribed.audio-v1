import React from "react"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "../utils/motion"
import collections  from "../lib/collections/collections"
import ordImage from '/images/ordinals.svg';


 
const Collections = () => {
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

<div class="flex flex-wrap gap-4 justify-center">
    {collections.map((item, index) => (
      <div  
        class="card max-w-2xl  transition duration-300 hover:-translate-y-1 bg-base-200 rounded-box mt-4 gap-4"
      >
        <div class="card-body shadow-inner">
          
          <iframe src={item.ordinal} title={item.name}  height="100%" width="100%" allowFullScreen></iframe>
         

          <h2 class="font-urbanist card-title text-3xl font-black ">
            {item.name}
          </h2>
          <p class="text-md font-urbanist font-medium opacity-60">
            {item.description}
          </p> 

          <div  class="card-actions justify-center">
            <ul class="menu menu-horizontal bg-base-200 rounded-box mt-1">
              {/* <li>
                 <a class="tooltip" data-tip="Home">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
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
              </li> */}
              <li>
                <a class="tooltip" data-tip="Details" href={"https://radinals.bitcoinaudio.co/inscription/" + item.insID} target="_blank">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
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
                <a class="tooltip" data-tip="Ordinal" href={item.ordinal} target="_blank">
                  <img class="size-5" src={ordImage} alt="IOM" />
                </a>
              </li>
              {item.name === "The Ides of March" && (
                <li>
                <a class="tooltip" data-tip="Collect" href="https://gamma.io/ordinals/collections/ides-of-march" target="_blank">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" stroke="currentColor" stroke-width="2" class="size-5">
                    <path d="M3 3h18v4H3z"/>
                    <path d="M5 7v13h14V7"/>
                    <path d="M9 21V7"/>
                    <path d="M15 21V7"/>
                    <path d="M5 10h14"/>
                    <path d="M5 14h14"/>
                  </svg>
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
  )
}

export default Collections
