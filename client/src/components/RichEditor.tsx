import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle, FontSize, FontFamily } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { useEffect, useCallback, useRef, useState } from "react";
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Undo, Redo,
  Highlighter, Palette, Type, ImageIcon,
  Youtube as YoutubeIcon, Table as TableIcon,
  AlignJustify, ChevronDown,
} from "lucide-react";

// TextDirection as a custom extension (not available as separate package in v3)
const TextDirection = Extension.create({
  name: "textDirection",
  addOptions() { return { types: ["heading", "paragraph"] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        dir: {
          default: null,
          parseHTML: (el) => el.getAttribute("dir"),
          renderHTML: (attrs) => attrs.dir ? { dir: attrs.dir } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      setTextDirection: (dir: string) => ({ commands }: any) => {
        return this.options.types.every((type: string) =>
          commands.updateAttributes(type, { dir })
        );
      },
    } as any;
  },
});

type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
};

const TEXT_COLORS = [
  { label: "Défaut", color: "" },
  { label: "Or Habari", color: "#D4A017" },
  { label: "Rouge", color: "#e53e3e" },
  { label: "Vert", color: "#38a169" },
  { label: "Bleu", color: "#3182ce" },
  { label: "Orange", color: "#dd6b20" },
  { label: "Violet", color: "#805ad5" },
  { label: "Gris", color: "#718096" },
  { label: "Blanc", color: "#ffffff" },
  { label: "Noir", color: "#1a202c" },
];

const HIGHLIGHT_COLORS = [
  { label: "Jaune", color: "#fef08a" },
  { label: "Or", color: "#fde68a" },
  { label: "Vert", color: "#bbf7d0" },
  { label: "Bleu", color: "#bfdbfe" },
  { label: "Rose", color: "#fecdd3" },
  { label: "Violet", color: "#e9d5ff" },
];

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px"];
const FONT_FAMILIES = [
  { label: "Défaut", value: "" },
  { label: "Serif (Georgia)", value: "Georgia, serif" },
  { label: "Sans-serif", value: "system-ui, sans-serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Monospace", value: "monospace" },
];

function ToolBtn({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button type="button" title={title} onClick={onClick}
      className={`p-1.5 rounded text-sm transition-colors ${active ? "bg-primary text-white" : "hover:bg-muted text-foreground"}`}>
      {children}
    </button>
  );
}

