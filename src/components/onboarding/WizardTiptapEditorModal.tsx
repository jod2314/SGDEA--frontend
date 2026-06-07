import { useEffect } from "react";
import * as IconsMd from "react-icons/md";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextAlign } from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";

// Iconos Md según el patrón del proyecto
const MdUndo = (IconsMd as any).MdUndo;
const MdRedo = (IconsMd as any).MdRedo;
const MdFormatBold = (IconsMd as any).MdFormatBold;
const MdFormatItalic = (IconsMd as any).MdFormatItalic;
const MdHighlighter = (IconsMd as any).MdHighlight || (IconsMd as any).MdFormatColorFill;
const MdFormatListBulleted = (IconsMd as any).MdFormatListBulleted;
const MdFormatListNumbered = (IconsMd as any).MdFormatListNumbered;
const MdClose = (IconsMd as any).MdClose;
const MdCheckCircle = (IconsMd as any).MdCheckCircle;

interface WizardTiptapEditorModalProps {
  show: boolean;
  tipo: "manual-gestion" | "pgd" | null;
  htmlContent: string;
  submitting: boolean;
  onClose: () => void;
  onOficializar: (html: string) => void;
}

export default function WizardTiptapEditorModal({
  show,
  tipo,
  htmlContent,
  submitting,
  onClose,
  onOficializar,
}: WizardTiptapEditorModalProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      (Table as any).configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      (TextAlign as any).configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Highlight,
    ],
    content: htmlContent || "",
  });

  useEffect(() => {
    if (editor && htmlContent) {
      editor.commands.setContent(htmlContent);
    }
  }, [htmlContent, editor]);

  if (!show || !tipo) return null;

  const handleOficializar = () => {
    if (editor) {
      onOficializar(editor.getHTML());
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(5px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: "20px",
      boxSizing: "border-box"
    }}>
      <div className="card" style={{
        width: "95%",
        maxWidth: "1100px",
        height: "90%",
        background: "var(--surface)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: "16px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
        border: "1px solid rgba(0,0,0,0.1)"
      }}>
        {/* Cabecera del Modal */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background: "var(--surface)"
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-primary)" }}>
              Borrador Oficial: {tipo === "manual-gestion" ? "Manual de Gestión Documental" : "Programa de Gestión Documental (PGD)"}
            </h3>
            <p className="text-muted" style={{ margin: "4px 0 0 0", fontSize: "0.85rem" }}>
              Edite las cláusulas y presione "Oficializar y Firmar" para generar el PDF/A inmutable.
            </p>
          </div>
          <button 
            type="button"
            className="btn btn-ghost" 
            style={{ padding: "8px", minWidth: "auto", borderRadius: "50%" }}
            onClick={onClose}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Barra de herramientas */}
        <div className="editor-toolbar" style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          padding: "12px 24px",
          background: "#f8f9fa",
          borderBottom: "1px solid rgba(0,0,0,0.08)"
        }}>
          <button type="button" className="icon-btn" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} title="Deshacer"><MdUndo /></button>
          <button type="button" className="icon-btn" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} title="Rehacer"><MdRedo /></button>
          <span className="separator">|</span>
          <button type="button" className={`icon-btn ${editor?.isActive("heading", { level: 1 }) ? "active" : ""}`} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
          <button type="button" className={`icon-btn ${editor?.isActive("heading", { level: 2 }) ? "active" : ""}`} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
          <button type="button" className={`icon-btn ${editor?.isActive("paragraph") ? "active" : ""}`} onClick={() => editor?.chain().focus().setParagraph().run()}>P</button>
          <span className="separator">|</span>
          <button type="button" className={`icon-btn ${editor?.isActive("bold") ? "active" : ""}`} onClick={() => editor?.chain().focus().toggleBold().run()}><MdFormatBold /></button>
          <button type="button" className={`icon-btn ${editor?.isActive("italic") ? "active" : ""}`} onClick={() => editor?.chain().focus().toggleItalic().run()}><MdFormatItalic /></button>
          <button type="button" className={`icon-btn ${editor?.isActive("highlight") ? "active" : ""}`} onClick={() => editor?.chain().focus().toggleHighlight().run()}><MdHighlighter /></button>
          <span className="separator">|</span>
          <button type="button" className={`icon-btn ${editor?.isActive("bulletList") ? "active" : ""}`} onClick={() => editor?.chain().focus().toggleBulletList().run()}><MdFormatListBulleted /></button>
          <button type="button" className={`icon-btn ${editor?.isActive("orderedList") ? "active" : ""}`} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><MdFormatListNumbered /></button>
        </div>

        {/* Área editable */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          background: "#f0f0f0",
          padding: "20px",
          display: "flex",
          justifyContent: "center"
        }}>
          <div className="tiptap-paper" style={{
            width: "100%",
            maxWidth: "800px",
            minHeight: "29.7cm",
            background: "white",
            padding: "40px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            outline: "none",
            boxSizing: "border-box"
          }}>
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Pie de Modal */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          padding: "16px 24px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          background: "var(--surface)"
        }}>
          <button 
            type="button" 
            className="btn btn-ghost" 
            style={{ borderRadius: "22px" }}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            style={{ borderRadius: "22px", display: "flex", alignItems: "center", gap: "8px" }}
            onClick={handleOficializar}
            disabled={submitting}
          >
            <MdCheckCircle /> Oficializar y Firmar
          </button>
        </div>
      </div>
    </div>
  );
}
