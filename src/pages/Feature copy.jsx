import React from "react"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "../utils/motion"

 
const Team = () => {
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
			Introducing the Samplerr, a groundbreaking tool that allows you to sample and create music on Bitcoin Ordinals.	
      New features coming soon!
		</p>
		<div className="text-center lg:text-start">
			<h1 className="font-urbanist text-lg font-black uppercase md:text-5xl">
				
					   <span className="text-black/70">The Samplerr</span>				   
			</h1>
			<p className="text-xl text-center">built by <a href="https://bitcoinaudio.co" target="_blank">Bitcoin Audio</a></p>

			<div className="flex justify-center">
 
			<iframe className="samplerr" src="https://radinals.bitcoinaudio.co/content/b1ade815da823de16f0dc26417c5bfb9caefc9005f0e9585b1f0072eb7e43605i0" title="ordinal"  allowfullscreen ></iframe>
			</div>
		</div>

		
		
	  </div>
	</div>	


      </motion.div>
      
    </motion.div>
  )
}

export default Team
