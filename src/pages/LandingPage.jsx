import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImage from "/images/ia-bg3.png"; // Replace with your hero image
import headphones from "/images/headphones.png";
import spartan from "/images/spartan.png";
import woman from "/images/woman.png";
import beatblocks from "/images/beatblocks.png";

const LandingPage = () => {
  // const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // useEffect(() => {
  //   const updateTheme = () => {
  //     setTheme(localStorage.getItem("theme") || "light");
  //   };

  //   window.addEventListener("storage", updateTheme);
  //   return () => window.removeEventListener("storage", updateTheme);
  // }, []);
  
  return (
    <div className="min-h-screen  transition-all flex flex-wrap gap-4 justify-center">
      {/* Hero Section */}
      <section className="hero shadow-lg shadow-black rounded-lg bg-black-800/80 mt-2 text-neutral-600 dark:text-neutral-400 dark:from-neutral-800 dark:to-neutral-900 transition-all">
        <div className="hero-content flex-col lg:flex lg:flex-row gap-8">
          <img
            src={heroImage}
            className="size-1/3"
            alt="Hero Banner"
          />
          <div>
            <motion.h1
              className="font-urbanist text-2xl font-black uppercase md:text-5xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              my.inscribed.audio
            </motion.h1>
            <p className="font-urbanist text-3xl text-center font-black   md:text-lg">
              Enjoy your digital assets in an enhanced way!
            </p>
            {/* <Link to="/mymedia">
              <button className="btn py-2 text-lg">Explore Now</button>
            </Link> */}
          </div>
          <img
            src={heroImage}
            className="size-1/3 "
            alt="Hero Banner"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 shadow-lg shadow-black rounded-lg bg-black-800/80 transition-all ">
        <div className="container  mx-auto text-center">
          <h2 className="text-4xl font-bold font-black">Inscribed Audio</h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-4">
            Built on Bitcoin, optimized for creativity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Feature Card 1 */}
            <div className="card max-w-2xl  transition duration-300 hover:-translate-y-1 bg-base-200 rounded-box p-6">
              <h3 className="text-2xl font-bold font-black  ">Immutable Data</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                Permanently stored on Bitcoin for longevity and security.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="card max-w-2xl  transition duration-300 hover:-translate-y-1 bg-base-200 rounded-box p-6">
              <h3 className="text-2xl font-bold font-black ">Ordinals</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Support for all mime types.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="card max-w-2xl  transition duration-300 hover:-translate-y-1 bg-base-200 rounded-box p-6 grid grid-cols-1 justify-items-center">
              <h3 className="text-2xl font-bold font-black">Decentralized & Open</h3>
              <a href="https://github.com/bitcoinaudio/my.inscribed.audio-v1" target="_blank" rel="noreferrer">Don't trust? Verify.</a>
              <a href="https://github.com/bitcoinaudio/my.inscribed.audio-v1" target="_blank" rel="noreferrer">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="fill-current">
                  <path
                    d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.744.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.775.418-1.305.76-1.605-2.665-.305-5.466-1.335-5.466-5.93 0-1.31.47-2.38 1.235-3.22-.125-.303-.535-1.523.115-3.176 0 0 1.005-.322 3.3 1.23.955-.265 1.98-.398 3-.403 1.02.005 2.045.138 3 .403 2.28-1.552 3.285-1.23 3.285-1.23.655 1.653.245 2.873.12 3.176.77.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.62-5.475 5.92.43.37.81 1.096.81 2.21 0 1.595-.015 2.88-.015 3.27 0 .32.21.694.825.577 4.765-1.587 8.2-6.084 8.2-11.387 0-6.627-5.373-12-12-12z"></path>
                </svg>
              </a>

             
             </div>
          </div>
        </div>
      </section>

      {/* Gallery Preview Section */}
      <section className="py-16 shadow-lg shadow-black rounded-lg bg-black-800/80 transition-all">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold font-black">Featured Projects</h2>
          {/* <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-4">
            Discover the latest digital creations on Bitcoin.
          </p> */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="card max-w-2xl  transition duration-300 hover:-translate-y-1 bg-base-200 rounded-box p-6">
            <a class="tooltip" data-tip="Collect" href="https://gamma.io/ordinals/collections/ides-of-march" target="_blank">
            <img src={headphones} alt="headphones" className="rounded-t-lg" />
                </a>
              <div className="p-4">
                <h3 className="text-xl font-bold font-black">The Ides of March</h3>
                <p className="text-neutral-600 dark:text-neutral-400">Unique Ordinals</p>
              </div>
            </div>

            <div className="card max-w-2xl  transition duration-300 hover:-translate-y-1 bg-base-200 rounded-box p-6">
            <a class="tooltip" data-tip="Collect" href="https://magiceden.us/ordinals/marketplace/beatblock-genesis" target="_blank">
            <img src={beatblocks} alt="beatblocks" className="rounded-t-lg" />
                </a>              <div className="p-4">
                <h3 className="text-xl font-bold font-black">Beat Blocks</h3>
                <p className="text-neutral-600 dark:text-neutral-400">Rare Digital Asset</p>
              </div>
            </div>

            <div className="card max-w-2xl  transition duration-300 hover:-translate-y-1 bg-base-200 rounded-box p-6">
            <a class="tooltip" data-tip="Collect" href="https://gamma.io/ordinals/collections/ides-of-march" target="_blank">
            <img src={woman} alt="woman" className="rounded-t-lg" />
                </a>              <div className="p-4">
                <h3 className="text-xl font-bold font-black">The Ides of March</h3>
                <p className="text-neutral-600 dark:text-neutral-400">Historic Bitcoin Record</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {/* <section className=" text-white py-16 transition-all">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold">Ready to Explore?</h2>
          <p className="text-lg mt-4">
            Start browsing and discovering digital inscriptions today.
          </p>
          <Link to="/mymedia">
            <button className="btn  text-lg mt-6">Get Started</button>
          </Link>
        </div>
      </section> */}

      
    </div>
  );
};

export default LandingPage;
