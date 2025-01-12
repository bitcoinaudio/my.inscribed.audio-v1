import React from "react"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "../utils/motion"

const services = [
  {
    name: "Digital Marketing",
    icon: "../../images/icons/digitalmarketing.png",
    description:
      "Unlock the full potential of your online presence with our comprehensive digital marketing solutions. In today's hyper-connected world, standing out in the digital landscape is essential for success.",
  },
  {
    name: "Website Development",
    icon: "../../images/icons/webdevelopment.png",
    description:
      "Embark on a digital journey with a captivating online presence crafted by our expert website development team. In today's digital era, your website serves as the cornerstone of your brand.",
  },
  {
    name: "Social Media Management",
    icon: "../../images/icons/socialmedia.png",
    description:
      "Elevate your brand's online presence and engage with your audience like never before with our expert social media management services. In today's fast-paced digital landscape.",
  },
  {
    name: "App Development",
    icon: "../../images/icons/appdevelopment.png",
    description:
      "Empower your business and connect with your audience on-the-go with our custom app development services. In today's mobile-centric world, having a tailored mobile application is essential.",
  },
  {
    name: "Video Editing",
    icon: "../../images/icons/videoediting.png",
    description:
      "Transform your raw footage into captivating visual stories with our professional video editing services. In today's digital landscape, video content reigns supreme, captivating audiences.",
  },
  {
    name: "Consulting",
    icon: "../../images/icons/consulting.png",
    description:
      "Empower your business with expert guidance and strategic insights from our seasoned consulting team. In today's fast-paced and ever-changing business landscape, navigating challenges and seizing opportunities. ",
  },
]
const Services = () => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      id="services"
      className="mt-10 flex flex-col items-center justify-center md:mt-20">
      <motion.div
        variants={fadeIn("up", "tween", 0.2, 1)}
        className="flex flex-col items-center justify-center">
        <h1 className="font-urbanist text-center text-2xl font-semibold md:text-5xl">
          Our Services
        </h1>
        <span className="text-md font-urbanist mt-2 px-2 text-center md:mt-4 md:px-5 md:text-xl">
          Uncover new paths, explore opportunities and chart your success with us.
        </span>
      </motion.div>
      <motion.div
        variants={fadeIn("up", "tween", 0.2, 1)}
        className="container mt-10 grid gap-10 p-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((item, index) => (
          <div
            key={index}
            className="card max-w-2xl  shadow-sm transition duration-300 hover:-translate-y-1">
            <div className="card-body">
              <div className="h-16 w-16 rounded-full bg-gradient-to-t from-base-300/20 to-base-content/10">
                <img className="p-4" src={item.icon} />
              </div>
              <h2 className="font-urbanist card-title text-3xl font-black">{item.name}</h2>
              <p className="text-md font-urbanist font-medium opacity-60">{item.description}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default Services
