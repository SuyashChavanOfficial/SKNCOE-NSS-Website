import React from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const Advertise = () => {
  return (
    <div className="flex flex-col md:flex-row p-3 border border-teal-600 justify-center items-center rounded-tl-3xl rounded-br-3xl text-center">
      <div className="flex-1 justify-center flex flex-col p-3 w-full md:w-3/5">
        <h2 className="text-2xl font-semibold text-wrap text-blue-600">
          Want to joining the upcoming{" "}
          <span className="text-red-600">Activities</span>?
        </h2>
        <p className="text-gray-500 my-2">Click here to know more!</p>
        <Button className="bg-blue-500 text-md mt-2 h-min">
          <Link
            to={"https://google.com"}
            target="_blank"
            rel="noopener norefferer"
            className="text-wrap"
          >
            Join Now!
          </Link>
        </Button>
      </div>
      <div className="p-7 w-full md:w-2/5">
        <img src="https://aiishmysore.in/storage/files/nss.jpg" alt="" className="w-full" />
      </div>
    </div>
  );
};

export default Advertise;
