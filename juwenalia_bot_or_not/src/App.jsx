import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const [timer, setTimer] = useState(5);
  const [showResult, setShowResult] = useState(false);
  const [started, setStarted] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const timerInterval = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handleSwipe("left");
      if (e.key === "ArrowRight") handleSwipe("right");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  useEffect(() => {
    if (currentIndex + 1 < images.length) {
      const nextImg = new window.Image();
      nextImg.src = images[currentIndex + 1].url;
    }
  }, [currentIndex, images]);

  useEffect(() => {
    if (!started || showResult) return;
    timerInterval.current = setInterval(() => {
      setTimer((prev) => {
        if (prev > 0) return prev - 1;
        return 0;
      });
    }, 1000);
    return () => clearInterval(timerInterval.current);
  }, [started, showResult]);

  useEffect(() => {
    if (timer === 0 || currentIndex >= images.length) {
      setShowResult(true);
      clearInterval(timerInterval.current);
    }
  }, [timer, currentIndex, images.length]);

  useEffect(() => {
    if (!started) setTimer(5);
  }, [started]);

  // Preload next 5 images robustly
  useEffect(() => {
    for (let i = 1; i <= 5; i++) {
      if (currentIndex + i < images.length) {
        const img = new window.Image();
        img.src = images[currentIndex + i].url;
      }
    }
  }, [currentIndex, images]);

  const handleSwipe = useCallback(
    (direction) => {
      if (currentIndex >= images.length) return;
      setSwipeDirection(direction);
      setTimeout(() => setSwipeDirection(null), 300);

      const image = images[currentIndex];
      const userAnswer = direction === "right" ? "real" : "deepfake";
      if (userAnswer === image.label) {
        setScore((prev) => prev + 1);
        setFeedback({ text: "Correct!", color: "green" });
      } else {
        setFeedback({ text: "Wrong!", color: "red" });
      }
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => setFeedback(null), 1000);
    },
    [currentIndex, images],
  );

  const swipeRequirementType = "position";
  const swipeThreshold = 20;

  if (!started) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ 
        backgroundColor: '#003399',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='2.5' fill='white' fill-opacity='0.18'/%3E%3C/svg%3E")`,
      }}>
        <div className="backdrop-blur-md bg-white/10 p-10 rounded-xl space-y-8 w-full max-w-2xl">
          <h1 className="text-5xl font-bold text-white text-center">Bot or Not!</h1>
          <p className="text-white text-center mb-8 text-xl">
            Swipe left (deepfake) or right (real) depending on whether you think the image is real or a deepfake.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => setStarted(true)}
              className="px-40 py-20 text-7xl font-bold rounded-3xl shadow-2xl hover:scale-105 transition"
              style={{ backgroundColor: '#FFD600', color: '#003399', border: 'none', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.2)' }}
            >
              Start Game!
            </button>
          </div>
          <div className="flex justify-center items-center gap-8 mt-12">
            <img src="/eu-flag.jpg" alt="European Union Flag" className="w-32 h-auto" />
            <img src="/pravda-logo.png" alt="Pravda Association Logo" className="w-32 h-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ 
        backgroundColor: '#003399',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='2.5' fill='white' fill-opacity='0.18'/%3E%3C/svg%3E")`,
      }}>
        <div className="backdrop-blur-md bg-white/10 p-10 rounded-xl space-y-8 w-full max-w-2xl flex flex-col items-center">
          <h1 className="text-5xl font-bold text-white text-center">Game Over</h1>
          <p className="text-white text-center mb-8 text-3xl font-bold">
            Your score: {score} / {images.length}
          </p>
          <div className="flex justify-center items-center gap-8 mt-12">
            <img src="/eu-flag.jpg" alt="European Union Flag" className="w-32 h-auto" />
            <img src="/pravda-logo.png" alt="Pravda Association Logo" className="w-32 h-auto" />
          </div>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between bg-gradient-to-b from-white via-gray-100 to-white overflow-hidden touch-pan-y">
      <header className="text-center pt-2 px-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 ecl-heading ecl-heading--h1">
          Bot or Not!
        </h1>
        <div className="flex justify-center gap-8">
          <div className="text-md font-semibold text-blue-900 ecl-paragraph">
            Score: {score} / {images.length}
          </div>
          <div className="text-md font-semibold text-blue-900 ecl-paragraph">
            Time: {timer}s
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center w-full h-[calc(100vh-60px)] select-none">
        <div className="flex items-center justify-center w-full h-full">
          <div className="relative flex items-center justify-center w-full h-full touch-pan-y">
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
                  {feedback && (
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-2xl text-4xl font-bold shadow-lg z-50"
                      style={{ background: feedback.color === 'green' ? '#d1fae5' : '#fee2e2', color: feedback.color === 'green' ? '#065f46' : '#991b1b', border: '2px solid #fff' }}>
                      {feedback.text}
                    </div>
                  )}
                </div>
              </TinderCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
