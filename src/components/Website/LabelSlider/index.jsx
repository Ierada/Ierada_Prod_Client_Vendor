import React from 'react';
import label_1 from '/assets/logo/label_1.png';
import label_2 from '/assets/logo/label_2.png';
import label_3 from '/assets/logo/label_3.png';
import label_4 from '/assets/logo/label_4.png';
import label_5 from '/assets/logo/label_5.png';
import label_6 from '/assets/logo/label_6.png';
import label_7 from '/assets/logo/label_7.png';
import label_8 from '/assets/logo/label_8.png';
import label_9 from '/assets/logo/label_9.png';
import label_10 from '/assets/logo/label_10.png';
import left_decor from '/assets/heading_decoration/heading_decoration_left.svg'
import right_decor from '/assets/heading_decoration/heading_decoration_right.svg'

const logos1 = [
  { name: 'Logo 1', url: label_1 },
  { name: 'Logo 2', url: label_2 },
  { name: 'Logo 3', url: label_3 },
  { name: 'Logo 4', url: label_4 },
  { name: 'Logo 5', url: label_5 },
  { name: 'Logo 6', url: label_6 },
  { name: 'Logo 7', url: label_7 },
  { name: 'Logo 8', url: label_8 },
  { name: 'Logo 9', url: label_9 },
  { name: 'Logo 10', url: label_10 },
];

const LogoSection = () => {
  const speed = 70;
  const duration = Math.ceil((logos1.length * 250) / speed);
  
  return (
    <div className="w-full overflow-hidden">
      <style jsx global>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-250px * ${logos1.length}));
          }
        }

        .slider {
          animation: slide ${duration}s linear infinite;
        }

        .slider:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .slider {
            animation: none;
          }
        }
      `}</style>

      <div className="relative flex items-center overflow-hidden py-5">
        <div className="slider flex animate-slide">
          {/* First set of logos */}
          {logos1?.map((logo, idx) => (
            <div
              key={`logo-${idx}`}
              className="flex min-w-[100px] lg:min-w-[150px] items-center justify-center px-4"
            >
              <img
                src={logo.url}
                alt={logo.name}
                className="h-8 w-auto object-contain transition-transform duration-300 hover:scale-110 md:h-10 lg:h-12"
                loading="lazy"
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {logos1?.map((logo, idx) => (
            <div
              key={`logo-dup-${idx}`}
              className="flex min-w-[100px] lg:min-w-[150px] items-center justify-center px-4"
            >
              <img
                src={logo.url}
                alt={logo.name}
                className="h-8 w-auto object-contain transition-transform duration-300 hover:scale-110 md:h-10 lg:h-12"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LabelSlider = () => {
  return (
    <section className="px-4 md:px-8 lg:px-16">
        <div className="w-full justify-evenly items-center flex py-8">
          <img src={left_decor} alt="" />
            <h2 className="text-4xl font-italiana text-nowrap">
                <span>Brands We Love</span>
            </h2>
            <img src={right_decor} alt="" />
        </div>
        <LogoSection />
    </section>
  );
};

export default LabelSlider;