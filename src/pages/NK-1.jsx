import React from "react"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "../utils/motion"

 
const NK1 = () => {
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
 	<div className="hero-content flex-col lg:flex-row-reverse">
	
			<iframe className="nk-1" src="https://bitcoinaudio.github.io/satoshi-nk-1.github.io/page2.html" title="nk-1"  allowfullscreen ></iframe>

	  </div>
 

      </motion.div>
      
    </motion.div>
  )
}

export default NK1
