"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TiptapImage from "@tiptap/extension-image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Link as LinkIcon,
  ImagePlus,
  Minus,
  Undo,
  Redo,
} from "lucide-react";
import { MediaPicker } from "@/components/admin/media-picker";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escriu el contingut...",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Link is from a separate extension package
        link: false,
        // Underline is a separate extension package
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      TiptapImage.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: "rounded-md" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // TipTap returns "<p></p>" for an empty doc; treat it as empty so the
      // form's "is empty" checks line up with what the user actually sees.
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[280px] max-w-none px-4 py-3 focus:outline-none",
          "prose prose-invert max-w-none",
          "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground",
          "prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3",
          "prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-2",
          "prose-p:text-foreground/90 prose-p:leading-relaxed",
          "prose-a:text-accent hover:prose-a:underline",
          "prose-strong:text-foreground prose-strong:font-semibold",
          "prose-ul:text-foreground/90 prose-ol:text-foreground/90",
          "prose-blockquote:border-accent prose-blockquote:text-foreground/70",
          "prose-code:rounded prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:text-foreground",
          "prose-pre:bg-secondary prose-pre:rounded-lg prose-pre:text-sm",
          "prose-hr:border-border",
        ),
      },
    },
    immediatelyRender: false,
  });

  // Keep editor content in sync when `value` changes externally (e.g. when
  // the parent form swaps to a different block / locale).
  useEffect(() => {
    if (!editor) return;
    if (value === editor.getHTML()) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="rounded-md border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground/40">
        Carregant editor...
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-secondary/30 overflow-hidden",
        className,
      )}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

interface ToolbarProps {
  editor: Editor;
}

function Toolbar({ editor }: ToolbarProps) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const promptForLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL de l'enllaç (buit per a treure):", previous ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-secondary/50 px-2 py-1.5">
      <Btn
        title="Negreta · Cmd+B"
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
      >
        <Bold className="h-4 w-4" />
      </Btn>
      <Btn
        title="Cursiva · Cmd+I"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
      >
        <Italic className="h-4 w-4" />
      </Btn>
      <Btn
        title="Subratllat · Cmd+U"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Btn>
      <Btn
        title="Tatxat"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
      >
        <Strikethrough className="h-4 w-4" />
      </Btn>

      <Sep />

      <Btn
        title="Encapçalament 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        <Heading2 className="h-4 w-4" />
      </Btn>
      <Btn
        title="Encapçalament 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        <Heading3 className="h-4 w-4" />
      </Btn>

      <Sep />

      <Btn
        title="Llista amb pics"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
      >
        <List className="h-4 w-4" />
      </Btn>
      <Btn
        title="Llista numerada"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
      >
        <ListOrdered className="h-4 w-4" />
      </Btn>
      <Btn
        title="Cita"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
      >
        <Quote className="h-4 w-4" />
      </Btn>

      <Sep />

      <Btn
        title="Codi en línia · Cmd+E"
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
      >
        <Code className="h-4 w-4" />
      </Btn>
      <Btn
        title="Bloc de codi"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
      >
        <Code2 className="h-4 w-4" />
      </Btn>
      <Btn
        title="Enllaç · Cmd+K"
        onClick={promptForLink}
        active={editor.isActive("link")}
      >
        <LinkIcon className="h-4 w-4" />
      </Btn>
      <Btn
        title="Inserir imatge"
        onClick={() => setMediaPickerOpen(true)}
      >
        <ImagePlus className="h-4 w-4" />
      </Btn>
      <Btn
        title="Línia divisòria"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="h-4 w-4" />
      </Btn>

      <Sep />

      <Btn
        title="Desfer · Cmd+Z"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
      </Btn>
      <Btn
        title="Refer · Cmd+Shift+Z"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
      </Btn>

      {mediaPickerOpen && (
        <MediaPicker
          mimePrefix="image/"
          onClose={() => setMediaPickerOpen(false)}
          onSelect={(item) => {
            editor
              .chain()
              .focus()
              .setImage({
                src: item.url,
                alt: item.alt || item.filename,
              })
              .run();
            setMediaPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}

interface BtnProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function Btn({ onClick, active, disabled, title, children }: BtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex items-center justify-center h-8 w-8 rounded transition-colors",
        active
          ? "bg-accent/20 text-accent"
          : "text-foreground/70 hover:text-foreground hover:bg-secondary",
        disabled && "opacity-30 pointer-events-none",
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-border" aria-hidden />;
}
