import React, { useState, useEffect, useRef } from "react";
import { FormattedMessage } from "react-intl";

// Next
import { useRouter } from "next/router";
import Link from "next/link";

// React Toast
import toast from "react-hot-toast";

// TipTap
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import VideoEmbed from "../../lib/tiptap/VideoEmbed";

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
  faVideo,
} from "@fortawesome/free-solid-svg-icons";

// Styles
import styles from "../../styles/Admin.module.css";

// React Components
import AuthCheck from "../../components/AuthCheck";
import ImageUploader from "../../components/ImageUploader";
import AudioUploader from "../../components/AudioUploader";
import Metatags from "../../components/Metatags";
import BasicTooltip from "../../components/Tooltip";
import PostWorkflowBar from "../../components/PostWorkflowBar";
import TagInput from "../../components/TagInput";
import VideoEmbedPopover from "../../components/editor/VideoEmbedPopover";

// Supabase
import { supaClient } from "../../supa-client";

// Interfaces
import { POST_DRAFT_WITH_POST } from "../../database.types";

// Library
import { generateMetaDescription } from "../../lib/library";
import { sanitizePostHtml } from "../../lib/sanitize";

// Services
import { fetchVideoMeta } from "../../services/video.service";

// e.g. localhost:3000/admin/page1
// e.g. localhost:3000/admin/page2

import type { NextPage } from "next";

const AdminSlug: NextPage = () => {
  return (
    <div className="bg-blog-white dark:bg-fun-blue-500 min-h-screen text-blog-black dark:text-blog-white">
      <AuthCheck>
        <PostManager />
      </AuthCheck>
    </div>
  );
};

function PostManager() {
  const [preview, setPreview] = useState(false);
  const [draft, setDraft] = useState<POST_DRAFT_WITH_POST | null>(null);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      VideoEmbed.configure({ fetchMeta: fetchVideoMeta }),
    ],
    onUpdate: () => setDirty(true),
  });

  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    fetchOwnDraft();
  }, [router.isReady, slug]);

  // Only the author can load a draft: the query is scoped to their uid and
  // row level security hides everyone else's drafts.
  async function fetchOwnDraft() {
    setLoading(true);
    const {
      data: { user },
    } = await supaClient.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supaClient
      .from("post_drafts")
      .select("*, posts!inner(*)")
      .eq("uid", user.id)
      .eq("posts.slug", Array.isArray(slug) ? slug[0] : slug)
      .maybeSingle();

    if (error) toast.error(error.message);
    setDraft((data as POST_DRAFT_WITH_POST) ?? null);
    setLoading(false);
  }

  if (loading) {
    return <main className={styles.container} />;
  }

  if (!draft) {
    return (
      <main className={`${styles.container} flex flex-col items-center gap-4 p-8 text-center`}>
        <p className="text-xl">
          <FormattedMessage
            id="admin-slug-not-allowed"
            description="Shown when the post does not exist or belongs to someone else"
            defaultMessage="This post doesn't exist or you are not its author."
          />
        </p>
        <Link href="/admin" className="underline">
          <FormattedMessage
            id="admin-slug-back-to-posts"
            description="Link back to the author's posts"
            defaultMessage="Back to your posts"
          />
        </Link>
      </main>
    );
  }

  return <>
    <Metatags
      title={draft.title}
      description={generateMetaDescription(draft.content)}
    />
    <main className={styles.container}>
      <section className="p-3 flex flex-col dark:text-blog-white gap-2">
        <p className="text-3xl font-sans self-center">{draft.title}</p>
        <p className="p-1 text-md font-mono self-center">
        <FormattedMessage
          id="admin-username-article-url"
          description="Article URL : " // Description should be a string literal
          defaultMessage="Article URL : " // Message should be a string literal
          />{draft.posts?.slug}
        </p>

        <PostWorkflowBar draft={draft} dirty={dirty} onChange={setDraft} />

        <PostForm
          draft={draft}
          preview={preview}
          editor={editor}
          onSaved={(saved) => {
            setDraft(saved);
            setDirty(false);
          }}
          onDirty={() => setDirty(true)}
        />
      </section>
    </main>
  </>;
}

