import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

const CommentSection = ({postId}) => {
  const { currentUser } = useSelector((state) => state.user);

  const { toast } = useToast();

  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (comment.length > 500) {
      toast({ title: "Comment length should be less than 500 characters." });
      return;
    }

    try {
      const res = await fetch(`/api/comment/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: comment,
          postId,
          userId: currentUser._id,
        }),
      });

      const data = await res.json()

      if(res.ok) {
        toast({title: "Comment added Successfully."})
        setComment("")
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Something went wrong while adding comment. Please Try Again!",
      });
    }
  };
  return (
    <div className="max-w-3xl mx-auto w-full p-3">
      {currentUser ? (
        <div className="flex items-center gap-1 my-5 text-gray-500 text-sm">
          <p>Signed in as: </p>
          <img
            src={currentUser.profilePicture}
            alt={currentUser.username}
            className="w-5 h-5 rounded-full object-cover"
          />
          <Link
            to={"/dashboard?tab=profile"}
            className="text-blue-800 text-sm hover:underline"
          >
            @{currentUser.username}
          </Link>
        </div>
      ) : (
        <div className="text-sm text-gray-700 my-5 flex gap-1">
          You must be signed in to comment.
          <Link to={"sign-in"} className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </div>
      )}

      {currentUser && (
        <form
          className="border-2 border-gray-400 rounded-md p-4"
          onSubmit={handleSubmit}
        >
          <Textarea
            placeholder="Add a comment..."
            rows="3"
            maxLength="500"
            className="border border-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            onChange={(e) => setComment(e.target.value)}
            value={comment}
          />

          <div className="flex justify-between items-center mt-5">
            <p className="text-gray-500 text-sm">
              {500 - comment.length} characters left.
            </p>
            <Button type="submit">Comment</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommentSection;
