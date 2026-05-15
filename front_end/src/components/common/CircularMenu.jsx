import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../context/ThemeContext';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const CONSTANTS = {
  itemSize: 48,
  containerSize: 250,
  openStagger: 0.02,
  closeStagger: 0.07,
  // Angle span: π/2 radians = 90 degrees (only quarter circle)
  angleSpan: Math.PI / 2,
  // Start angle: π radians = 180 degrees (pointing left, going up)
  startAngle: Math.PI
};

const pointOnCircle = (i, n, r, cx = 0, cy = 0) => {
  // Spread items only across 90 degrees (angleSpan)
  // Starting from startAngle (180 degrees) going to 270 degrees
  const angleRange = CONSTANTS.angleSpan;
  const theta = CONSTANTS.startAngle + (angleRange * i) / Math.max(n - 1, 1);
  const x = cx + r * Math.cos(theta);
  const y = cy + r * Math.sin(theta);
  return { x, y };
};

const MenuItem = ({ icon, label, onClick, index, totalItems, isOpen, isDark }) => {
  const { x, y } = pointOnCircle(index, totalItems, CONSTANTS.containerSize / 2, 0, 0);
  const [hovering, setHovering] = useState(false);

  return (
    <div 
      className={`rounded-full flex items-center justify-center absolute cursor-pointer ${
        isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
      }`}
      style={{
        zIndex: isOpen ? 40 : -1,
        pointerEvents: isOpen ? 'auto' : 'none'
      }}
    >
      <motion.button
        animate={{
          x: isOpen ? x : 0,
          y: isOpen ? y : 0
        }}
        whileHover={{
          scale: 1.1,
          transition: {
            duration: 0.1,
            delay: 0
          }
        }}
        transition={{
          delay: isOpen ? index * CONSTANTS.openStagger : index * CONSTANTS.closeStagger,
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        style={{
          height: CONSTANTS.itemSize - 2,
          width: CONSTANTS.itemSize - 2
        }}
        className={`rounded-full flex items-center justify-center relative ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={onClick}
      >
        {icon}
        {hovering && (
          <p className={`text-xs absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {label}
          </p>
        )}
      </motion.button>
    </div>
  );
};

const MenuTrigger = ({
  setIsOpen,
  isOpen,
  itemsLength,
  closeAnimationCallback,
  openIcon,
  closeIcon,
  isDark
}) => {
  const animate = useAnimationControls();
  const shakeAnimation = useAnimationControls();

  const scaleTransition = Array.from({ length: itemsLength - 1 })
    .map((_, index) => index + 1)
    .reduce((acc, _, index) => {
      const increasedValue = index * 0.15;
      acc.push(1 + increasedValue);
      return acc;
    }, []);

  const closeAnimation = async () => {
    shakeAnimation.start({
      translateX: [0, 2, -2, 0, 2, -2, 0],
      transition: {
        duration: CONSTANTS.closeStagger,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop'
      }
    });
    for (let i = 0; i < scaleTransition.length; i++) {
      await animate.start({
        height: Math.min(
          CONSTANTS.itemSize * scaleTransition[i],
          CONSTANTS.itemSize + CONSTANTS.itemSize / 2
        ),
        width: Math.min(
          CONSTANTS.itemSize * scaleTransition[i],
          CONSTANTS.itemSize + CONSTANTS.itemSize / 2
        ),
        transition: {
          duration: CONSTANTS.closeStagger / 2,
          ease: 'linear'
        }
      });
      if (i !== scaleTransition.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, CONSTANTS.closeStagger * 1000));
      }
    }

    shakeAnimation.stop();
    shakeAnimation.start({
      translateX: 0,
      transition: {
        duration: 0
      }
    });

    animate.start({
      height: CONSTANTS.itemSize,
      width: CONSTANTS.itemSize,
      transition: {
        duration: 0.1,
        ease: 'backInOut'
      }
    });
  };

  const triggerStyles = `rounded-full flex items-center justify-center cursor-pointer outline-none ring-0 hover:brightness-125 transition-all duration-100 z-50 shadow-lg ${
    isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
  }`;

  return (
    <motion.div animate={shakeAnimation} className="z-50 relative">
      <motion.button
        animate={animate}
        style={{
          height: CONSTANTS.itemSize,
          width: CONSTANTS.itemSize
        }}
        className={triggerStyles}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
            closeAnimationCallback();
            closeAnimation();
          } else {
            setIsOpen(true);
          }
        }}
      >
        <AnimatePresence mode="popLayout">
          {isOpen ? (
            <motion.span
              key="menu-close"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.2 }}
            >
              {closeIcon}
            </motion.span>
          ) : (
            <motion.span
              key="menu-open"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.2 }}
            >
              {openIcon}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
};

export const CircularMenu = ({ items, onSelect }) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const animate = useAnimationControls();

  const openIcon = <Menu size={24} />;
  const closeIcon = <X size={24} />;

  const closeAnimationCallback = async () => {
    await animate.start({
      rotate: -360,
      filter: 'blur(1px)',
      transition: {
        duration: CONSTANTS.closeStagger * (items.length + 2),
        ease: 'linear'
      }
    });
    await animate.start({
      rotate: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0
      }
    });
  };

  return (
    <div className="relative w-fit">
      <div className="relative flex items-center justify-center place-self-center w-12 h-12">
        <MenuTrigger
          setIsOpen={setIsOpen}
          isOpen={isOpen}
          itemsLength={items.length}
          closeAnimationCallback={closeAnimationCallback}
          openIcon={openIcon}
          closeIcon={closeIcon}
          isDark={isDark}
        />
        <motion.div
          animate={animate}
          className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
        >
          {items.map((item, index) => {
            const IconComp = item.icon;
            return (
              <MenuItem
                key={`menu-item-${index}`}
                icon={IconComp ? <IconComp size={20} /> : '◉'}
                label={item.label}
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                  closeAnimationCallback();
                }}
                index={index}
                totalItems={items.length}
                isOpen={isOpen}
                isDark={isDark}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setIsOpen(false);
            closeAnimationCallback();
          }}
        />
      )}
    </div>
  );
};