function PostForm({ draft, preview, editor, onSaved, onDirty }: {
  draft: POST_DRAFT_WITH_POST;
  preview: boolean;
  editor: ReturnType<typeof useEditor>;
  onSaved: (draft: POST_DRAFT_WITH_POST) => void;
  onDirty: () => void;
}) {
  const [tags, setTags] = useState<string[]>(draft.tags ?? []);
  // Empty until a new file is uploaded; the saved audio is kept otherwise
  const [audioFileName, setAudioFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [addingVideo, setAddingVideo] = useState(false);
  const videoButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!editor) {
      return null;
    }
    editor.commands.setContent(draft.content, false);
  }, [editor]);

  if (!editor) {
    return null;
  }

  // Inserting moves focus into the post; cancelling returns it to the button
  const closeVideoPanel = (inserted: boolean) => {
    setAddingVideo(false);
    if (!inserted) videoButtonRef.current?.focus();
  };

  // Saves the draft only. The live post changes when Swapnil approves it.
  const updatePost = async () => {
    setSaving(true);
    const { data: saved, error } = await supaClient
      .from("post_drafts")
      .update({
        content: sanitizePostHtml(editor.getHTML()),
        audio: audioFileName || draft.audio,
        // Drafts have no tags column until the tags migration is applied
        ...("tags" in draft ? { tags } : {}),
      })
      .eq("post_id", draft.post_id)
      .select("*, posts(*)")
      .single();
    setSaving(false);

    if (error || !saved) {
      toast.error(error?.message ?? "Could not save the post.");
      return;
    }

    setAudioFileName("");
    setTags(saved.tags ?? []);
    onSaved(saved as POST_DRAFT_WITH_POST);
    toast.success(
      saved.status !== draft.status
        ? "Changes saved. The post is back in Draft."
        : "Changes saved."
    );
  };

  return (
    <>
      {preview && (
        <div
          className="drop-shadow-xl admin-content"
          dangerouslySetInnerHTML={{ __html: sanitizePostHtml(draft.content) }}
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
                  type="button"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().chain().focus().redo().run()}
                  className={styles.btnEditor}
                >
                  <FontAwesomeIcon icon={faRotateRight} />
                </button>
              </BasicTooltip>
              <BasicTooltip title="Video" placement="top">
                <button
                  ref={videoButtonRef}
                  type="button"
                  onClick={() => setAddingVideo((open) => !open)}
                  aria-expanded={addingVideo}
                  aria-label="Add a video"
                  className={addingVideo ? styles.btnEditorActive : styles.btnEditor}
                >
                  <FontAwesomeIcon icon={faVideo} />
                </button>
              </BasicTooltip>
            </div>

            {addingVideo && (
              <VideoEmbedPopover editor={editor} onClose={closeVideoPanel} />
            )}

            {/*  Audio Upload */}
            <div className="">
              <AudioUploader
                getAudioFileName={(fileName) => {
                  setAudioFileName(fileName);
                  onDirty();
                }}
              />
            </div>

            {/*  Editor Content which is changed by tiptap controls  */}
            <EditorContent editor={editor} />

            <TagInput
              value={tags}
              onChange={(next) => {
                setTags(next);
                onDirty();
              }}
            />

            <button
              type="button"
              className="p-2 bg-hit-pink-500 text-blog-black rounded-lg self-center"
              disabled={saving}
              onClick={() => updatePost()}
            >
              <FormattedMessage
                id="admin-slug-save-btn"
                description="Save Changes" // Description should be a string literal
                defaultMessage="Save Changes" // Message should be a string literal
                />
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default AdminSlug;
