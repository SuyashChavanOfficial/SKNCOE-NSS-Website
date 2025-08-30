import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import Comment from "../shared/Comment";
import { Textarea } from "../ui/textarea";

const CommentSection = ({ postId }) => {
  const { currentUser } = useSelector((state) => state.user);

  const { toast } = useToast();
  const navigate = useNavigate();

  const [comment, setComment] = useState("");
  const [allComments, setAllComments] = useState([]);

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
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: "Comment added Successfully." });
        setComment("");
        setAllComments([data, ...allComments]);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Something went wrong while adding comment. Please Try Again!",
      });
    }
  };

  useEffect(() => {
    const getComments = async () => {
      try {
        const res = await fetch(`/api/comment/getPostComments/${postId}`);

        if (res.ok) {
          const data = await res.json();
          setAllComments(data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getComments();
  }, [postId]);

  const handleLike = async (commentId) => {
    try {
      if (!currentUser) {
        navigate("/sign-in");
        return;
      }

      const res = await fetch(`/api/comment/likeComment/${commentId}`, {
        method: "PUT",
      });

      if (res.ok) {
        const data = await res.json();
        setAllComments(
          allComments.map((c) => (c._id === commentId ? data : c))
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEdit = (updatedComment) => {
    setAllComments(
      allComments.map((c) =>
        c._id === updatedComment._id ? updatedComment : c
      )
    );
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

      {allComments.length === 0 ? (
        <p className="text-sm my-5">No Comments yet!</p>
      ) : (
        <>
          <div className="text-sm my-5 flex items-center gap-1 font-semibold">
            <p>Comments</p>
            <div className="border border-gray-200 py-1 px-2 rounded-sm">
              <p>{allComments.length}</p>
            </div>
          </div>

          {allComments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              onLike={handleLike}
              onEdit={handleEdit}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default CommentSection;
