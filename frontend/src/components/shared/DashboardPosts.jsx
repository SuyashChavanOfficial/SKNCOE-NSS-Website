import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Link } from "react-router-dom";

const DashboardPosts = () => {
  const { currentUser } = useSelector((state) => state.user);

  const [userPosts, setUserPosts] = useState([]);
  console.log(userPosts);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/post/getposts`);
        const data = await res.json();

        if (res.ok) {
          setUserPosts(data.posts);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (currentUser.isAdmin) {
      fetchPost();
    }
  }, [currentUser._id]);

  return (
    <div className="flex flex-col items-center justify-center w-full p-3">
      {currentUser.isAdmin && userPosts.length > 0 ? (
        <>
          <Table>
            <TableCaption>
              A list of your recent published articles.
            </TableCaption>

            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Date Updated</TableHead>
                <TableHead>Post Image</TableHead>
                <TableHead>Post Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Delete</TableHead>
                <TableHead>Edit</TableHead>
              </TableRow>
            </TableHeader>
            {userPosts.map((post) => (
              <TableBody className="divide-y">
                <TableRow key={post._id}>
                  {/* for updated date  */}
                  <TableCell>
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </TableCell>

                  {/* for image  */}
                  <TableCell>
                    <Link to={`/post/${post.slug}`}>
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-20 h-10 object-cover bg-gray-500"
                      />
                    </Link>
                  </TableCell>

                  {/* For title  */}
                  <TableCell>
                    <Link to={`/post/${post.slug}`}>{post.title}</Link>
                  </TableCell>

                  {/* For Category  */}
                  <TableCell>
                    <Link to={`/post/${post.slug}`}>{post.category}</Link>
                  </TableCell>

                  <TableCell>
                    <span className="font-medium text-red-500 hover:underline cursor-pointer">
                      Delete
                    </span>
                  </TableCell>

                  <TableCell>
                    <Link
                      to={`/update-post/${post._id}`}
                      className="font-medium text-green-600 hover:underline cursor-pointer"
                    >
                      <span>Edit</span>
                    </Link>
                  </TableCell>
                </TableRow>
              </TableBody>
            ))}
          </Table>
        </>
      ) : (
        <p>You have no post yet</p>
      )}
    </div>
  );
};

export default DashboardPosts;
