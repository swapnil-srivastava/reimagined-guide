import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

// Supabase
import { supaClient } from "../../supa-client";

// React Components
import Metatags from "../../components/Metatags";
import AuthCheck from "../../components/AuthCheck";
import PostContent from "../../components/PostContent";

// Interfaces
import { POST } from "../../database.types";
import { RootState } from "../../lib/interfaces/interface";
import { User } from "@supabase/supabase-js";

// Library
import { generateMetaDescription } from "../../lib/library";

// e.g. localhost:3000/approve/articleid

function ApproveSlug() {
  return (
    <>
      <AuthCheck>
        <PostApprover />
      </AuthCheck>
    </>
  );
}

function PostApprover() {
  const [approvalPost, setApprovalPost] = useState<POST>();
  const [isSwapnil, setIsSwapnil] = useState<User>();

  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    fetchApprovalPost();
  }, []);

  const fetchApprovalPost = async () => {
    const {
      data: { user },
    } = await supaClient.auth.getUser();

    if (user?.id === process.env.NEXT_PUBLIC_SWAPNIL_ID) setIsSwapnil(user);

    if (user?.id === process.env.NEXT_PUBLIC_SWAPNIL_ID) {
      if (!slug) return;
      let { data: posts, error } = await supaClient
        .from("posts")
        .select("*")
        .like("slug", slug as string);

      const [firstPost] = posts;

      setApprovalPost(firstPost);
    }
  };

  return (
    <>
      <main className="flex justify-center">
        <Metatags
          title={approvalPost?.title}
          description={generateMetaDescription(approvalPost?.content)}
        />
        {approvalPost && (
          <section className="basis-2/3 p-3">
            <PostContent
              post={approvalPost}
              approve={
                isSwapnil?.id === process.env.NEXT_PUBLIC_SWAPNIL_ID
                  ? true
                  : false
              }
            />
          </section>
        )}
      </main>
    </>
  );
}
export default ApproveSlug;
