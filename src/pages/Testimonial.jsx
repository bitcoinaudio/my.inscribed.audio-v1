import React from "react"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "../utils/motion"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/pagination"
import { Navigation, Autoplay, Pagination, Mousewheel, Keyboard } from "swiper/modules"
const testimonials = [
  {
    name: "Peter",
    position: "Lead Developer",
    quote:
      "I really like this marketing agency. They are very professional and know how to get the job done. I would recommend them to anyone.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "David",
    position: "Marketing Manager",
    quote:
      "Wonderful team, great service and always available to answer any queries. I always recommend them to my friends.",
    image:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Marc",
    position: "Human Resources",
    quote: "The best way to market your business. Impressive results.",
    image:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Lisa",
    position: "Accounting Manager",
    quote:
      "First I was not sure about them but now I am a fan. My website is ranking on top of google.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
]
const Testimonial = () => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      id="testimonial"
      className="my-20 flex flex-col items-center justify-center md:my-32">
      <motion.div
        variants={fadeIn("up", "tween", 0.2, 1)}
        className="flex flex-col items-center justify-center">
        <h1 className="text-center font-urbanist text-2xl font-semibold md:text-5xl">
          Testimonials
        </h1>
        <span className="text-md mt-2 px-2 font-urbanist md:mt-4 md:px-5 md:text-xl">
          What Our Clients Says About Us
        </span>
      </motion.div>

      <motion.div variants={fadeIn("up", "tween", 0.2, 1)} className="max-w-7xl py-10">
        <Swiper
          cssMode={true}
          navigation={false}
          pagination={{ clickable: true }}
          mousewheel={true}
          keyboard={true}
          modules={[Navigation, Autoplay, Pagination, Mousewheel, Keyboard]}
          className="container mx-4 h-96 rounded-xl border border-base-content/10 max-sm:max-w-sm">
          {testimonials.map((item, index) => (
            <SwiperSlide className="h-full" key={index}>
              <div className="flex h-full items-center justify-center">
                <figure className="mx-10 mt-10">
                  <blockquote className="text-center font-urbanist font-bold leading-8 text-base-content lg:text-3xl">
                    <p>“{item.quote}”</p>
                  </blockquote>
                  <div className="mt-10 flex flex-col items-center">
                    <img
                      className="mx-auto h-14 w-14 rounded-full"
                      src={item.image}
                      alt={item.name}
                    />
                    <div className="mt-4 flex justify-center gap-2 lg:tracking-widest">
                      <div>{item.name}</div>
                      <div className="text-base-content/50">{item.position}</div>
                    </div>
                  </div>
                </figure>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </motion.div>
  )
}

export default Testimonial
