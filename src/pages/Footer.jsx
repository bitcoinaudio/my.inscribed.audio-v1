import React from "react";
import iaLogo from '/images/ia-bg3.png';

const FooterPage = () => {
  return (
<div className=" grid grid-col-2 grid-row-1 wrap justify-center gap-10 xl:gap-16 py-4">
        
<a href="https://github.com/bitcoinaudio/my.inscribed.audio-v1" className="flex justify-center gap-4">
<img className="w-12 " src="/images/logo/github.png" alt="gitgub" />
</a>
{/* <a href="https://x.com/InscribedAudio" className="flex justify-center gap-4"> 
<img src={iaLogo} alt="inscribed audio" className="w-12 h-12" />
</a> */}

<p className="text-center text-sm text-black/70">© 2025 Inscribed Audio</p>
       
</div>

  );
};

export default FooterPage;
