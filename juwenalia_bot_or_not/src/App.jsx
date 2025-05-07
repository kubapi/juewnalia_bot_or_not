import React, { useState, useEffect, useCallback } from "react";
import TinderCard from "react-tinder-card";
import { images as allImages } from "./images/sample/imageManifest";

function loadImages() {
  return [...allImages]
    .sort(() => 0.5 - Math.random())
    .slice(0, 100)
    .map((img, index) => ({ id: index, ...img }));
}

export default function DeepfakeQuizApp() {
  const [images] = useState(() => loadImages());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const [showResult, setShowResult] = useState(false);
  const [started, setStarted] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handleSwipe("left");
      if (e.key === "ArrowRight") handleSwipe("right");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  useEffect(() => {
    if (!started || showResult) return;
    if (timer === 0 || currentIndex >= images.length) {
      setShowResult(true);
      return;
    }
    const countdown = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(countdown);
  }, [timer, started, showResult, currentIndex]);

  const handleSwipe = useCallback(
    (direction) => {
      if (currentIndex >= images.length) return;
      setSwipeDirection(direction);
      setTimeout(() => setSwipeDirection(null), 300);

      const image = images[currentIndex];
      const userAnswer = direction === "right" ? "real" : "deepfake";
      if (userAnswer === image.label) {
        setScore((prev) => prev + 1);
      }
      setCurrentIndex((prev) => prev + 1);
    },
    [currentIndex, images],
  );

  const swipeRequirementType = "position";
  const swipeThreshold = 20;

  if (!started) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900">
        <div className="backdrop-blur-md bg-black/60 p-10 rounded-xl space-y-6">
          <h1 className="text-4xl font-bold text-white">Czy to DeepFake?</h1>
          <button
            onClick={() => setStarted(true)}
            className="px-14 py-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-3xl font-bold rounded-3xl shadow-2xl hover:scale-105 transition"
          >
            Zacznij grę!
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-white via-gray-100 to-white">
        <h1 className="text-4xl font-bold mb-6">Gra zakończona</h1>
        <p className="text-2xl mb-6">
          Twój wynik: {score} / {images.length}
        </p>
        <footer className="text-center text-xs text-gray-400 py-4 w-full border-t mt-6">
          <p>© 2025 Czy to Deepfake?</p>
        </footer>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between bg-gradient-to-b from-white via-gray-100 to-white overflow-hidden touch-pan-y">
      <header className="text-center pt-4 px-4 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-1">
          Czy to deepfake?
        </h1>
        <p className="text-sm sm:text-md text-gray-500">
          Przesuwaj w prawo (deepfake) lub w lewo (prawdziwe) w zależności od
          tego czy uważasz, że zdjęcie jest prawdziwe czy jest deepfake.
        </p>
        <p className="text-lg font-semibold mt-2">
          🧠 Score: {score} / {images.length} | ⏳ {timer}s
        </p>
      </header>

      <main className="flex-grow flex items-center justify-center w-full px-4 select-none">
        <div className="flex items-center justify-center gap-4 w-full max-w-screen-md">
          <div className="hidden sm:block text-right text-gray-400 text-sm w-1/4">
            ← DeepFake
          </div>

          <div className="relative flex items-center justify-center w-[80vw] max-w-[400px] h-[80vh] touch-pan-y">
            {currentImage && (
              <TinderCard
                key={currentImage.id}
                onSwipe={(dir) => handleSwipe(dir)}
                preventSwipe={["up", "down"]}
                flickOnSwipe={true}
                swipeRequirementType={swipeRequirementType}
                swipeThreshold={swipeThreshold}
                className="absolute w-full h-full"
              >
                <div className="relative w-full h-full select-none pointer-events-auto">
                  <img
                    src={currentImage.url}
                    alt={`quiz-${currentImage.id}`}
                    className="w-full h-full object-cover rounded-3xl shadow-2xl select-none pointer-events-none"
                    draggable={false}
                  />
                  {swipeDirection && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 text-white text-xl font-bold bg-black bg-opacity-60 rounded-xl">
                      {swipeDirection === "right" ? "Real" : "Deepfake"}
                    </div>
                  )}
                </div>
              </TinderCard>
            )}
          </div>

          <div className="hidden sm:block text-left text-gray-400 text-sm w-1/4">
            Prawdziwe →
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-4 w-full border-t">
        <p>© 2025 Bot or Not</p>
      </footer>
    </div>
  );
}
