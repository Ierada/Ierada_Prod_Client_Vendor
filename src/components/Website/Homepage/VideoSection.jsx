import React, { useRef, useState, useEffect } from "react";
import { FaRegCirclePlay, FaRegCirclePause } from "react-icons/fa6";

const VideoSection = ({ data }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [lastMouseMove, setLastMouseMove] = useState(Date.now());

  const videoData = data?.items?.[0]; // Ensure safe access to video data

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      setLastMouseMove(Date.now());
    };

    const interval = setInterval(() => {
      if (Date.now() - lastMouseMove > 3000) {
        setShowControls(false);
      }
    }, 500);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleMouseMove); // Ensure touch devices show controls

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleMouseMove);
      clearInterval(interval);
    };
  }, [lastMouseMove]);

  return (
    <section className='relative w-full h-[80vh] sm:h-[90vh] flex justify-center items-center overflow-hidden'>
      {videoData?.file_url ? (
        <>
          {/* Video Background */}
          <video
            ref={videoRef}
            className='absolute top-0 left-0 w-full h-full object-cover'
            src={videoData.file_url}
            loop
            playsInline
          />
          {/* Overlay */}
          <div className='absolute inset-0 bg-black bg-opacity-30'></div>

          {/* Video Content */}
          <div className='relative z-10 text-white text-center px-4 max-w-[90%] sm:max-w-[80%]'>
            {showControls && (
              <>
                <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold'>
                  {videoData.title}
                </h1>
                <p className='text-lg sm:text-xl md:text-2xl mt-2'>
                  {videoData.subtitle}
                </p>

                {/* Buttons */}
                <div className='mt-6 flex flex-col sm:flex-row items-center gap-4'>
                  <button
                    onClick={handlePlayPause}
                    className='text-white text-4xl sm:text-5xl bg-black bg-opacity-50 rounded-full p-4 flex items-center justify-center hover:bg-opacity-70 transition'
                    aria-label={isPlaying ? "Pause Video" : "Play Video"}
                  >
                    {isPlaying ? <FaRegCirclePause /> : <FaRegCirclePlay />}
                  </button>

                  {videoData.link && (
                    <a
                      href={videoData.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='px-5 py-3 text-base sm:text-lg bg-white text-black font-semibold rounded-lg shadow hover:bg-gray-200 transition'
                    >
                      Watch Now
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <div className='text-white text-center'>
          <p className='text-xl'>No video available</p>
        </div>
      )}
    </section>
  );
};

export default VideoSection;
