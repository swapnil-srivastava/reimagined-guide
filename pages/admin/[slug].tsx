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

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faItalic,
  faBold,
  faStrikethrough,
  faCode,
  faHeading,
  fa1,
  fa2,
  fa3,
  fa4,
  fa5,
  fa6,
  faListUl,
  faListOl,
  faWindowMinimize,
  faRotateLeft,
  faRotateRight,
  faLaptopCode,
  faQuoteLeft,
  faQuoteRight,
} from "@fortawesome/free-solid-svg-icons";

import axios from "axios";

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

  const editor = useEditor({
    extensions: [StarterKit],
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

    return user;
  }

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section className="p-3 flex flex-col dark:text-blog-white gap-2">
            <p className="text-3xl font-sans self-center">{post?.title}</p>
            <p className="p-1 text-md font-mono self-center">
              Article ID: {post?.slug}
            </p>

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
  const { profile } = userInfo;

  useEffect(() => {
    if (!editor) {
      return null;
    }
    editor.commands.setContent(defaultValues?.content);
  }, []);

  if (!editor) {
    return null;
  }

  async function sendEmail() {
    const emailMessage = {
      from: "contact@swapnilsrivastava.eu",
      to: "contact@swapnilsrivastava.eu",
      subject: "Hello from Postmark",
      htmlBody: "<strong>Hello</strong> dear Postmark user.",
      textBody: "Hello from Postmark!",
      messageStream: "outbound",
    };

    try {
      const { data, status } = await axios.post(
        "/api/sendemail",
        emailMessage,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(`Email sent`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("error message: ", error.message);
        toast.success("Axios Error SMS");

        return error.message;
      } else {
        console.log("unexpected error: ", error);
        toast.success("Error SMS");

        return "An unexpected error occurred";
      }
    }
  }

  async function callNestApi() {
    try {
      const { data, status } = await axios.get(
        "https://reimagined-octo-potato-smoky.vercel.app/sendemail",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(`Called Nest JS Hello World ${data}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("error message: ", error.message);
        toast.error("Axios Nest JS ");
        return error.message;
      } else {
        console.log("unexpected error: ", error);
        toast.error("Error Nest JS");
        return "An unexpected error occurred";
      }
    }
  }

  const { isValid, isDirty, errors } = formState;

  const updatePost = async ({ content, published }) => {
    const contentEditor = editor.getHTML();

    const { data, error } = await supaClient
      .from("posts")
      .update({
        content: contentEditor,
        published: published,
        updated_at: new Date().toISOString(),
      })
      .eq("uid", profile?.id)
      .eq("slug", slug);

    reset({ content, published });

    sendEmail();

    callNestApi();

    toast.success("Post updated successfully!");
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div
          className="drop-shadow-xl admin-content"
          dangerouslySetInnerHTML={{ __html: defaultValues?.content }}
        ></div>
      )}

      {!preview && (
        <div className="flex flex-col gap-2 lg:px-36">
          {/* <ImageUploader /> */}

          <div className="flex flex-wrap gap-2 text-sm font-light">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={
                editor.isActive("bold")
                  ? `is-active ${styles.btnEditorActive}`
                  : styles.btnEditor
              }
            >
              <FontAwesomeIcon icon={faBold} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={
                editor.isActive("italic")
                  ? `is-active ${styles.btnEditorActive}`
                  : styles.btnEditor
              }
            >
              <FontAwesomeIcon icon={faItalic} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              className={
                editor.isActive("strike")
                  ? `is-active ${styles.btnEditorActive}`
                  : styles.btnEditor
              }
            >
              <FontAwesomeIcon icon={faStrikethrough} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={!editor.can().chain().focus().toggleCode().run()}
              className={
                editor.isActive("code")
                  ? `is-active ${styles.btnEditorActive}`
                  : styles.btnEditor
              }
            >
              <FontAwesomeIcon icon={faCode} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
              className={styles.btnEditor}
            >
              clear marks
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().clearNodes().run()}
              className={styles.btnEditor}
            >
              clear nodes
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={
                editor.isActive("paragraph")
                  ? `is-active ${styles.btnEditorActive}`
                  : styles.btnEditor
              }
            >
              P
            </button>
            <button
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={
                editor.isActive("heading", { level: 1 })
                  ? `is-active ${styles.btnEditorActive}`
                  : styles.btnEditor
              }
            >
              <FontAwesomeIcon icon={faHeading} />
              <FontAwesomeIcon icon={fa1} />
            </button>
            <button
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={
                editor.isActive("heading", { level: 2 })
                  ? `is-active ${styles.btnEditorActive}`
                  : styles.btnEditor
              }
            >
              <FontAwesomeIcon icon={faHeading} />
              <FontAwesomeIcon icon={fa2} />
            </button>
            <button
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className={
                editor.isActive("heading", { level: 3 })
                  ? `is-active ${styles.btnEditorActive}`
                  : styles.btnEditor
              }
            >
              <FontAwesomeIcon icon={faHeading} />
              <FontAwesomeIcon icon={fa3} />
            </button>
            <button
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 4 }).run()
              }
              className={
                editor.isActive("heading", { level: 4 })
                  ? `is-active ${styles.btnEditorActive}`
                  : styles.btnEditor
              }
            >
              <FontAwesomeIcon icon={faHeading} />
              <FontAwesomeIcon icon={fa4} />
            </button>
            <button
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 5 }).run()
              }
              className={
                editor.isActive("heading", { level: 5 })
                  ? `is-active ${styles.btnEditorActive}`
                  : styles.btnEditor
              }
            >
              <FontAwesomeIcon icon={faHeading} />
              <FontAwesomeIcon icon={fa5} />
            </button>
            <button
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 6 }).run()
              }
              className={
                editor.isActive("heading", { level: 6 })
                  ? `is-active ${styles.btnEditorActive}`
                  : styles.btnEditor
              }
            >
              <FontAwesomeIcon icon={faHeading} />
              <FontAwesomeIcon icon={fa6} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={
                editor.isActive("bulletList")
                  ? `is-active ${styles.btnEditorActive}`
                  : styles.btnEditor
              }
            >
              <FontAwesomeIcon icon={faListUl} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={
                editor.isActive("orderedList")
                  ? `is-active ${styles.btnEditorActive}`
                  : styles.btnEditor
              }
            >
              <FontAwesomeIcon icon={faListOl} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={
                editor.isActive("codeBlock")
                  ? `is-active ${styles.btnEditorActive}`
                  : styles.btnEditor
              }
            >
              <FontAwesomeIcon icon={faLaptopCode} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={
                editor.isActive("blockquote")
                  ? `is-active ${styles.btnEditorActive}`
                  : styles.btnEditor
              }
            >
              <div className="flex gap-1">
                <FontAwesomeIcon icon={faQuoteLeft} />
                <FontAwesomeIcon icon={faQuoteRight} />
              </div>
            </button>

            <button
              type="button"
              className={styles.btnEditor}
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
              <FontAwesomeIcon icon={faWindowMinimize} />
            </button>
            <button
              type="button"
              className={styles.btnEditor}
              onClick={() => editor.chain().focus().setHardBreak().run()}
            >
              br
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className={styles.btnEditor}
            >
              <FontAwesomeIcon icon={faRotateLeft} />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className={styles.btnEditor}
            >
              <FontAwesomeIcon icon={faRotateRight} />
            </button>
          </div>

          <EditorContent editor={editor} />

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
            className="p-2 bg-hit-pink-500 text-blog-black rounded-lg self-center"
          >
            Save Changes
          </button>
        </div>
      )}
    </form>
  );
}

export default AdminSlug;
