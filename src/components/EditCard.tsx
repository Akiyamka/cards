import { motion } from 'framer-motion';
import { CardData } from '../types';
import { useSignal } from '@preact/signals';

interface EditCardProps {
  onAdd: (card: CardData) => void;
}

export function EditCard({ onAdd }: EditCardProps) {
  const isFlipped = useSignal(false);
  const flip = () => (isFlipped.value = !isFlipped.value);

  const word = useSignal('');
  const translation = useSignal('');
  const add = () => {
    onAdd({
      front: word.value,
      back: translation.value,
    });
  };

  return (
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
          <input
            className="text-center text-2xl font-semibold text-gray-800 w-full"
            type="text"
            placeholder="Add new word"
            onChange={(e) => (word.value = e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-4">Original</p>
          <button
            className="hide-button absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
            onClick={flip}
          >
            Save
          </button>
        </div>
      </motion.div>

      {/* Back of card */}
      <motion.div className="w-full h-full absolute backface-hidden bg-white rounded-xl p-6 flex flex-col items-center justify-center rotate-y-180">
        <div className="text-center">
          <input
            className="text-center text-2xl font-semibold text-gray-800 w-full"
            type="text"
            placeholder="Add translation"
            onChange={(e) => (translation.value = e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-4">Translation</p>
        </div>
        <button
          className="hide-button absolute bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
          onClick={add}
        >
          Add
        </button>
      </motion.div>
    </motion.div>
  );
}
