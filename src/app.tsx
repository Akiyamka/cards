import { useRef } from 'preact/hooks';
import { computed, effect, Signal, signal, useSignal } from '@preact/signals';
import { FlashCard } from './components/FlashCard';
import { CardData } from './types';
import { EditCard } from './components/EditCard';
import { AnimatePresence } from 'framer-motion';

/**
 * TODO:
 * - Add onSave
 * - Add edit mode
 */
const $cards = (() => {
  const cards: Signal<CardData[]> = signal([]);
  const words = localStorage.getItem('words');
  if (words) {
    cards.value = JSON.parse(words);
  }
  effect(() => {
    localStorage.setItem('words', JSON.stringify(cards.value));
  });

  const removed: Signal<CardData[]> = signal([]);
  const removedWords = localStorage.getItem('removedWords');
  if (removedWords) {
    removed.value = JSON.parse(removedWords);
  }
  effect(() => {
    localStorage.setItem('removedWords', JSON.stringify(removed.value));
  });

  return Object.assign(cards, {
    remove: (card: CardData) => {
      cards.value = cards.value.filter((c) => c !== card);
      removed.value = [...removed.value, card];
    },
    add: (card: CardData) => {
      const crd = cards.value;
      if (crd.some((c) => c.front === card.front)) {
        alert(`Card with "${card.front}" word already exist!`);
      } else {
        cards.value = [...cards.value, card];
      }
    },
  });
})();

const $currentCard = (() => {
  const currentIndex = signal(0);
  const currentCard = computed(() => $cards.value.at(currentIndex.value));
  const canSwitch = () => $cards.value.length > 0;

  return Object.assign(currentCard, {
    next: () => {
      const cards = $cards.value;
      if (!canSwitch()) return false;
      if (cards[currentIndex.value + 1]) {
        currentIndex.value++;
      } else {
        currentIndex.value = 0;
      }
      return true;
    },
    prev: () => {
      const cards = $cards.value;
      if (!canSwitch()) return false;
      if (cards[currentIndex.value - 1]) {
        currentIndex.value--;
      } else {
        currentIndex.value = cards.length - 1;
      }
      return true;
    },
    canSwitch,
  });
})();

const $editMode = signal(false);

export function App() {
  const direction = useSignal(0);
  const isAnimatingRef = useRef(false);

  const handleSwipe = (swipeDirection: number) => {
    if (isAnimatingRef.current) return;

    const canSwitch = $currentCard.canSwitch();
    if (canSwitch) {
      isAnimatingRef.current = true;
      direction.value = swipeDirection;
      requestAnimationFrame(() => {
        isAnimatingRef.current = false;
        swipeDirection > 0 ? $currentCard.next() : $currentCard.prev();
      });
    }
  };

  const handleHideCard = () => {
    $currentCard.value && $cards.remove($currentCard.value);
    if ($currentCard.value === undefined) {
      $currentCard.next()
    }
  };

  const handleSaveCard = (card: CardData) => {
    $cards.add(card);
    $editMode.value = false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="relative w-80 h-48">
        <AnimatePresence mode="wait" initial={false}>
          {!$editMode.value ? (
            <>
              {$currentCard.value && (
                <FlashCard
                  $direction={direction}
                  key={$currentCard.value.front}
                  $card={$currentCard}
                  onSwipe={handleSwipe}
                  onHide={handleHideCard}
                />
              )}

              {$cards.value.length === 0 && (
                <div className="absolute w-full h-full flex items-center justify-center">
                  <p className="text-gray-500">No cards left</p>
                </div>
              )}
            </>
          ) : (
            <EditCard
              key={$currentCard.value?.front ?? 'form'}
              onAdd={handleSaveCard}
            />
          )}
        </AnimatePresence>
      </div>
      <button
        className="hide-button absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
        onClick={() => ($editMode.value = !$editMode.value)}
      >
        {$editMode.value ? 'Edit: on' : 'Edit: off'}
      </button>
    </div>
  );
}
