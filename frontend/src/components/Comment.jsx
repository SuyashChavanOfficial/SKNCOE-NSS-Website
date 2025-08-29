import moment from "moment";
import React, { useEffect, useState } from "react";

const Comment = ({ comment }) => {
  const [user, setUser] = useState({});
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/user/${comment.userId}`);

        const data = await res.json();

        if (res.ok) {
          setUser(data);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    getUser();
  }, [comment.userId]);
  return (
    <div className="flex p-4 border-b border-slate-300 text-sm gap-2">
      <div className="flex-shrink-0 mr-0">
        <img
          src={user.profilePicture}
          alt={user.username}
          className="w-10 h-10 rounded-full bg-gray-200 object-cover"
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span className="font-semibold mr-1 text-sm truncate">
            {user ? `@${user.username}` : "Unknown"}
          </span>

          <span className="text-gray-500 text-sm">
            {moment(comment.createdAt).fromNow()}
          </span>
        </div>

        <p className="text-slate-600 pb-2">{comment.content}</p>
      </div>
    </div>
  );
};

export default Comment;
