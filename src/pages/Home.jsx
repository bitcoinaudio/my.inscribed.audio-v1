import React from "react"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "../utils/motion"
import backgroundImage from '/images/ia-bg3.png'



const Home = () => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      id="home"
      className="hero py-10 flex justify-center">
      <motion.div
        variants={fadeIn("up", "tween", 0.2, 1)}
        className="hero-content flex-col lg:flex-row-reverse">
        
       <div id="home" className="hero py-10 flex justify-center shadow-lg shadow-black rounded-lg bg-black-800/80">
  <div className="hero-content flex-col lg:flex-row-reverse">
    <img
      src={backgroundImage}
      alt=""
      className= "size-1/2"
      
    />
    <div className="text-center lg:text-start"> 
            
      <h1 className="font-urbanist text-3xl font-black uppercase md:text-7xl">
        Welcome to My Inscribed Audio
        <span className="text-black/90"> tools to manage your onchain media</span>
      </h1>
      </div>
    </div>
  </div>
 
      </motion.div>
    </motion.div>
  )
}

export default Home
