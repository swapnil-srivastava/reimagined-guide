import React, { useState, useEffect } from "react";

// Supabase
import { supaClient } from "../../supa-client";

// React Components
import AuthCheck from "../../components/AuthCheck";
import PostFeed from "../../components/PostFeed";

// Interfaces
import { POST } from "../../database.types";
import { User } from "@supabase/supabase-js";

function ApprovalPage() {
  return (
    <>
      <AuthCheck>
        <ApprovePostList></ApprovePostList>
      </AuthCheck>
    </>
  );
}

function ApprovePostList() {
  const [posts, setPosts] = useState<POST[]>([]);
  const [userAuth, setUserAuth] = useState<User>();
  const [isSwapnil, setIsSwapnil] = useState<User>();

  useEffect(() => {
    fetchPost();
  }, []);

  async function fetchPost() {
    const {
      data: { user },
    } = await supaClient.auth.getUser();

    setUserAuth(user);

    if (user?.id === process.env.NEXT_PUBLIC_SWAPNIL_ID) setIsSwapnil(user);

    if (user?.id === process.env.NEXT_PUBLIC_SWAPNIL_ID) {
      let { data: posts, error } = await supaClient.from("posts").select("*");

      setPosts(posts);
    }
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <h1 className="dark:text-blog-white">Approve the Posts</h1>
      </div>
      <PostFeed posts={posts} user={userAuth} isSwapnil={isSwapnil} />
    </>
  );
}

export default ApprovalPage;
