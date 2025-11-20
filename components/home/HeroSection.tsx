// components/home/HeroSection.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

type HeroImage = {
  src: string;
  alt: string;
};

const heroImages: HeroImage[] = [
  {
    src: 'https://res.cloudinary.com/dtshhvhyf/image/upload/v1763490954/Y2K_Gorpcore_Pant_Sets_Women_Streetwear_Vintage_90s_Two_Piece_Set_Oversized_Tracksuit_Wide_Leg_Track_Pants_Hip_Hop_Jacket_-_Suit___M_foedtc.jpg',
    alt: 'Monochrome veil outfit shot 1',
  },
  {
    src: 'https://res.cloudinary.com/dtshhvhyf/image/upload/v1763490954/Reserved_Fall_2023_Denim__A_Modern_Fit_The_Fashionisto_hnc9up.jpg',
    alt: 'Monochrome veil outfit shot 2',
  },
  {
    src: 'https://res.cloudinary.com/dtshhvhyf/image/upload/v1763490954/%D0%9C%D0%BE%D0%B4%D0%B5%D0%BB%D1%8C_uvjsve.jpg',
    alt: 'Monochrome veil outfit shot 3',
  },
];

// Change slide every 5 seconds (5000ms)
const SLIDE_INTERVAL = 5000;

const HeroSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1); // for slide direction

  // Auto-rotate images
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % heroImages.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const currentImage = heroImages[activeIndex];

  return (
    <section className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 lg:flex-row lg:items-center lg:py-16">
      {/* Left: Text */}
      <div className="flex-1 space-y-6">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Veilnwear
        </p>
        <h1 className="text-3xl leading-tight text-neutral-50 sm:text-4xl md:text-5xl">
          Minimal, monochrome, <span className="font-semibold">made for you.</span>
        </h1>
        <p className="max-w-md text-sm text-neutral-400">
          Veils, abayas and essentials crafted with a clean black &amp; white
          aesthetic. Discover pieces designed to blend subtlety with statement.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/shop"
            className="rounded-full border border-neutral-100 bg-neutral-50 px-6 py-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-950 hover:bg-white"
          >
            Shop Collection
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-neutral-700 px-6 py-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-200 hover:border-neutral-400"
          >
            About the Brand
          </Link>
        </div>

        <p className="text-xs text-neutral-500">
          Free shipping on orders over ₹999 • COD available in select cities
        </p>
      </div>

      {/* Right: Image slider with framer-motion + hover scale */}
      <div className="relative flex-1">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900"
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentImage.src}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              variants={{
                enter: (dir: 1 | -1) => ({
                  opacity: 0,
                  x: dir * 40,
                  scale: 1.02,
                }),
                center: {
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: {
                    duration: 0.6,
                    ease: 'easeOut',
                  },
                },
                exit: (dir: 1 | -1) => ({
                  opacity: 0,
                  x: -dir * 40,
                  scale: 0.98,
                  transition: {
                    duration: 0.5,
                    ease: 'easeIn',
                  },
                }),
              }}
              className="absolute inset-0"
            >
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Dots / indicators */}
        {heroImages.length > 1 && (
          <div className="mt-3 flex justify-center gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 w-2 rounded-full transition ${
                  index === activeIndex
                    ? 'bg-neutral-50'
                    : 'bg-neutral-700 hover:bg-neutral-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;