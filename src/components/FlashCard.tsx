import { useRef } from 'preact/hooks';
import { motion, PanInfo } from 'framer-motion';
import { CardData } from '../types';
import { Signal, useSignal, useSignalEffect } from '@preact/signals';

interface FlashCardProps {
  $card: Signal<CardData>;
  $direction: Signal<number>
  onSwipe: (direction: number) => void;
  onHide: () => void;
}


const variants = {
  enter: (direction: number) => ({
    x: direction < 0 ? -300 : 300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};


export function FlashCard({ $card, $direction, onSwipe, onHide }: FlashCardProps) {
  const cardView = useSignal($card.value);

  const dalyedTask = useRef(0);
  useSignalEffect(() => {
    // Deleay change for animation
    const newVal = $card.value;
    clearTimeout(dalyedTask.current);
    dalyedTask.current = setTimeout(() => {
      cardView.value = newVal;
    }, 300);
  });

  const dragged = useRef(false);
  const handleDragStart = (_: PointerEvent) => {
    dragged.current = true;
  };

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    dragged.current = false;
    const SWIPE_THRESHOLD = 50;
    const delta = info.offset.x;

    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      onSwipe(delta > 0 ? -1 : 1);
    }
  };

  const isFlipped = useSignal(false);
  const flip = () => (isFlipped.value = !isFlipped.value);
  const handleClick = (_: MouseEvent) => {
    if (dragged.current) return;
    // // Don't flip the card when clicking the hide button
    // const target = e.target as HTMLElement;
    // if (target.closest('.hide-button')) return;
    flip();
  };

  return (
    <motion.div
      className="absolute w-full h-full"
      custom={$direction.value}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      <motion.div
        className="cursor-pointer preserve-3d w-full h-full"
        drag={'x'}
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
      >
        <motion.div
          animate={{ rotateY: isFlipped.value ? 180 : 0 }}
          transition={{
            duration: 0.6,
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          className="w-full h-full relative preserve-3d"
        >
          {/* Front of card */}
          <motion.div className="w-full h-full absolute backface-hidden bg-white rounded-xl shadow-xl p-6 flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-800">
                {cardView.value.front}
              </p>
              <p className="text-sm text-gray-500 mt-4">Original</p>
            </div>
          </motion.div>

          {/* Back of card */}
          <motion.div className="w-full h-full absolute backface-hidden bg-white rounded-xl p-6 flex flex-col items-center justify-center rotate-y-180">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-800">
                {cardView.value.back}
              </p>
              <p className="text-sm text-gray-500 mt-4">Translation</p>
            </div>
            <button
              className="hide-button absolute bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
              onClick={onHide}
            >
              Hide
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
