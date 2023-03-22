import styles from "../../styles/Admin.module.css";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

import AuthCheck from "../../components/AuthCheck";
import { serverTimestamp } from "../../lib/firebase";
import ImageUploader from "../../components/ImageUploader";
import { supaClient } from "../../supa-client";
import { SupashipUserInfo } from "../../lib/hooks";
import { User } from "@supabase/supabase-js";
import { Database } from "../../database.types";

type TABLES = Pick<Database["public"], "Tables">;
type POST_TABLE = Pick<TABLES["Tables"], "posts">;
type POST_ROW = Pick<POST_TABLE["posts"], "Row">;
type POST = Pick<
  POST_ROW["Row"],
  | "approved"
  | "content"
  | "created_at"
  | "heartcount"
  | "heartid"
  | "id"
  | "photo_url"
  | "published"
  | "slug"
  | "title"
  | "uid"
  | "updated_at"
  | "username"
>;

interface RootState {
  counter: Object;
  users: UserState;
}

interface UserState {
  user: {
    uid: String;
  };
  username: any;
  userInfo: SupashipUserInfo;
}

// e.g. localhost:3000/admin/page1
// e.g. localhost:3000/admin/page2

function AdminSlug() {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
}

function PostManager() {
  const [preview, setPreview] = useState(false);
  const [user, setUser] = useState<User>();
  const [post, setPost] = useState<POST>();

  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchAdminPost();
  }, [user]);

  async function fetchUser() {
    const {
      data: { user },
    } = await supaClient.auth.getUser();

    setUser(user);
    return user;
  }

  async function fetchAdminPost() {
    let { data: adminPosts, error } = await supaClient
      .from("posts")
      .select("*")
      .like("username", user?.id)
      .like("slug", slug as string);

    const [adminPost] = adminPosts;

    setPost(adminPost);
  }

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section className="p-3">
            <p className="text-3xl font-sans">{post?.title}</p>
            <p className="p-1 text-md font-mono">Article ID: {post?.slug}</p>

            <PostForm defaultValues={post} preview={preview} />
          </section>

          <aside className="p-3">
            <p className="text-xl font-light dark:text-blog-white">Tools</p>
            <button
              className="p-2 m-1 bg-hit-pink-500 text-blog-black rounded-lg"
              onClick={() => setPreview(!preview)}
            >
              {preview ? "Edit" : "Preview"}
            </button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="p-2 m-1 bg-hit-pink-500 text-blog-black rounded-lg">
                Live view
              </button>
            </Link>
          </aside>
        </>
      )}
    </main>
  );
}

function PostForm({ defaultValues, preview }) {
  const { register, handleSubmit, reset, watch, formState } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const router = useRouter();
  const { slug } = router.query;

  // TS infers type: (state: RootState) => boolean
  const selectUser = (state: RootState) => state.users;
  const { user: currentUser, username, userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  const { isValid, isDirty, errors } = formState;

  const updatePost = async ({ content, published }) => {
    const { data, error } = await supaClient
      .from("posts")
      .update({
        content: content,
        published: published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile?.id)
      .eq("slug", slug);

    reset({ content, published });

    toast.success("Post updated successfully!");
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="drop-shadow-xl">
          <ReactMarkdown>{watch("content")}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />

        <textarea
          name="content"
          {...register("content", {
            maxLength: { value: 20000, message: "content is too long" },
            minLength: { value: 10, message: "content is too short" },
            required: { value: true, message: "content is required" },
          })}
        ></textarea>

        {errors && errors.content && (
          <p className="text-danger">{errors.content.message}</p>
        )}

        <fieldset>
          <input
            name="published"
            type="checkbox"
            {...register("published", { required: true })}
          />
          <label>Published</label>
        </fieldset>

        <button
          type="submit"
          className="
          p-2 bg-hit-pink-500 text-blog-black rounded-lg"
          disabled={!isDirty || !isValid}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

export default AdminSlug;
