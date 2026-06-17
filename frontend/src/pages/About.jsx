import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] flex flex-col items-center transition-colors duration-300">
      {/* Content Section  */}
      <div className="w-full max-w-6xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
          {/* Left */}
          <div className="">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Who we are?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed ">
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
      <div className="w-full bg-red-50 dark:bg-[#1a0d0d] py-12 px-4 transition-colors duration-300">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center mb-8">
          Our Inspiration
        </h2>

        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/4140/4140039.png"
              alt="Principal Image"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Dr. Arvind Deshpande
            </h3>
            <p className="text-gray-500 dark:text-gray-400">Principal</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/4140/4140051.png"
              alt="Vice-Principal Image"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Dr. Achala Deshmukh
            </h3>
            <p className="text-gray-500 dark:text-gray-400">Vice-Principal</p>
          </div>
        </div>
      </div>

      {/* Program Officers Section  */}
      <div className="w-full bg-blue-50 dark:bg-[#0d1520] py-12 px-4 transition-colors duration-300">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center mb-8">
          Our Program Officers
        </h2>

        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/4140/4140039.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Dr. Sanjay Kumar Pingat
            </h3>
            <p className="text-gray-500 dark:text-gray-400">Program Officer</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/4140/4140051.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Prof. Bhoomi Patil
            </h3>
            <p className="text-gray-500 dark:text-gray-400">Program Officer</p>
          </div>

          <div className="text-center w-[45%] md:w-[30%]">
            <img
              src="https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
              alt="Team Member"
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Prof. Ghanshyam Firme
            </h3>
            <p className="text-gray-500 dark:text-gray-400">Staff Coordinator</p>
          </div>
        </div>
      </div>

      {/* Working Committee Section */}
      <div className="w-full bg-red-50 dark:bg-[#1a0d0d] py-12 px-4 transition-colors duration-300">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center mb-8">
          Our Working Committee
        </h2>

        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          {[
            { name: "Shashank Malwade", role: "Discipline Head", icon: "https://cdn-icons-png.flaticon.com/128/4140/4140039.png" },
            { name: "Shruti Ganbote", role: "Documentation Head", icon: "https://cdn-icons-png.flaticon.com/128/4140/4140051.png" },
            { name: "Pratiksha Udgirkar", role: "Documentation Head", icon: "https://cdn-icons-png.flaticon.com/128/2347/2347320.png" },
            { name: "Vedant Kadam", role: "Social Media Head", icon: "https://cdn-icons-png.flaticon.com/128/3135/3135715.png" },
            { name: "Vedika Chogale", role: "Social Media Head", icon: "https://cdn-icons-png.flaticon.com/128/6997/6997662.png" },
            { name: "Soham Dunake", role: "Finance & Goods Head", icon: "https://cdn-icons-png.flaticon.com/128/18269/18269822.png" },
            { name: "Rana Wadmare", role: "Sponsorship Head", icon: "https://cdn-icons-png.flaticon.com/128/18269/18269822.png" },
            { name: "Amruta Nannavare", role: "Cultural Head", icon: "https://cdn-icons-png.flaticon.com/128/2347/2347320.png" },
            { name: "Vaishnavi Kharade", role: "Cultural Head", icon: "https://cdn-icons-png.flaticon.com/128/6997/6997662.png" },
          ].map((member) => (
            <div key={member.name} className="text-center w-[45%] md:w-[30%]">
              <img src={member.icon} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{member.name}</h3>
              <p className="text-gray-500 dark:text-gray-400">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Advisory Committee Section */}
      <div className="w-full py-12 bg-blue-50 dark:bg-[#0d1520] px-4 transition-colors duration-300">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center mb-8">
          Our Advisory Committee
        </h2>

        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          {[
            { name: "Suyash Chavan", role: "Discipline Head", icon: "https://cdn-icons-png.flaticon.com/128/4140/4140039.png" },
            { name: "Harshada Samane", role: "Documentation Head", icon: "https://cdn-icons-png.flaticon.com/128/4140/4140051.png" },
            { name: "Prathamesh Patil", role: "Social Media Head", icon: "https://cdn-icons-png.flaticon.com/128/3135/3135715.png" },
            { name: "Prashant Goushetwar", role: "Goods Head", icon: "https://cdn-icons-png.flaticon.com/128/18269/18269822.png" },
            { name: "Trishna Khadgi", role: "Sponsorship Head", icon: "https://cdn-icons-png.flaticon.com/128/2347/2347320.png" },
            { name: "Krishna Nartam", role: "Cultural Head", icon: "https://cdn-icons-png.flaticon.com/128/14663/14663189.png" },
          ].map((member) => (
            <div key={member.name} className="text-center w-[45%] md:w-[30%]">
              <img src={member.icon} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{member.name}</h3>
              <p className="text-gray-500 dark:text-gray-400">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
