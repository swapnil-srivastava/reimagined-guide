import React, { useState, useEffect } from "react";

// Next
import { useRouter } from "next/router";
import Link from "next/link";

// React Toast
import toast from "react-hot-toast";

// Redux
import { useSelector } from "react-redux";

// TipTap
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// Icons
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

// Postmark
import * as postmark from "postmark";

// Styles
import styles from "../../styles/Admin.module.css";

// React Components
import AuthCheck from "../../components/AuthCheck";
import ImageUploader from "../../components/ImageUploader";
import AudioUploader from "../../components/AudioUploader";
import Metatags from "../../components/Metatags";
import BasicTooltip from "../../components/Tooltip";

// Supabase
import { supaClient } from "../../supa-client";

// Interfaces
import { User } from "@supabase/supabase-js";
import { POST } from "../../database.types";
import { RootState } from "../../lib/interfaces/interface";

// Services
import { sendEmail } from "../../services/email.service";

// Library
import { generateMetaDescription } from "../../lib/library";

// Admin Slug Schema
import schema from "../../lib/adminSlug/adminSlugSchema.json";
import uischema from "../../lib/adminSlug/uiAdminSlugSchema.json";

// JSON Forms
import { JsonForms } from "@jsonforms/react";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";

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
    <>
      <Metatags
        title={post?.title}
        description={generateMetaDescription(post?.content)}
      />
      <main className={styles.container}>
        {post && (
          <>
            <section className="p-3 flex flex-col dark:text-blog-white gap-2">
              <p className="text-3xl font-sans self-center">{post?.title}</p>
              <p className="p-1 text-md font-mono self-center">
                Article ID: {post?.slug}
              </p>

              <PostForm
                defaultValues={post}
                preview={preview}
                editor={editor}
              />
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
    </>
  );
}

interface JSON_TECH {
  published: boolean;
  videoLink: string;
}

function PostForm({ defaultValues, preview, editor }) {
  const [data, setData] = useState<JSON_TECH>({
    published: defaultValues?.published,
    videoLink: defaultValues.videoLink,
  });
  const [jsonErrors, setJsonErrors] = useState([]);
  const [audioFileName, setAudioFileName] = useState(""); // If no audio file then set empty string

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

  const changedJsonSchema = async (jsonData, jsonError) => {
    setJsonErrors(jsonError);
    setData(jsonData);
  };

  const updatePost = async () => {
    const contentEditor = editor.getHTML();

    const { data: dataUpdate, error } = await supaClient
      .from("posts")
      .update({
        content: contentEditor,
        published: data?.published,
        audio: audioFileName,
        videoLink: data?.videoLink,
        updated_at: new Date().toISOString(),
      })
      .eq("uid", profile?.id)
      .eq("slug", slug);
    const articleURL = `https://swapnilsrivastava.eu/approve/${defaultValues?.slug}`;

    const emailMessage: Partial<postmark.Message> = {
      To: "contact@swapnilsrivastava.eu",
      Subject: "Hello new article has been created / updated",
      HtmlBody: `<strong>Hello</strong> Swapnil Srivastava, new article is updated or published on your website, navigate to approve the article ${articleURL}`,
    };

    sendEmail(emailMessage);

    toast.success("Post updated successfully!");
  };

  return (
    <>
      {preview && (
        <div
          className="drop-shadow-xl admin-content"
          dangerouslySetInnerHTML={{ __html: defaultValues?.content }}
        ></div>
      )}

      {!preview && (
        <>
          <div className="flex flex-col gap-2 lg:px-36">
            {/* Tiptap buttons bar to edit the text */}
            <div className="flex flex-wrap gap-2 text-sm font-light">
              <BasicTooltip title="Bold" placement="top">
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
              </BasicTooltip>
              <BasicTooltip title="Italic" placement="top">
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
              </BasicTooltip>
              <BasicTooltip title="Strikethrough" placement="top">
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
              </BasicTooltip>
              <BasicTooltip title="Code" placement="top">
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
              </BasicTooltip>
              <BasicTooltip title="clear marks" placement="top">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().unsetAllMarks().run()}
                  className={styles.btnEditor}
                >
                  clear marks
                </button>
              </BasicTooltip>
              <BasicTooltip title="clear nodes" placement="top">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().clearNodes().run()}
                  className={styles.btnEditor}
                >
                  clear nodes
                </button>
              </BasicTooltip>
              <BasicTooltip title="Paragraph" placement="top">
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
              </BasicTooltip>
              <BasicTooltip title="Heading 1" placement="top">
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
              </BasicTooltip>
              <BasicTooltip title="Heading 2" placement="top">
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
              </BasicTooltip>
              <BasicTooltip title="Heading 3" placement="top">
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
              </BasicTooltip>
              <BasicTooltip title="Heading 4" placement="top">
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
              </BasicTooltip>
              <BasicTooltip title="Heading 5" placement="top">
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
              </BasicTooltip>
              <BasicTooltip title="Heading 6" placement="top">
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
              </BasicTooltip>
              <BasicTooltip title="Unordered List" placement="top">
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  className={
                    editor.isActive("bulletList")
                      ? `is-active ${styles.btnEditorActive}`
                      : styles.btnEditor
                  }
                >
                  <FontAwesomeIcon icon={faListUl} />
                </button>
              </BasicTooltip>
              <BasicTooltip title="Ordered List" placement="top">
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  className={
                    editor.isActive("orderedList")
                      ? `is-active ${styles.btnEditorActive}`
                      : styles.btnEditor
                  }
                >
                  <FontAwesomeIcon icon={faListOl} />
                </button>
              </BasicTooltip>
              <BasicTooltip title="Code Block" placement="top">
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
              </BasicTooltip>
              <BasicTooltip title="Block Quote" placement="top">
                <button
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
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
              </BasicTooltip>
              <BasicTooltip title="Horizontal Rule" placement="top">
                <button
                  type="button"
                  className={styles.btnEditor}
                  onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                  }
                >
                  <FontAwesomeIcon icon={faWindowMinimize} />
                </button>
              </BasicTooltip>
              <BasicTooltip title="Break" placement="top">
                <button
                  type="button"
                  className={styles.btnEditor}
                  onClick={() => editor.chain().focus().setHardBreak().run()}
                >
                  br
                </button>
              </BasicTooltip>
              <BasicTooltip title="Undo" placement="top">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().chain().focus().undo().run()}
                  className={styles.btnEditor}
                >
                  <FontAwesomeIcon icon={faRotateLeft} />
                </button>
              </BasicTooltip>
              <BasicTooltip title="Redo" placement="top">
                <button
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().chain().focus().redo().run()}
                  className={styles.btnEditor}
                >
                  <FontAwesomeIcon icon={faRotateRight} />
                </button>
              </BasicTooltip>
            </div>

            {/*  Audio Upload */}
            <div className="">
              <AudioUploader
                getAudioFileName={(fileName) => setAudioFileName(fileName)}
              />
            </div>

            {/*  Editor Content which is changed by tiptap controls  */}
            <EditorContent editor={editor} />

            <JsonForms
              schema={schema}
              uischema={uischema}
              data={data}
              renderers={materialRenderers}
              cells={materialCells}
              onChange={({ errors, data }) => changedJsonSchema(data, errors)}
            />

            <button
              type="button"
              className="p-2 bg-hit-pink-500 text-blog-black rounded-lg self-center"
              disabled={
                Array.isArray(jsonErrors) &&
                jsonErrors !== undefined &&
                jsonErrors.length !== 0
              }
              onClick={() => updatePost()}
            >
              Save Changes
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default AdminSlug;
