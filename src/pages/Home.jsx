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
      className="hero py-10">
      <motion.div
        variants={fadeIn("up", "tween", 0.2, 1)}
        className="hero-content w-full">
        <div id="home" className="hero w-full rounded-box border border-base-300 bg-base-200 py-10 shadow-xl shadow-black/20">
          <div className="hero-content flex-col gap-8 lg:flex-row-reverse">
            <img
              src={backgroundImage}
              alt="inscribed audio"
              className="w-44 rounded-box border border-base-300 bg-base-100 p-2 md:w-64"
            />
            <div className="text-center">
              <h1 className="font-urbanist text-3xl font-black uppercase md:text-5xl">Welcome to</h1>
              <h1 className="font-urbanist text-3xl font-black uppercase text-primary md:text-5xl">My.Inscribed.Audio</h1>
              <h2 className="mt-3 text-xl font-bold uppercase text-base-content md:text-2xl">Tools to manage your onchain media</h2>
              <p className="mt-3 text-base font-semibold uppercase text-base-content/60">Connect your wallet to get started · Desktop recommended</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Home
