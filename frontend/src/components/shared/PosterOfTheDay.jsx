import React, { useEffect, useState } from "react";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const PosterOfTheDay = () => {
  const [poster, setPoster] = useState(null);

  useEffect(() => {
    const fetchPoster = async () => {
      try {
        const res = await fetch(`${API_URL}/api/poster/today`);
        const data = await res.json();

        if (res.ok && data.poster) {
          setPoster(data.poster);
        }
      } catch (error) {
        console.log("Error fetching poster:", error);
      }
    };

    fetchPoster();
  }, []);

  if (!poster) return null;

  // Get formatted date with properly aligned superscript
  const getFormattedDate = (date) => {
    const day = format(date, "d");
    const monthYear = format(date, "MMMM, yyyy");

    // Determine ordinal suffix
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

  const formattedDate = getFormattedDate(new Date(poster.date));

  return (
    <section className="mx-auto my-10 p-6 bg-blue-50 rounded-lg shadow-md flex flex-col items-center gap-6">
      <div className="flex-1 text-center">
        <h2 className="text-4xl font-bold text-red-600 mb-2">
          Poster of the Day
        </h2>
        <p className="italic mb-4">{formattedDate}</p>
      </div>

      {/* Render image or video based on mediaType */}
      <div className="w-full md:w-1/2 h-[500px] rounded-lg overflow-hidden flex items-center justify-center">
        {poster.mediaType === "video" ? (
          <video
            src={poster.media}
            autoPlay
            loop
            muted
            playsInline
            className="max-h-full max-w-full object-contain rounded-lg"
          />
        ) : (
          <img
            src={poster.media}
            alt="Poster of the Day"
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>

      <div className="flex-1 text-center">
        <p className="text-gray-700 text-lg">{poster.caption}</p>
      </div>
    </section>
  );
};

export default PosterOfTheDay;
