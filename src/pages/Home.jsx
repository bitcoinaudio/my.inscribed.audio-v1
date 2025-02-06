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
      className= "size-1/3"
      
    />
    <div className="text-center "> 
    <h1 className="font-urbanist text-3xl font-black uppercase md:text-5xl">
        Welcome to 
        </h1>
      <h1 className="font-urbanist text-3xl font-black uppercase md:text-5xl">
         My.Inscribed.Audio</h1>
        <h1 className="text-black/90 font-urbanist text-3xl font-black uppercase md:text-5xl"> tools to manage your onchain media</h1>
        <h2 className="text-black/90 font-urbanist text-3xl font-black uppercase md:text-4xl"> connect your wallet to get started</h2>
        <h2 className="text-black/90 font-urbanist text-3xl font-black uppercase md:text-lg"> Use on desktop for best experience</h2>
      
      </div>
    </div>
  </div>
  
 
      </motion.div>
    </motion.div>
  )
}

export default Home