function Dropdown({ label, icon: Icon, items, onSelect, title }: {
  label?: string; icon: React.ElementType;
  items: { label: string; value: string }[];
  onSelect: (v: string) => void; title: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button type="button" title={title} onClick={() => setOpen((v: boolean) => !v)}
        className="p-1.5 rounded text-sm transition-colors hover:bg-muted text-foreground flex items-center gap-0.5">
        <Icon className="w-4 h-4" /><ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden min-w-36">
          {items.map((item) => (
            <button key={item.value} type="button" onClick={() => { onSelect(item.value); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted font-sans transition-colors">
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorPicker({ colors, onSelect, title, icon: Icon }: {
  colors: { label: string; color: string }[];
  onSelect: (color: string) => void;
  title: string; icon: React.ElementType;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button type="button" title={title} onClick={() => setOpen((v: boolean) => !v)}
        className="p-1.5 rounded text-sm transition-colors hover:bg-muted text-foreground">
        <Icon className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 p-2 bg-background border border-border rounded-lg shadow-lg grid grid-cols-5 gap-1 w-40">
          {colors.map((c) => (
            <button key={c.color || "default"} type="button" title={c.label}
              onClick={() => { onSelect(c.color); setOpen(false); }}
              className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
              style={{
                backgroundColor: c.color || "transparent",
                backgroundImage: !c.color ? "linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%),linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%)" : undefined,
                backgroundSize: !c.color ? "6px 6px" : undefined,
                backgroundPosition: !c.color ? "0 0,3px 3px" : undefined,
              }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RichEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder ?? "Rédigez votre article ici..." }),
      TextStyle,
      FontSize,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: false, allowBase64: true }),
      Youtube.configure({ controls: true, nocookie: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Subscript,
      Superscript,
      TextDirection,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value);
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL du lien", prev ?? "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const insertImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL de l'image");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const insertYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL YouTube");
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  const btn = (active: boolean, fn: () => void, title: string, Icon: React.ElementType) => (
    <ToolBtn key={title} active={active} onClick={fn} title={title}>
      <Icon className="w-4 h-4" />
    </ToolBtn>
  );

  const sep = () => <div className="w-px h-5 bg-border mx-1" />;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/20">
        {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), "Gras", Bold)}
        {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), "Italique", Italic)}
        {btn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), "Souligné", UnderlineIcon)}
        {btn(editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), "Barré", Strikethrough)}
        {btn(editor.isActive("subscript"), () => editor.chain().focus().toggleSubscript().run(), "Indice", () => <span className="text-xs font-bold">x₂</span>)}
        {btn(editor.isActive("superscript"), () => editor.chain().focus().toggleSuperscript().run(), "Exposant", () => <span className="text-xs font-bold">x²</span>)}

        {sep()}

        <ColorPicker colors={TEXT_COLORS}
          onSelect={(c) => c ? editor.chain().focus().setColor(c).run() : editor.chain().focus().unsetColor().run()}
          title="Couleur du texte" icon={Palette} />
        <ColorPicker colors={HIGHLIGHT_COLORS}
          onSelect={(c) => editor.chain().focus().toggleHighlight({ color: c }).run()}
          title="Surlignage" icon={Highlighter} />
        <Dropdown icon={Type} title="Taille de police"
          items={FONT_SIZES.map((s) => ({ label: s, value: s }))}
          onSelect={(s) => editor.chain().focus().setFontSize(s).run()} />
        <Dropdown icon={AlignJustify} title="Police"
          items={FONT_FAMILIES}
          onSelect={(f) => f ? editor.chain().focus().setFontFamily(f).run() : editor.chain().focus().unsetFontFamily().run()} />

        {sep()}

        {btn(editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), "Titre 1", Heading1)}
        {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "Titre 2", Heading2)}
        {btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "Titre 3", Heading3)}

        {sep()}

        {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), "Liste à puces", List)}
        {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), "Liste numérotée", ListOrdered)}
        {btn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), "Citation", Quote)}
        {btn(false, () => editor.chain().focus().setHorizontalRule().run(), "Séparateur", Minus)}

        {sep()}

        {btn(editor.isActive({ textAlign: "left" }), () => editor.chain().focus().setTextAlign("left").run(), "Gauche", AlignLeft)}
        {btn(editor.isActive({ textAlign: "center" }), () => editor.chain().focus().setTextAlign("center").run(), "Centrer", AlignCenter)}
        {btn(editor.isActive({ textAlign: "right" }), () => editor.chain().focus().setTextAlign("right").run(), "Droite", AlignRight)}
        {btn(false, () => (editor.chain().focus() as any).setTextDirection("rtl").run(), "Droite à gauche (RTL)", () => <span className="text-xs font-bold">RTL</span>)}
        {btn(false, () => (editor.chain().focus() as any).setTextDirection("ltr").run(), "Gauche à droite (LTR)", () => <span className="text-xs font-bold">LTR</span>)}

        {sep()}

        {btn(editor.isActive("link"), setLink, "Lien", LinkIcon)}
        {btn(false, insertImage, "Image", ImageIcon)}
        {btn(false, insertYoutube, "Vidéo YouTube", YoutubeIcon)}
        {btn(false, insertTable, "Tableau", TableIcon)}

        {sep()}

        {/* Table controls (visible only when in a table) */}
        {editor.isActive("table") && (
          <>
            {btn(false, () => editor.chain().focus().addColumnAfter().run(), "Ajouter colonne", () => <span className="text-xs">+col</span>)}
            {btn(false, () => editor.chain().focus().addRowAfter().run(), "Ajouter ligne", () => <span className="text-xs">+row</span>)}
            {btn(false, () => editor.chain().focus().deleteColumn().run(), "Supprimer colonne", () => <span className="text-xs">-col</span>)}
            {btn(false, () => editor.chain().focus().deleteRow().run(), "Supprimer ligne", () => <span className="text-xs">-row</span>)}
            {btn(false, () => editor.chain().focus().deleteTable().run(), "Supprimer tableau", () => <span className="text-xs">✕tab</span>)}
            {sep()}
          </>
        )}

        {btn(false, () => editor.chain().focus().undo().run(), "Annuler", Undo)}
        {btn(false, () => editor.chain().focus().redo().run(), "Rétablir", Redo)}
      </div>

      <EditorContent
        editor={editor}
        className="rich-editor-content prose prose-sm max-w-none p-4 min-h-80 focus-within:outline-none font-sans text-sm leading-relaxed
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
          [&_.ProseMirror_table]:border-collapse
          [&_.ProseMirror_table]:w-full
          [&_.ProseMirror_td]:border
          [&_.ProseMirror_td]:border-border
          [&_.ProseMirror_td]:p-2
          [&_.ProseMirror_th]:border
          [&_.ProseMirror_th]:border-border
          [&_.ProseMirror_th]:p-2
          [&_.ProseMirror_th]:bg-muted
          [&_.ProseMirror_th]:font-bold
          [&_.ProseMirror_img]:max-w-full
          [&_.ProseMirror_img]:rounded-lg
          [&_.ProseMirror_img]:my-4
          [&_.ProseMirror_iframe]:w-full
          [&_.ProseMirror_iframe]:aspect-video
          [&_.ProseMirror_iframe]:rounded-lg
          [&_.ProseMirror_iframe]:my-4"
      />
    </div>
  );
}
