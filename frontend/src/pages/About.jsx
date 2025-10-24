import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Content Section  */}
      <div className="w-full max-w-6xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
          {/* Left */}
          <div className="">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Who we are?
            </h2>
            <p className="text-gray-600 leading-relaxed ">
              We are SKNCOE NSS, the top 3 unit in Pune Division, working
              towards bringing the actual on-ground change in the society.
            </p>
          </div>

          {/* Right (image) */}
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/6647119/pexels-photo-6647119.jpeg"
              alt=""
              className="rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>

      {/* Our Inspiration  */}
      <div className="w-full bg-red-50 py-12 px-4">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Our Inspiration
        </h2>

        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/4140/4140039.png"
              alt="Principal Image"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Dr. Arvind Deshpande
            </h3>
            <p className="text-gray-500">Principal</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/4140/4140051.png"
              alt="Vice-Principal Image"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Dr. Achala Deshmukh
            </h3>
            <p className="text-gray-500">Vice-Principal</p>
          </div>
        </div>
      </div>

      {/* Program Officers Section  */}
      <div className="w-full bg-blue-50 py-12 px-4">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Our Program Officers
        </h2>

        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/4140/4140039.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Dr. Sanjay Kumar Pingat
            </h3>
            <p className="text-gray-500">Program Officer</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/4140/4140051.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Prof. Bhoomi Patil
            </h3>
            <p className="text-gray-500">Program Officer</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Prof. Ghanshyam Firme
            </h3>
            <p className="text-gray-500">Staff Coordinator</p>
          </div>
        </div>
      </div>

      {/* Working Committee Section */}
      <div className="w-full bg-red-50 py-12 px-4">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Our Working Committee
        </h2>

        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/4140/4140039.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Shashank Malwade
            </h3>
            <p className="text-gray-500">Discipline Head</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/4140/4140051.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Shruti Ganbote
            </h3>
            <p className="text-gray-500">Documentation Head</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/2347/2347320.png"
              alt="Documentation Head"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Pratiksha Udgirkar
            </h3>
            <p className="text-gray-500">Documentation Head</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Vedant Kadam
            </h3>
            <p className="text-gray-500">Social Media Head</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/6997/6997662.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Vedika Chogale
            </h3>
            <p className="text-gray-500">Social Media Head</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/18269/18269822.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Soham Dunake
            </h3>
            <p className="text-gray-500">Finance & Goods Head</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/18269/18269822.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Rana Wadmare
            </h3>
            <p className="text-gray-500">Sponsorship Head</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/2347/2347320.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Amruta Nannavare
            </h3>
            <p className="text-gray-500">Cultural Head</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/6997/6997662.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Vaishnavi Kharade
            </h3>
            <p className="text-gray-500">Cultural Head</p>
          </div>
        </div>
      </div>

      {/* Advisory Committee Section */}
      <div className="w-full py-12 bg-blue-50 px-4">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Our Advisory Committee
        </h2>

        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/4140/4140039.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Suyash Chavan
            </h3>
            <p className="text-gray-500">Discipline Head</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/4140/4140051.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Harshada Samane
            </h3>
            <p className="text-gray-500">Documentation Head</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Prathamesh Patil
            </h3>
            <p className="text-gray-500">Social Media Head</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/18269/18269822.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Prashant Goushetwar
            </h3>
            <p className="text-gray-500">Goods Head</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/2347/2347320.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Trishna Khadgi
            </h3>
            <p className="text-gray-500">Sponsorship Head</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/14663/14663189.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700">
              Krishna Nartam
            </h3>
            <p className="text-gray-500">Cultural Head</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
