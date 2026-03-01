import React from "react";
import { motion } from "framer-motion";
import heroImage from "/images/ia-bg3.png";
import headphones from "/images/headphones.png";
import woman from "/images/woman.png";
import beatblocks from "/images/beatblocks.png";

const LandingPage = () => {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 pb-10">
      {/* Hero Section */}
      <section className="hero mt-2 rounded-box border border-base-300 bg-base-200 shadow-xl shadow-black/20 transition-all">
        <div className="hero-content flex-col gap-8 lg:flex-row">
          <img
            src={heroImage}
            className="w-40 rounded-box border border-base-300 bg-base-100 p-2 md:w-56"
            alt="Hero Banner"
          />
          <div className="text-center">
            <motion.h1
              className="font-urbanist text-3xl font-black uppercase md:text-5xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              my.inscribed.audio
            </motion.h1>
            <p className="mt-3 text-lg font-semibold text-base-content/70 md:text-xl">
              Same BitcoinAudio world, a dedicated Ordinals gallery scene.
            </p>
          </div>
          <img
            src={heroImage}
            className="hidden w-40 rounded-box border border-base-300 bg-base-100 p-2 md:block md:w-56"
            alt="Hero Banner"
          />
        </div>
      </section>

      {/* Gallery Preview Section */}
      <section className="rounded-box border border-base-300 bg-base-200 px-6 py-14 shadow-xl shadow-black/20 transition-all">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-black">Featured Projects</h2>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="card rounded-box border border-base-300 bg-base-100 p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/50">
              <a className="tooltip" data-tip="Collect" href="https://gamma.io/ordinals/collections/ides-of-march" target="_blank" rel="noreferrer">
                <img src={headphones} alt="headphones" className="rounded-box" />
                </a>
              <div className="p-4">
                <h3 className="text-xl font-black">The Ides of March</h3>
                <p className="text-base-content/60">Unique Ordinals</p>
              </div>
            </div>

            <div className="card rounded-box border border-base-300 bg-base-100 p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/50">
              <a className="tooltip" data-tip="Collect" href="https://magiceden.us/ordinals/marketplace/beatblock-genesis" target="_blank" rel="noreferrer">
                <img src={beatblocks} alt="beatblocks" className="rounded-box" />
              </a>
              <div className="p-4">
                <h3 className="text-xl font-black">Beat Blocks</h3>
                <p className="text-base-content/60">Rare Digital Asset</p>
              </div>
            </div>

            <div className="card rounded-box border border-base-300 bg-base-100 p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/50">
              <a className="tooltip" data-tip="Collect" href="https://gamma.io/ordinals/collections/ides-of-march" target="_blank" rel="noreferrer">
                <img src={woman} alt="woman" className="rounded-box" />
              </a>
              <div className="p-4">
                <h3 className="text-xl font-black">The Ides of March</h3>
                <p className="text-base-content/60">Historic Bitcoin Record</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="rounded-box border border-base-300 bg-base-200 px-6 py-10 shadow-xl shadow-black/20 transition-all">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold font-black">Inscribed Audio</h2>
          <p className="mt-4 text-lg text-base-content/60">
            Built on Bitcoin, optimized for creativity.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature Card 1 */}
            <div className="card rounded-box border border-base-300 bg-base-100 p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/50">
              <h3 className="text-2xl font-black">Immutable Data</h3>
              <p className="mt-2 text-base-content/60">
                Permanently stored on Bitcoin for longevity and security.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="card rounded-box border border-base-300 bg-base-100 p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/50">
              <h3 className="text-2xl font-black">Ordinals</h3>
              <p className="mt-2 text-base-content/60">
              Support for all mime types.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="card grid grid-cols-1 justify-items-center rounded-box border border-base-300 bg-base-100 p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/50">
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
    </div>
  );
};

export default LandingPage;
