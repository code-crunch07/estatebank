"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  Link2,
} from "lucide-react";
import { useCallback, useRef } from "react";
import { toast } from "sonner";

// Custom Image Extension with Resize Support
const ResizableImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute("width");
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute("height");
          return height ? parseInt(height, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
    };
  },
  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const container = document.createElement("span");
      container.setAttribute("data-type", "image");
      container.style.display = "inline-block";
      container.style.position = "relative";

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.style.maxWidth = "100%";
      img.style.borderRadius = "0.5rem";
      img.style.margin = "1rem 0";
      img.style.display = "block";
      img.draggable = false;

      // Set dimensions if provided
      if (node.attrs.width) {
        img.style.width = `${node.attrs.width}px`;
        img.width = node.attrs.width;
      }
      if (node.attrs.height) {
        img.style.height = `${node.attrs.height}px`;
        img.height = node.attrs.height;
      }

      // Handle image load to set initial dimensions if not set
      img.onload = () => {
        if (!node.attrs.width && !node.attrs.height) {
          const maxWidth = 800;
          const naturalWidth = img.naturalWidth;
          const naturalHeight = img.naturalHeight;
          const aspectRatio = naturalWidth / naturalHeight;
          const width = Math.min(naturalWidth, maxWidth);
          const height = width / aspectRatio;
          
          img.style.width = `${width}px`;
          img.style.height = `${height}px`;
          img.width = width;
          img.height = height;
          
          if (getPosFn) {
            const pos = getPosFn();
            if (typeof pos === 'number') {
              editor.commands.updateAttributes("image", { width, height });
            }
          }
        }
      };

      container.appendChild(img);

      let isSelected = false;
      let isResizing = false;
      let resizeHandle: string | null = null;
      let startPos = { x: 0, y: 0 };
      let startSize = { width: 0, height: 0 };
      const getPosFn = typeof getPos === "function" ? getPos : null;

      const updateSelection = () => {
        const { from } = editor.state.selection;
        const pos = getPosFn ? getPosFn() : null;
        const shouldBeSelected = typeof pos === 'number' && pos <= from && from <= pos + node.nodeSize;
        
        if (shouldBeSelected !== isSelected) {
          isSelected = shouldBeSelected;
          if (isSelected) {
            container.classList.add("ring-2", "ring-primary", "ring-offset-2");
            addResizeHandles();
          } else {
            container.classList.remove("ring-2", "ring-primary", "ring-offset-2");
            removeResizeHandles();
          }
        }
      };

      const addResizeHandles = () => {
        if (container.querySelector(".resize-handle")) return;

        const handles = ["nw", "ne", "se", "sw"];
        const cursors = ["nwse-resize", "nesw-resize", "nwse-resize", "nesw-resize"];

        handles.forEach((handle, index) => {
          const handleEl = document.createElement("div");
          handleEl.className = "resize-handle";
          handleEl.style.cssText = `
            position: absolute;
            width: 12px;
            height: 12px;
            background: hsl(var(--primary));
            border: 2px solid white;
            border-radius: 50%;
            cursor: ${cursors[index]};
            z-index: 10;
          `;

          const positions: Record<string, string> = {
            nw: "top: -6px; left: -6px;",
            ne: "top: -6px; right: -6px;",
            se: "bottom: -6px; right: -6px;",
            sw: "bottom: -6px; left: -6px;",
          };
          handleEl.style.cssText += positions[handle];

          handleEl.addEventListener("mousedown", (e) => {
            e.preventDefault();
            e.stopPropagation();
            isResizing = true;
            resizeHandle = handle;
            startPos = { x: e.clientX, y: e.clientY };
            startSize = {
              width: node.attrs.width || img.naturalWidth || 800,
              height: node.attrs.height || img.naturalHeight || 600,
            };
          });

          container.appendChild(handleEl);
        });
      };

      const removeResizeHandles = () => {
        const handles = container.querySelectorAll(".resize-handle");
        handles.forEach((handle) => handle.remove());
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing || !resizeHandle) return;

        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;

        let newWidth = startSize.width;
        let newHeight = startSize.height;

        switch (resizeHandle) {
          case "se":
            newWidth = Math.max(50, startSize.width + deltaX);
            newHeight = Math.max(50, startSize.height + deltaY);
            break;
          case "sw":
            newWidth = Math.max(50, startSize.width - deltaX);
            newHeight = Math.max(50, startSize.height + deltaY);
            break;
          case "ne":
            newWidth = Math.max(50, startSize.width + deltaX);
            newHeight = Math.max(50, startSize.height - deltaY);
            break;
          case "nw":
            newWidth = Math.max(50, startSize.width - deltaX);
            newHeight = Math.max(50, startSize.height - deltaY);
            break;
        }

        if (e.shiftKey) {
          const aspectRatio = startSize.width / startSize.height;
          if (resizeHandle === "se" || resizeHandle === "nw") {
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = newHeight * aspectRatio;
          }
        }

        img.width = Math.round(newWidth);
        img.height = Math.round(newHeight);
        img.style.width = `${Math.round(newWidth)}px`;
        img.style.height = `${Math.round(newHeight)}px`;

        if (getPosFn) {
          const pos = getPosFn();
          if (typeof pos === 'number') {
            editor.commands.updateAttributes("image", {
              width: Math.round(newWidth),
              height: Math.round(newHeight),
            });
          }
        }
      };

      const handleMouseUp = () => {
        if (isResizing) {
          isResizing = false;
          resizeHandle = null;
        }
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      editor.on("selectionUpdate", updateSelection);
      updateSelection();

      return {
        dom: container,
        destroy: () => {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
          editor.off("selectionUpdate", updateSelection);
        },
      };
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = "Start writing..." }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      ResizableImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((file: File) => {
    if (!editor) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      editor.chain().focus().setImage({ src: base64 }).run();
      toast.success("Image added successfully");
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    // Open file picker directly
    fileInputRef.current?.click();
  }, [editor]);

  const addImageFromUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter Image URL");
    if (url && url.trim()) {
      editor.chain().focus().setImage({ src: url.trim() }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file);
            // Reset input so same file can be selected again
            e.target.value = "";
          }
        }}
      />
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-2 flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-accent" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-accent" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "bg-accent" : ""}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-accent" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-accent" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-accent" : ""}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setLink}
          className={editor.isActive("link") ? "bg-accent" : ""}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Add image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={addImage}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={addImageFromUrl}>
              <Link2 className="h-4 w-4 mr-2" />
              From URL
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="bg-background">
        <EditorContent editor={editor} />
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: 300px;
          padding: 1rem;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .ProseMirror span[data-type="image"] {
          display: inline-block;
          position: relative;
        }
        .ProseMirror .resize-handle {
          transition: transform 0.1s;
        }
        .ProseMirror .resize-handle:hover {
          transform: scale(1.2);
        }
        .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .ProseMirror blockquote {
          border-left: 4px solid hsl(var(--border));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        .ProseMirror p {
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
}

