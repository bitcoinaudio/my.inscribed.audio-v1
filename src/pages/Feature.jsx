import React from "react"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "../utils/motion"

 
const Feature = () => {
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
<div id="samplerr" className="hero flex justify-center shadow-lg shadow-black rounded-lg bg-black-800/80">
	<div className="hero-content flex-col lg:flex-row-reverse">
	<p className="text-3xl">
	Welcome to the future of music ownership, where legendary hip-hop meets Bitcoin innovation.

The Ides Of March isn’t just another music NFT—it’s a revolutionary approach to digital music collecting and creation on Bitcoin Ordinals.
		</p>
		<div className="text-center lg:text-start">
			<h1 className="font-urbanist text-lg font-black uppercase md:text-5xl">
				
					   <span className=" ">The Ides of March</span>				   
			</h1>
 
			<div className="flex justify-center">
 
			<iframe className="samplerr" src="https://radinals.bitcoinaudio.co/content/b1ade815da823de16f0dc26417c5bfb9caefc9005f0e9585b1f0072eb7e43605i0" title="ordinal"  allowFullScreen ></iframe>
			</div>
		</div>

		
		
	  </div>
	</div>	


      </motion.div>
      
    </motion.div>
  )
}

export default Feature
