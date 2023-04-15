import styles from "../../styles/Admin.module.css";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import AuthCheck from "../../components/AuthCheck";
import ImageUploader from "../../components/ImageUploader";
import { supaClient } from "../../supa-client";
import { SupashipUserInfo } from "../../lib/hooks";
import { User } from "@supabase/supabase-js";
import { POST } from "../../database.types";

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
  const [contentTipTap, setContentTipTap] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: contentTipTap,
    onCreate({ editor }) {
      console.log("onCreate editor.getText()", editor.getText());
      console.log("onCreate editor.getHTML()", editor.getHTML());
    },
    onUpdate({ editor }) {
      // The content has changed.
      console.log("onUpdate editor.getText()", editor.getText());
      console.log("onUpdate editor.getHTML()", editor.getHTML());
    },
    onTransaction({ editor, transaction }) {
      // The editor state has changed.
      console.log(
        "onTransaction editor.getText() transaction",
        editor.getText(),
        transaction
      );
    },
  });

  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    fetchUserAndAdminPost();
  }, []);

  async function fetchUserAndAdminPost() {
    const {
      data: { user },
    } = await supaClient.auth.getUser();

    setUser(user);

    let { data: adminPosts, error } = await supaClient
      .from("posts")
      .select("*")
      .eq("uid", user?.id)
      .like("slug", slug as string);

    const [adminPost] = adminPosts;

    setPost(adminPost);
    setContentTipTap(adminPost?.content);

    return user;
  }

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section className="p-3 dark:text-blog-white">
            <p className="text-3xl font-sans">{post?.title}</p>
            <p className="p-1 text-md font-mono">Article ID: {post?.slug}</p>

            <EditorContent editor={editor} />
            <PostForm defaultValues={post} preview={preview} editor={editor} />
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

function PostForm({ defaultValues, preview, editor }) {
  const { register, handleSubmit, reset, watch, formState } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const router = useRouter();
  const { slug } = router.query;

  const selectUser = (state: RootState) => state.users;
  const { userInfo } = useSelector(selectUser);
  const { profile, session } = userInfo;

  useEffect(() => {
    if (!editor) {
      return null;
    }
    editor.commands.setContent(defaultValues?.content);
  });

  if (!editor) {
    return null;
  }

  // editor.commands.insertContent(defaultValues?.content);

  const { isValid, isDirty, errors } = formState;

  const updatePost = async ({ content, published }) => {
    const { data, error } = await supaClient
      .from("posts")
      .update({
        content: content,
        published: published,
        updated_at: new Date().toISOString(),
      })
      .eq("uid", profile?.id)
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
          className="dark:bg-blog-white dark:text-blog-black"
          {...register("content", {
            maxLength: { value: 20000, message: "content is too long" },
            minLength: { value: 10, message: "content is too short" },
            required: { value: true, message: "content is required" },
          })}
        ></textarea>

        {errors && errors.content && (
          <p className="text-danger">{errors.content.message}</p>
        )}

        <div className="flex flex-row gap-2 flex-wrap">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={
              editor.isActive("bold")
                ? "is-active font-bold p-2 bg-hit-pink-500 text-blog-black rounded-lg"
                : "p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            }
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={
              editor.isActive("italic")
                ? "is-active font-bold p-2 bg-hit-pink-500 text-blog-black rounded-lg"
                : "p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            }
          >
            italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={
              editor.isActive("strike")
                ? "is-active font-bold p-2 bg-hit-pink-500 text-blog-black rounded-lg"
                : "p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            }
          >
            strike
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={
              editor.isActive("code")
                ? "is-active font-bold p-2 bg-hit-pink-500 text-blog-black rounded-lg"
                : "p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            }
          >
            code
          </button>
          <button
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            className="p-2 bg-hit-pink-500 text-blog-black rounded-lg"
          >
            clear marks
          </button>
          <button
            onClick={() => editor.chain().focus().clearNodes().run()}
            className="p-2 bg-hit-pink-500 text-blog-black rounded-lg"
          >
            clear nodes
          </button>
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={
              editor.isActive("paragraph")
                ? "is-active font-bold p-2 bg-hit-pink-500 text-blog-black rounded-lg"
                : "p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            }
          >
            paragraph
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={
              editor.isActive("heading", { level: 1 })
                ? "is-active font-bold p-2 bg-hit-pink-500 text-blog-black rounded-lg"
                : "p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            }
          >
            h1
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={
              editor.isActive("heading", { level: 2 })
                ? "is-active font-bold p-2 bg-hit-pink-500 text-blog-black rounded-lg"
                : "p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            }
          >
            h2
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={
              editor.isActive("heading", { level: 3 })
                ? "is-active font-bold p-2 bg-hit-pink-500 text-blog-black rounded-lg"
                : "p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            }
          >
            h3
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 4 }).run()
            }
            className={
              editor.isActive("heading", { level: 4 })
                ? "is-active font-bold p-2 bg-hit-pink-500 text-blog-black rounded-lg"
                : "p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            }
          >
            h4
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 5 }).run()
            }
            className={
              editor.isActive("heading", { level: 5 })
                ? "is-active font-bold p-2 bg-hit-pink-500 text-blog-black rounded-lg"
                : "p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            }
          >
            h5
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 6 }).run()
            }
            className={
              editor.isActive("heading", { level: 6 })
                ? "is-active font-bold p-2 bg-hit-pink-500 text-blog-black rounded-lg"
                : "p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            }
          >
            h6
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={
              editor.isActive("bulletList")
                ? "is-active font-bold p-2 bg-hit-pink-500 text-blog-black rounded-lg"
                : "p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            }
          >
            bullet list
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={
              editor.isActive("orderedList")
                ? "is-active font-bold p-2 bg-hit-pink-500 text-blog-black rounded-lg"
                : "p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            }
          >
            ordered list
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={
              editor.isActive("codeBlock")
                ? "is-active font-bold p-2 bg-hit-pink-500 text-blog-black rounded-lg"
                : "p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            }
          >
            code block
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={
              editor.isActive("blockquote")
                ? "is-active font-bold p-2 bg-hit-pink-500 text-blog-black rounded-lg"
                : "p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            }
          >
            blockquote
          </button>
          <button
            className="p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            horizontal rule
          </button>
          <button
            className="p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            onClick={() => editor.chain().focus().setHardBreak().run()}
          >
            hard break
          </button>
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 bg-hit-pink-500 text-blog-black rounded-lg"
          >
            undo
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 bg-hit-pink-500 text-blog-black rounded-lg"
          >
            redo
          </button>
          <button
            onClick={() => editor.chain().focus().setColor("#958DF1").run()}
            className={
              editor.isActive("textStyle", { color: "#958DF1" })
                ? "is-active font-bold p-2 bg-hit-pink-500 text-blog-black rounded-lg"
                : "p-2 bg-hit-pink-500 text-blog-black rounded-lg"
            }
          >
            purple
          </button>
        </div>

        <fieldset className="flex gap-x-2">
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
