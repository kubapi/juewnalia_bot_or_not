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
        <div 
          className="backdrop-blur-md bg-white/10 rounded-2xl game-font"
          style={{
            width: '90%',
            maxWidth: '90vw',
            padding: '4vh 4vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6vh'
          }}
        >
          <h1 
            className="font-bold text-white text-center"
            style={{ 
              fontFamily: 'Minecraft, "Courier New", monospace !important',
              letterSpacing: '0.3vw',
              fontSize: 'clamp(4rem, 12vw, 18rem)',
              lineHeight: '1.1'
            }}
          >
            GAME RULES
          </h1>
          
          <div 
            className="text-white text-center"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '3vh'
            }}
          >
            <div 
              className="font-bold"
              style={{ 
                fontFamily: 'Minecraft, "Courier New", monospace !important',
                fontSize: 'clamp(2.2rem, 4.5vw, 6rem)'
              }}
            >
              ❤️ YOU HAVE 5 HEARTS
            </div>
            <div 
              style={{ 
                fontFamily: 'Minecraft, "Courier New", monospace !important',
                fontSize: 'clamp(1.8rem, 3.5vw, 4.5rem)'
              }}
            >
              IF YOU ANSWER WRONG, YOU LOSE A HEART
            </div>
            <div 
              className="font-bold"
              style={{ 
                fontFamily: 'Minecraft, "Courier New", monospace !important',
                fontSize: 'clamp(2.2rem, 4.5vw, 6rem)'
              }}
            >
              ⏰ 60 SECONDS TO COLLECT POINTS
            </div>
            <div 
              style={{ 
                fontFamily: 'Minecraft, "Courier New", monospace !important',
                fontSize: 'clamp(1.8rem, 3.5vw, 4.5rem)'
              }}
            >
              YOUR TASK IS TO GET AS MANY POINTS AS POSSIBLE!
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => {
                reshuffleImages();
                setShowInstructions(false);
                setStarted(true);
              }}
              className="font-bold shadow-2xl hover:scale-105 transition"
              style={{ 
                backgroundColor: '#FFD600', 
                color: '#003399', 
                border: '0.4vw solid #000', 
                fontFamily: 'Minecraft, "Courier New", monospace !important',
                letterSpacing: '0.3vw',
                boxShadow: '0 1vh 4vh 0 rgba(0,0,0,0.3)',
                padding: '3vh 8vw',
                fontSize: 'clamp(3rem, 7vw, 9rem)',
                borderRadius: '1.5vw',
                cursor: 'pointer'
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
        <div 
          className="backdrop-blur-md bg-white/10 rounded-2xl game-font"
          style={{
            width: '90%',
            maxWidth: '90vw',
            padding: '4vh 4vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6vh'
          }}
        >
          <h1 
            className="font-bold text-white text-center"
            style={{ 
              fontFamily: 'Minecraft, "Courier New", monospace !important',
              letterSpacing: '0.3vw',
              fontSize: 'clamp(3rem, 15vw, 20rem)',
              lineHeight: '1.1'
            }}
          >
            BOT OR NOT!
          </h1>
          <p 
            className="text-white text-center"
            style={{ 
              fontFamily: 'Minecraft, "Courier New", monospace !important',
              fontSize: 'clamp(1.8rem, 4vw, 5rem)',
              marginBottom: '2vh',
              lineHeight: '1.3'
            }}
          >
            SCROLL THROUGH THE SOCIAL FEED AND CLICK "FAKE" OR "REAL" FOR EACH POST.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setShowInstructions(true)}
              className="font-bold shadow-2xl hover:scale-105 transition"
              style={{ 
                backgroundColor: '#FFD600', 
                color: '#003399', 
                border: '0.4vw solid #000', 
                fontFamily: 'Minecraft, "Courier New", monospace !important',
                letterSpacing: '0.4vw',
                boxShadow: '0 1vh 4vh 0 rgba(0,0,0,0.3)',
                padding: '4vh 10vw',
                fontSize: 'clamp(3.5rem, 8vw, 12rem)',
                borderRadius: '2vw',
                cursor: 'pointer'
              }}
            >
              START GAME!
            </button>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '8vw',
            marginTop: '4vh'
          }}>
            <img 
              src="/eu-flag.jpg" 
              alt="European Union Flag" 
              style={{ width: 'clamp(24rem, 36vw, 48rem)', height: 'auto' }} 
            />
            <img 
              src="/pravda-logo.png" 
              alt="Pravda Association Logo" 
              style={{ width: 'clamp(24rem, 36vw, 48rem)', height: 'auto' }} 
            />
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
        <div 
          className="backdrop-blur-md bg-white/10 rounded-2xl game-font"
          style={{
            width: '90%',
            maxWidth: '90vw',
            padding: '4vh 4vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4vh'
          }}
        >
          <h1 
            className="font-bold text-white text-center"
            style={{ 
              fontFamily: 'Minecraft, "Courier New", monospace !important',
              letterSpacing: '0.3vw',
              fontSize: 'clamp(4rem, 12vw, 18rem)',
              lineHeight: '1.1'
            }}
          >
            NICE TRY!
          </h1>
          <p 
            className="text-white text-center font-bold"
            style={{ 
              fontFamily: 'Minecraft, "Courier New", monospace !important',
              fontSize: 'clamp(2.8rem, 6vw, 8rem)',
              marginBottom: '2vh'
            }}
          >
            YOUR SCORE: <span style={{ fontSize: 'clamp(3.5rem, 7vw, 10rem)' }}>{score}</span>
          </p>
          <p 
            className="text-white text-center"
            style={{ 
              fontFamily: 'Minecraft, "Courier New", monospace !important',
              fontSize: 'clamp(1.5rem, 3vw, 4rem)',
              marginBottom: '2vh'
            }}
          >
            YOU ANSWERED <span style={{ fontSize: 'clamp(1.8rem, 3.5vw, 4.5rem)', fontWeight: 'bold' }}>{correctAnswers}</span> POSTS CORRECTLY OUT OF <span style={{ fontSize: 'clamp(1.8rem, 3.5vw, 4.5rem)', fontWeight: 'bold' }}>{answeredImages.size}</span> POSTS
          </p>
          
          <div 
            className="text-white text-center"
            style={{ 
              fontFamily: 'Minecraft, "Courier New", monospace !important',
              fontSize: 'clamp(1.5rem, 3vw, 4rem)',
              marginBottom: '2vh',
              display: 'flex',
              flexDirection: 'column',
              gap: '1vh'
            }}
          >
            <div>
              ❌ FAKES DETECTED: <span style={{ fontSize: 'clamp(1.8rem, 3.5vw, 4.5rem)', fontWeight: 'bold' }}>{deepfakesDetected}</span>
            </div>
            <div>
              ✅ REAL IMAGES DETECTED: <span style={{ fontSize: 'clamp(1.8rem, 3.5vw, 4.5rem)', fontWeight: 'bold' }}>{realDetected}</span>
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
            className="font-bold shadow-2xl hover:scale-105 transition-all duration-200"
            style={{ 
              backgroundColor: '#FFD600', 
              color: '#003399', 
              border: '0.3vw solid #000', 
              fontFamily: 'Minecraft, "Courier New", monospace !important',
              letterSpacing: '0.3vw',
              boxShadow: '0 1vh 4vh 0 rgba(255,214,0,0.3)',
              padding: '2.5vh 6vw',
              fontSize: 'clamp(1.8rem, 4vw, 5rem)',
              borderRadius: '1vw',
              cursor: 'pointer',
              marginBottom: '2vh'
            }}
          >
            RESTART GAME
          </button>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '8vw'
          }}>
            <img 
              src="/eu-flag.jpg" 
              alt="European Union Flag" 
              style={{ width: 'clamp(24rem, 36vw, 48rem)', height: 'auto' }} 
            />
            <img 
              src="/pravda-logo.png" 
              alt="Pravda Association Logo" 
              style={{ width: 'clamp(24rem, 36vw, 48rem)', height: 'auto' }} 
            />
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
          fontSize: '24px'
        }}
      >
        ✕
      </button>

      <header 
        className="sticky top-0 z-10 text-center w-full game-font relative bg-gradient-to-b from-white via-gray-100 to-white"
        style={{
          paddingTop: '1vh',
          paddingLeft: '2vw',
          paddingRight: '2vw'
        }}
      >
        <h1 
          className="font-bold text-blue-900"
          style={{ 
            fontFamily: 'Minecraft, "Courier New", monospace !important',
            letterSpacing: '0.2vw',
            fontSize: 'clamp(2rem, 10vw, 12rem)',
            lineHeight: '1.2'
          }}
        >
          BOT OR NOT!
        </h1>
        
        <div 
          className="flex justify-center items-center"
          style={{
            gap: '2vw',
            marginTop: '1vh'
          }}
        >
          <div 
            className="font-semibold text-blue-900"
            style={{ 
              fontFamily: 'Minecraft, "Courier New", monospace !important',
              fontSize: 'clamp(1.2rem, 7vw, 7rem)'
            }}
          >
            SCORE: {score}
          </div>
          <div 
            className="font-semibold text-blue-900"
            style={{ 
              fontFamily: 'Minecraft, "Courier New", monospace !important',
              fontSize: 'clamp(1.2rem, 7vw, 7rem)'
            }}
          >
            TIME: {timer}s
          </div>
          {/* Minecraft-style Hearts */}
          <div style={{ display: 'flex', gap: '0.5vw' }}>
            {[1, 2, 3, 4, 5].map((heart) => (
              <Heart 
                key={heart} 
                filled={heart <= lives} 
                size="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 xl:w-16 xl:h-16"
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
            <div 
              ref={feedContainerRef} 
              style={{
                width: '95%',
                maxWidth: '95vw',
                margin: '0 auto',
                padding: '2vh 2vw',
                paddingBottom: '8vh',
                display: 'flex',
                flexDirection: 'column',
                gap: '2vh'
              }}
            >
              {images.slice(0, visibleImagesCount).map((image, index) => (
                <div 
                  key={image.id} 
                  className="bg-white shadow-lg overflow-hidden"
                  style={{
                    borderRadius: '1.5vw',
                    boxShadow: '0 0.5vh 2vh 0 rgba(0,0,0,0.1)'
                  }}
                >
                  
                  {/* Image */}
                  <div 
                    className="relative flex items-center justify-center bg-gray-100"
                    style={{ height: 'clamp(20vh, 40vh, 50vh)' }}
                  >
                    <img
                      src={image.url}
                      alt={`post-${image.id}`}
                      className="w-full h-full object-cover object-center"
                      draggable={false}
                    />
                    
                  </div>
                  
                  {/* Action Buttons or Notification */}
                  <div style={{ padding: '2vh 2vw' }}>
                    {!answeredImages.has(index) ? (
                      <div 
                        className="flex"
                        style={{ gap: '1vw' }}
                      >
                        <button
                          onClick={() => handleAnswer("fake", index)}
                          className="flex-1 font-bold shadow-lg hover:scale-105 transition-all duration-200"
                          style={{ 
                            backgroundColor: '#FF4444', 
                            color: 'white', 
                            border: '0.2vw solid #000', 
                            fontFamily: 'Minecraft, "Courier New", monospace !important',
                            letterSpacing: '0.2vw',
                            boxShadow: '0 0.3vh 1vh 0 rgba(255,68,68,0.3)',
                            padding: '3.5vh 4vw',
                            fontSize: 'clamp(1.2rem, 4.5vw, 5rem)',
                            borderRadius: '1vw',
                            minHeight: 'clamp(3rem, 10vh, 7rem)',
                            cursor: 'pointer'
                          }}
                        >
                          FAKE
                        </button>
                        <button
                          onClick={() => handleAnswer("real", index)}
                          className="flex-1 font-bold shadow-lg hover:scale-105 transition-all duration-200"
                          style={{ 
                            backgroundColor: '#44FF44', 
                            color: 'black', 
                            border: '0.2vw solid #000', 
                            fontFamily: 'Minecraft, "Courier New", monospace !important',
                            letterSpacing: '0.2vw',
                            boxShadow: '0 0.3vh 1vh 0 rgba(68,255,68,0.3)',
                            padding: '3.5vh 4vw',
                            fontSize: 'clamp(1.2rem, 4.5vw, 5rem)',
                            borderRadius: '1vw',
                            minHeight: 'clamp(3rem, 10vh, 7rem)',
                            cursor: 'pointer'
                          }}
                        >
                          REAL
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="text-center"
                        style={{ padding: '1.5vh 0' }}
                      >
                        {(() => {
                          const result = answerResults[index];
                          if (!result) return null;
                          
                          if (result.isCorrect) {
                            return (
                              <div 
                                className="inline-block font-bold bg-green-100 text-green-800"
                                style={{ 
                                  fontFamily: 'Minecraft, "Courier New", monospace !important',
                                  border: '0.2vw solid #000',
                                  padding: '1.5vh 3vw',
                                  borderRadius: '0.8vw',
                                  fontSize: 'clamp(1rem, 5vw, 5rem)'
                                }}
                              >
                                ✅&nbsp;&nbsp;CORRECT: IT WAS {result.correctAnswer === 'fake' ? 'FAKE' : 'REAL'}
                              </div>
                            );
                          } else {
                            return (
                              <div 
                                className="inline-block font-bold bg-red-100 text-red-800"
                                style={{ 
                                  fontFamily: 'Minecraft, "Courier New", monospace !important',
                                  border: '0.2vw solid #000',
                                  padding: '1.5vh 3vw',
                                  borderRadius: '0.8vw',
                                  fontSize: 'clamp(1rem, 5vw, 5rem)'
                                }}
                              >
                                ❌&nbsp;&nbsp;FALSE: IT WAS {result.correctAnswer === 'fake' ? 'FAKE' : 'REAL'}
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </div>
                  
                  {/* Fake Engagement */}
                  <div 
                    style={{ 
                      padding: '0 2vw 2vh 2vw'
                    }}
                  >
                    <div 
                      className="flex items-center text-gray-600"
                      style={{ gap: '2vw' }}
                    >
                      <span 
                        style={{ 
                          fontFamily: 'Minecraft, "Courier New", monospace !important',
                          fontSize: 'clamp(1.2rem, 5vw, 4rem)'
                        }}
                      >
                        ❤️ {postData[index]?.likes || 0} likes
                      </span>
                      <span 
                        style={{ 
                          fontFamily: 'Minecraft, "Courier New", monospace !important',
                          fontSize: 'clamp(1.2rem, 5vw, 4rem)'
                        }}
                      >
                        💬 {postData[index]?.comments || 0} comments
                      </span>
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
