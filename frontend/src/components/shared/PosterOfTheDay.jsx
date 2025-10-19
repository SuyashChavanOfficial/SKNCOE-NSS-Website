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

  const formattedDate = format(new Date(poster.date), "do MMMM, yyyy");

  return (
    <section className="max-w-7xl mx-auto my-10 p-6 bg-yellow-50 rounded-lg shadow-md flex flex-col md:flex-row items-center gap-6">
      <img
        src={poster.image}
        alt="Poster of the Day"
        className="w-full md:w-1/2 h-auto object-cover rounded-lg shadow-lg"
      />
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Poster of the Day
        </h2>
        <p className="text-gray-600 italic mb-4">{formattedDate}</p>
        <p className="text-gray-700 text-lg">{poster.caption}</p>
      </div>
    </section>
  );
};

export default PosterOfTheDay;
