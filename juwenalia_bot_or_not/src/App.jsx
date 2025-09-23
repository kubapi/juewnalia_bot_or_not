import React, { useState, useEffect, useCallback, useRef } from "react";
import { images as allImages } from "./images/sample2/imageManifest";

// Minecraft-style heart component using custom image
const Heart = ({ filled = true, size = "w-6 h-6" }) => (
  <div className={`${size} relative`}>
    <img 
      src="/mcheart.jpg" 
      alt="heart" 
      className={`w-full h-full object-contain ${!filled ? 'opacity-30 grayscale' : ''}`}
    />
  </div>
);

function loadImages() {
  return [...allImages]
    .sort(() => 0.5 - Math.random())
    .slice(0, 100)
    .map((img, index) => ({ id: index, ...img }));
}

export default function DeepfakeQuizApp() {
  const [images, setImages] = useState(() => loadImages());
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const [showResult, setShowResult] = useState(false);
  const [started, setStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const [answeredImages, setAnsweredImages] = useState(new Set());
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [deepfakesDetected, setDeepfakesDetected] = useState(0);
  const [realDetected, setRealDetected] = useState(0);
  const [postData, setPostData] = useState({});
  const [lives, setLives] = useState(5);
  const [answerResults, setAnswerResults] = useState({});
  const [visibleImagesCount, setVisibleImagesCount] = useState(1); // Start with 1 image
  const timerInterval = useRef(null);
  const feedContainerRef = useRef(null);

  // Function to reshuffle images
  const reshuffleImages = () => {
    setImages(loadImages());
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handleAnswer("fake");
      if (e.key === "ArrowRight") handleAnswer("real");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


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
    if (timer === 0 || lives === 0) {
      setShowResult(true);
      clearInterval(timerInterval.current);
    }
  }, [timer, lives]);

  useEffect(() => {
    if (!started) {
      setTimer(60);
      setLives(5);
    }
  }, [started]);

  // Initialize post data with random usernames, dates, and engagement
  useEffect(() => {
    const newPostData = {};
    images.slice(0, 100).forEach((_, index) => {
      const day = Math.floor(Math.random() * 30) + 1;
      const month = Math.floor(Math.random() * 12) + 1;
      const year = 2023 + Math.floor(Math.random() * 2);
      newPostData[index] = {
        username: `#${Math.random().toString(36).substr(2, 8)}`,
        date: `${day}/${month}/${year}`,
        likes: Math.floor(Math.random() * 100) + 10,
        comments: Math.floor(Math.random() * 20) + 1
      };
    });
    setPostData(newPostData);
  }, [images]);

  const handleAnswer = useCallback(
    (userAnswer, imageId = null) => {
      const targetImageId = imageId || 0;
      const image = images[targetImageId];
      
      if (!image || answeredImages.has(targetImageId)) return;

      let isCorrect = false;
      
      // Map dataset labels to UI labels
      const correctAnswer = image.label === "deepfake" ? "fake" : image.label;
      
      if (userAnswer === correctAnswer) {
        setScore((prev) => prev + 1);
        setCorrectAnswers((prev) => prev + 1);
        isCorrect = true;
        
        // Track correct detections
        if (userAnswer === "fake") {
          setDeepfakesDetected((prev) => prev + 1);
        } else if (userAnswer === "real") {
          setRealDetected((prev) => prev + 1);
        }
      } else {
        setLives((prev) => Math.max(0, prev - 1));
        isCorrect = false;
      }
      
      // Mark image as answered and store result
      setAnsweredImages(prev => new Set([...prev, targetImageId]));
      setAnswerResults(prev => ({
        ...prev,
        [targetImageId]: {
          userAnswer,
          correctAnswer: correctAnswer,
          isCorrect
        }
      }));
      
      // Load next image if we've answered the current last visible image
      if (targetImageId === visibleImagesCount - 1 && visibleImagesCount < 100) {
        setVisibleImagesCount(prev => Math.min(prev + 1, 100));
        
        // Auto-scroll to the next post after a short delay
        setTimeout(() => {
          if (feedContainerRef.current) {
            const nextPostElement = feedContainerRef.current.children[targetImageId + 1];
            if (nextPostElement) {
              nextPostElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
            }
          }
        }, 500); // Small delay to show feedback first
      }
      
    },
    [images, answeredImages, visibleImagesCount],
  );

  if (showInstructions) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ 
        backgroundColor: '#003399',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='2.5' fill='white' fill-opacity='0.18'/%3E%3C/svg%3E")`,
      }}>
        <div className="backdrop-blur-md bg-white/10 p-10 rounded-xl space-y-8 w-full max-w-2xl game-font">
          <h1 className="text-5xl font-bold text-white text-center" style={{ 
            fontFamily: 'Minecraft, "Courier New", monospace !important',
            letterSpacing: '3px'
          }}>GAME RULES</h1>
          
          <div className="space-y-6 text-white text-center">
            <div className="text-2xl font-bold" style={{ 
              fontFamily: 'Minecraft, "Courier New", monospace !important'
            }}>
              ❤️ YOU HAVE 5 HEARTS
            </div>
            <div className="text-xl" style={{ 
              fontFamily: 'Minecraft, "Courier New", monospace !important'
            }}>
              IF YOU ANSWER WRONG, YOU LOSE A HEART
            </div>
            <div className="text-2xl font-bold" style={{ 
              fontFamily: 'Minecraft, "Courier New", monospace !important'
            }}>
              ⏰ 60 SECONDS TO COLLECT POINTS
            </div>
            <div className="text-xl" style={{ 
              fontFamily: 'Minecraft, "Courier New", monospace !important'
            }}>
              YOUR TASK IS TO GET AS MANY POINTS AS POSSIBLE!
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={() => {
                reshuffleImages();
                setShowInstructions(false);
                setStarted(true);
              }}
              className="px-20 py-10 text-4xl font-bold rounded-2xl shadow-2xl hover:scale-105 transition"
              style={{ 
                backgroundColor: '#FFD600', 
                color: '#003399', 
                border: '4px solid #000', 
                fontFamily: 'Minecraft, "Courier New", monospace !important',
                letterSpacing: '2px',
                boxShadow: '0 8px 32px 0 rgba(0,0,0,0.2)' 
              }}
            >
              LET'S GO!
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ 
        backgroundColor: '#003399',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='2.5' fill='white' fill-opacity='0.18'/%3E%3C/svg%3E")`,
      }}>
        <div className="backdrop-blur-md bg-white/10 p-10 rounded-xl space-y-8 w-full max-w-2xl game-font">
          <h1 className="text-5xl font-bold text-white text-center" style={{ 
            fontFamily: 'Minecraft, "Courier New", monospace !important',
            letterSpacing: '3px'
          }}>BOT OR NOT!</h1>
          <p className="text-white text-center mb-8 text-xl" style={{ 
            fontFamily: 'Minecraft, "Courier New", monospace !important'
          }}>
            SCROLL THROUGH THE SOCIAL FEED AND CLICK "FAKE" OR "REAL" FOR EACH POST.
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={() => setShowInstructions(true)}
              className="px-40 py-20 text-7xl font-bold rounded-3xl shadow-2xl hover:scale-105 transition"
              style={{ 
                backgroundColor: '#FFD600', 
                color: '#003399', 
                border: '4px solid #000', 
                fontFamily: 'Minecraft, "Courier New", monospace !important',
                letterSpacing: '4px',
                boxShadow: '0 8px 32px 0 rgba(0,0,0,0.2)' 
              }}
            >
              START GAME!
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
        <div className="backdrop-blur-md bg-white/10 p-10 rounded-xl space-y-8 w-full max-w-2xl flex flex-col items-center game-font">
          <h1 className="text-5xl font-bold text-white text-center" style={{ 
            fontFamily: 'Minecraft, "Courier New", monospace !important',
            letterSpacing: '3px'
          }}>NICE TRY!</h1>
          <p className="text-white text-center mb-8 text-3xl font-bold" style={{ 
            fontFamily: 'Minecraft, "Courier New", monospace !important'
          }}>
            YOUR SCORE: <span className="font-black text-4xl">{score}</span>
          </p>
          <p className="text-white text-center mb-4 text-lg" style={{ 
            fontFamily: 'Minecraft, "Courier New", monospace !important'
          }}>
            YOU ANSWERED <span className="font-black text-xl">{correctAnswers}</span> POSTS CORRECTLY OUT OF <span className="font-black text-xl">{answeredImages.size}</span> POSTS
          </p>
          
          <div className="text-white text-center mb-4 text-lg" style={{ 
            fontFamily: 'Minecraft, "Courier New", monospace !important'
          }}>
            <div className="mb-2">
              ❌ FAKES DETECTED: <span className="font-black text-xl">{deepfakesDetected}</span>
            </div>
            <div>
              ✅ REAL IMAGES DETECTED: <span className="font-black text-xl">{realDetected}</span>
            </div>
          </div>
          
          {/* Restart Button */}
          <button
            onClick={() => {
              reshuffleImages();
              setStarted(false);
              setShowResult(false);
              setScore(0);
              setCorrectAnswers(0);
              setDeepfakesDetected(0);
              setRealDetected(0);
              setAnsweredImages(new Set());
              setAnswerResults({});
              setVisibleImagesCount(1);
              setLives(5);
              setTimer(60);
            }}
            className="px-8 py-4 text-xl font-bold rounded-xl shadow-2xl hover:scale-105 transition-all duration-200 mb-8"
            style={{ 
              backgroundColor: '#FFD600', 
              color: '#003399', 
              border: '3px solid #000', 
              fontFamily: 'Minecraft, "Courier New", monospace !important',
              letterSpacing: '2px',
              boxShadow: '0 8px 32px 0 rgba(255,214,0,0.3)' 
            }}
          >
            RESTART GAME
          </button>
          
          <div className="flex justify-center items-center gap-8">
            <img src="/eu-flag.jpg" alt="European Union Flag" className="w-32 h-auto" />
            <img src="/pravda-logo.png" alt="Pravda Association Logo" className="w-32 h-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between bg-gradient-to-b from-white via-gray-100 to-white overflow-hidden touch-pan-y"
      style={{
        minHeight: '100dvh',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Fixed X button - always in top-right corner */}
      <button
        onClick={() => setShowResult(true)}
        className="fixed top-2 right-2 z-50 w-8 h-8 flex items-center justify-center text-white font-bold rounded-full shadow-lg hover:scale-110 transition-all duration-200"
        style={{ 
          backgroundColor: '#FF4444', 
          border: '2px solid #000', 
          fontFamily: 'Minecraft, "Courier New", monospace !important',
          fontSize: '14px'
        }}
      >
        ✕
      </button>

      <header className="sticky top-0 z-10 text-center pt-2 px-4 w-full game-font relative bg-gradient-to-b from-white via-gray-100 to-white">
        <h1 className="game-title font-bold text-blue-900" style={{ 
          fontFamily: 'Minecraft, "Courier New", monospace !important',
          letterSpacing: '1px'
        }}>
          BOT OR NOT!
        </h1>
        
        <div className="flex justify-center items-center gap-4 sm:gap-8 mt-2">
          <div className="text-sm sm:text-md font-semibold text-blue-900" style={{ 
            fontFamily: 'Minecraft, "Courier New", monospace !important'
          }}>
            SCORE: {score}
          </div>
          <div className="text-sm sm:text-md font-semibold text-blue-900" style={{ 
            fontFamily: 'Minecraft, "Courier New", monospace !important'
          }}>
            TIME: {timer}s
          </div>
          {/* Minecraft-style Hearts */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((heart) => (
              <Heart 
                key={heart} 
                filled={heart <= lives} 
                size="w-4 h-4 sm:w-5 sm:h-5"
              />
            ))}
          </div>
        </div>
      </header>

            <main className="flex-grow w-full h-[calc(100vh-60px)] select-none mt-1">
        {/* Social Media Feed Mode */}
          <div 
            className="w-full h-full overflow-y-auto"
            style={{ 
              backgroundColor: '#003399',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='2.5' fill='white' fill-opacity='0.18'/%3E%3C/svg%3E")`,
            }}
          >
            <div ref={feedContainerRef} className="max-w-2xl mx-auto space-y-4 sm:space-y-6 p-3 sm:p-4 pb-24 sm:pb-20">
              {images.slice(0, visibleImagesCount).map((image, index) => (
                <div key={image.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Simplified Header */}
                  <div className="p-4 pb-2 flex justify-between items-center">
                    <div className="font-semibold text-gray-500 text-sm">{postData[index]?.username || `#${index}`}</div>
                    <div className="font-semibold text-gray-500 text-sm">{postData[index]?.date || 'Loading...'}</div>
                  </div>
                  
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={`post-${image.id}`}
                      className="w-full h-96 object-cover"
                      draggable={false}
                    />
                    
                  </div>
                  
                  {/* Action Buttons or Notification */}
                  <div className="p-4">
                    {!answeredImages.has(index) ? (
                      <div className="flex gap-2 sm:gap-3">
                        <button
                          onClick={() => handleAnswer("fake", index)}
                          className="flex-1 py-4 sm:py-3 px-3 sm:px-4 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:scale-105 transition-all duration-200 min-h-[48px]"
                          style={{ 
                            backgroundColor: '#FF4444', 
                            color: 'white', 
                            border: '2px solid #000', 
                            fontFamily: 'Minecraft, "Courier New", monospace !important',
                            letterSpacing: '1px',
                            boxShadow: '0 4px 16px 0 rgba(255,68,68,0.3)' 
                          }}
                        >
                          FAKE
                        </button>
                        <button
                          onClick={() => handleAnswer("real", index)}
                          className="flex-1 py-4 sm:py-3 px-3 sm:px-4 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:scale-105 transition-all duration-200 min-h-[48px]"
                          style={{ 
                            backgroundColor: '#44FF44', 
                            color: 'black', 
                            border: '2px solid #000', 
                            fontFamily: 'Minecraft, "Courier New", monospace !important',
                            letterSpacing: '1px',
                            boxShadow: '0 4px 16px 0 rgba(68,255,68,0.3)' 
                          }}
                        >
                          REAL
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        {(() => {
                          const result = answerResults[index];
                          if (!result) return null;
                          
                          if (result.isCorrect) {
                            return (
                              <div className="inline-block px-4 py-2 rounded-lg text-lg font-bold bg-green-100 text-green-800" style={{ 
                                fontFamily: 'Minecraft, "Courier New", monospace !important',
                                border: '2px solid #000'
                              }}>
                                ✅&nbsp;&nbsp;CORRECT: IT WAS {result.correctAnswer === 'fake' ? 'FAKE' : 'REAL'}
                              </div>
                            );
                          } else {
                            return (
                              <div className="inline-block px-4 py-2 rounded-lg text-lg font-bold bg-red-100 text-red-800" style={{ 
                                fontFamily: 'Minecraft, "Courier New", monospace !important',
                                border: '2px solid #000'
                              }}>
                                ❌&nbsp;&nbsp;FALSE: IT WAS {result.correctAnswer === 'fake' ? 'FAKE' : 'REAL'}
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </div>
                  
                  {/* Fake Engagement */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="text-sm" style={{ fontFamily: 'Minecraft, "Courier New", monospace !important' }}>❤️ {postData[index]?.likes || 0} likes</span>
                      <span className="text-sm" style={{ fontFamily: 'Minecraft, "Courier New", monospace !important' }}>💬 {postData[index]?.comments || 0} comments</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </main>
    </div>
  );
}
