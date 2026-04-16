import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback } from "react";
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Undo, Redo
} from "lucide-react";

type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
};

function ToolBtn({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded text-sm transition-colors ${active ? "bg-primary text-white" : "hover:bg-muted text-foreground"}`}
    >
      {children}
    </button>
  );
}

export default function RichEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder ?? "Rédigez votre article ici..." }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL du lien", prev ?? "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const btn = (active: boolean, fn: () => void, title: string, Icon: React.ElementType) => (
    <ToolBtn key={title} active={active} onClick={fn} title={title}>
      <Icon className="w-4 h-4" />
    </ToolBtn>
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/20">
        {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), "Gras", Bold)}
        {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), "Italique", Italic)}
        {btn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), "Souligné", UnderlineIcon)}
        {btn(editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), "Barré", Strikethrough)}

        <div className="w-px h-5 bg-border mx-1" />

        {btn(editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), "Titre 1", Heading1)}
        {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "Titre 2", Heading2)}
        {btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "Titre 3", Heading3)}

        <div className="w-px h-5 bg-border mx-1" />

        {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), "Liste à puces", List)}
        {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), "Liste numérotée", ListOrdered)}
        {btn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), "Citation", Quote)}
        {btn(false, () => editor.chain().focus().setHorizontalRule().run(), "Séparateur", Minus)}

        <div className="w-px h-5 bg-border mx-1" />

        {btn(editor.isActive({ textAlign: "left" }), () => editor.chain().focus().setTextAlign("left").run(), "Aligner à gauche", AlignLeft)}
        {btn(editor.isActive({ textAlign: "center" }), () => editor.chain().focus().setTextAlign("center").run(), "Centrer", AlignCenter)}
        {btn(editor.isActive({ textAlign: "right" }), () => editor.chain().focus().setTextAlign("right").run(), "Aligner à droite", AlignRight)}

        <div className="w-px h-5 bg-border mx-1" />

        {btn(editor.isActive("link"), setLink, "Insérer un lien", LinkIcon)}

        <div className="w-px h-5 bg-border mx-1" />

        {btn(false, () => editor.chain().focus().undo().run(), "Annuler", Undo)}
        {btn(false, () => editor.chain().focus().redo().run(), "Rétablir", Redo)}
      </div>

      {/* Content */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[320px] focus-within:outline-none font-sans text-sm leading-relaxed [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
      />
    </div>
  );
}
