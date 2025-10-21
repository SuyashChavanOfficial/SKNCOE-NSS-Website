import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const PosterOfTheDay = () => {
  const [posters, setPosters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        const res = await fetch(`${API_URL}/api/poster/all`);
        const data = await res.json();

        if (res.ok && data.posters && data.posters.length > 0) {
          setPosters(data.posters.reverse());
        }
      } catch (error) {
        console.log("Error fetching posters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosters();
  }, []);

  useEffect(() => {
    if (posters.length <= 1) return;

    const currentPoster = posters[currentIndex];
    let duration = 7000;

    if (currentPoster?.mediaType === "video") {
      const videoElement = document.querySelector(
        `video[data-poster-id="${currentPoster._id}"]`
      );

      if (videoElement && !isNaN(videoElement.duration)) {
        duration = Math.max(7000, videoElement.duration * 1000);
      } else {
        duration = 7000;
      }
    }

    const interval = setInterval(() => {
      goToNext();
    }, duration);

    return () => clearInterval(interval);
  }, [posters.length, currentIndex]);

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + posters.length) % posters.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % posters.length);
  };

  const goToSlide = (index) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const getFormattedDate = (date) => {
    const day = format(date, "d");
    const monthYear = format(date, "MMMM, yyyy");
    const dayNum = parseInt(day, 10);
    let suffix = "th";
    if (dayNum % 10 === 1 && dayNum !== 11) suffix = "st";
    else if (dayNum % 10 === 2 && dayNum !== 12) suffix = "nd";
    else if (dayNum % 10 === 3 && dayNum !== 13) suffix = "rd";

    return (
      <span className="text-lg text-blue-900">
        <span className="inline-flex items-start">
          <span>{day}</span>
          <span className="text-xs ml-0.5 mt-0.5">{suffix}</span>
        </span>{" "}
        {monthYear}
      </span>
    );
  };

  if (!posters || posters.length === 0) {
    return (
      <section className="mx-auto my-10 p-6 bg-blue-50 rounded-lg shadow-md flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-xl text-gray-500 font-medium">
          No poster for today.
        </p>
      </section>
    );
  }

  const currentPoster = posters[currentIndex];

  return (
    <section className="mx-auto my-10 p-6 bg-blue-50 rounded-lg shadow-md flex flex-col items-center gap-6 relative">
      <div className="flex-1 text-center z-10">
        <h2 className="text-4xl font-bold text-red-600 mb-2">
          {posters.length > 1 ? "Posters of the Day" : "Poster of the Day"}
        </h2>
        <p className="italic mb-4">
          {getFormattedDate(new Date(currentPoster.date))}
        </p>
      </div>

      {loading && (
        <DotLottieReact
          src="https://lottie.host/df4872e5-2ea2-4a61-abf9-23b960847fa2/gwTblBb7kZ.lottie"
          loop
          autoplay
          height={100}
        />
      )}

      <div className="w-full relative overflow-hidden">
        <div className="relative w-full md:w-2/3 mx-auto h-[500px] flex items-center justify-center">
          {posters.map((poster, index) => {
            const isActive = index === currentIndex;
            const isPrev =
              index === (currentIndex - 1 + posters.length) % posters.length;
            const isNext = index === (currentIndex + 1) % posters.length;

            let transform = "translateX(0) scale(1)";
            let opacity = 0;
            let zIndex = 0;

            if (isActive) {
              transform = "translateX(0) scale(1)";
              opacity = 1;
              zIndex = 10;
            } else if (isPrev) {
              transform = "translateX(-120%) scale(0.8)";
              opacity = 0.4;
              zIndex = 5;
            } else if (isNext) {
              transform = "translateX(120%) scale(0.8)";
              opacity = 0.4;
              zIndex = 5;
            } else {
              transform =
                direction === 1
                  ? "translateX(200%) scale(0.8)"
                  : "translateX(-200%) scale(0.8)";
              opacity = 0;
              zIndex = 1;
            }

            return (
              <div
                key={poster._id}
                className="absolute top-0 left-0 w-full h-full transition-all duration-700 ease-in-out flex items-center justify-center"
                style={{
                  transform,
                  opacity,
                  zIndex,
                }}
              >
                {poster.mediaType === "video" ? (
                  <video
                    key={`video-${poster._id}-${isActive}`}
                    data-poster-id={poster._id}
                    src={poster.media}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                  />
                ) : (
                  <img
                    src={poster.media}
                    alt="Poster"
                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                  />
                )}
              </div>
            );
          })}
        </div>

        {posters.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-20"
              aria-label="Previous poster"
            >
              <ChevronLeft className="w-6 h-6 text-blue-900" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-20"
              aria-label="Next poster"
            >
              <ChevronRight className="w-6 h-6 text-blue-900" />
            </button>
          </>
        )}
      </div>

      <div className="flex-1 text-center z-10 max-w-2xl">
        <p className="text-gray-700 text-lg">{currentPoster.caption}</p>
      </div>

      {posters.length > 1 && (
        <div className="flex gap-2 justify-center z-10">
          {posters.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "bg-red-600 w-8 h-2.5"
                  : "bg-blue-300 hover:bg-blue-400 w-2.5 h-2.5"
              }`}
              aria-label={`Go to poster ${index + 1}`}
            />
          ))}
        </div>
      )}

      {posters.length > 1 && (
        <div className="text-sm text-blue-900 font-medium z-10">
          {currentIndex + 1} / {posters.length}
        </div>
      )}
    </section>
  );
};

export default PosterOfTheDay;
