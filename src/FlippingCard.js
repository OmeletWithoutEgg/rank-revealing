import React, { useState, useRef, useEffect } from 'react';

function FlippingCardFace({ children, duration, isVisible, onAnimationFinish }) {
  const child = React.Children.only(children)
  const ref = useRef(null);

  useEffect(() => {
    const current = ref.current;

    const handleTransitionStart = (event) => {
      // if (!isScrolledIntoView(current)) {
      //   current.scrollIntoView();
      // }
      // current.scrollIntoView({behavior: 'smooth', block: 'center'});
    };

    const handleTransitionEnd = (event) => {
      if (event.propertyName === 'transform') {
        // console.log('Transition has finished', children.props, isVisible)
        if (isVisible) {
          // A bit hacky that this function only executed once.
          onAnimationFinish()
        }
      }
    };

    if (current) {
      current.addEventListener('transitionstart', handleTransitionStart)
      current.addEventListener('transitionend', handleTransitionEnd)
    }

    return () => {
      if (current) {
        current.removeEventListener('transitionstart', handleTransitionStart)
        current.removeEventListener('transitionend', handleTransitionEnd)
      }
    };
  }, [isVisible, onAnimationFinish]);

  return <div
      ref={ref}
      style={{
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          transform: isVisible ? 'rotateX(0deg)' : 'rotateX(180deg)',
          transformStyle: 'preserve-3d',
          transition: `transform ${duration}s linear`,
          position: isVisible ? 'relative' : 'absolute',
          left: 0,
          top: 0,
      }}
    >
      {child}
    </div>
}

export function FlippingCard({ duration, targetIndex, children, onFlipComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const N = React.Children.count(children);
  // if (targetIndex !== null) {
    if (targetIndex < 0 || targetIndex >= N) {
      throw new Error("Invalid target index in FlippingCard");
    }
  // }

  const syncTargetIndex = () => {
    // if (targetIndex !== null) {
      setCurrentIndex(i => (i === targetIndex ? i : (i + 1) % N))
    // }
  }

  useEffect(syncTargetIndex, [targetIndex, N])

  const onAnimationFinish = () => {
    syncTargetIndex();
    onFlipComplete();
  };

  
  return (
    <div style={{ position: 'relative' }}>
      {
        React.Children.map(children, (child, index) =>
          <FlippingCardFace
            key={index}
            isVisible={index === currentIndex}
            duration={duration}
            onAnimationFinish={onAnimationFinish}
          >
            {child}
          </FlippingCardFace>
        )
      }
    </div>
  )
}

// vim:ts=2:sts=2:sw=2
