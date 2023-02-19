import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// faces: [{
//   onFlippingComplete: function
//   isImportantFace: bool
// }]

export function FlippingCard({ duration, faces, isActive, renderFace }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const N = faces.length;
  if (targetIndex < 0 || targetIndex >= N) {
    throw new Error("Invalid target index in FlippingCard");
  }

  useEffect(() => {
    setCurrentIndex(i => (i >= targetIndex ? i : (i + 1)));
  }, [targetIndex]);

  useEffect(() => {
    if (isActive === false)
      return;
    const handleKeyDown = event => {
      if (event.key === 'Enter') {
        const isImportant = faces.map(face => face.isImportantFace);

        if (targetIndex + 1 < N) {
          let nextTargetIndex = targetIndex + 1;
          while (nextTargetIndex + 1 < N && !isImportant[nextTargetIndex]) {
            nextTargetIndex += 1;
          }
          setTargetIndex(nextTargetIndex);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [targetIndex, isActive, N, faces]);

  const backFace = { rotateX: 180, position: 'absolute' };
  const frontFace = { rotateX: 0, position: 'relative' };

  return (
    <AnimatePresence>
      {
        faces.map((face, index) => {
          const onAnimationComplete = (style) => {
            if (currentIndex < targetIndex) {
              // here it might trigger multiple times?
              // TODO do it only when style is frontFace
              // console.log(currentIndex, style);
              setCurrentIndex(currentIndex + 1);
            } else {
              face.onFlippingComplete();
            }
          };
          return index !== currentIndex ? null : (
            <motion.div
              key={index}
              initial={index === 0 ? false : backFace}
              animate={frontFace}
              exit={backFace}
              transition={{ duration }}
              style={{
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
              }}
              onAnimationComplete={onAnimationComplete}
            >
              {renderFace(face, index)}
            </motion.div>
          );
        })
      }
    </AnimatePresence>
  );
}

// vim:ts=2:sts=2:sw=2
