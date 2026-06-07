import { useState, useEffect, useRef } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";
import PortalLayout from "../layout/PortalLayout";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextAlign } from "@tiptap/extension-text-align";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import * as IconsMd from "react-icons/md";
import { TRD } from "../types/types";

const MdSave = (IconsMd as any).MdSave;
const MdArrowBack = (IconsMd as any).MdArrowBack;
const MdHistory = (IconsMd as any).MdHistory;
const MdFormatBold = (IconsMd as any).MdFormatBold;
const MdFormatItalic = (IconsMd as any).MdFormatItalic;
const MdFormatAlignJustify = (IconsMd as any).MdFormatAlignJustify;
const MdFormatAlignLeft = (IconsMd as any).MdFormatAlignLeft;
const MdFormatAlignCenter = (IconsMd as any).MdFormatAlignCenter;
const MdFormatAlignRight = (IconsMd as any).MdFormatAlignRight;
const MdGridOn = (IconsMd as any).MdGridOn;
const MdHighlighter = (IconsMd as any).MdHighlight || (IconsMd as any).MdFormatColorFill;
const MdFormatListBulleted = (IconsMd as any).MdFormatListBulleted;
const MdFormatListNumbered = (IconsMd as any).MdFormatListNumbered;
const MdFormatQuote = (IconsMd as any).MdFormatQuote;
const MdHorizontalRule = (IconsMd as any).MdHorizontalRule || (IconsMd as any).MdRemove;
const MdUndo = (IconsMd as any).MdUndo;
const MdRedo = (IconsMd as any).MdRedo;
const MdImage = (IconsMd as any).MdImage;

export default function CrearEditarPlantilla() {
  const { id } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [subserieId, setSubserieId] = useState("");
  const [comentario, setComentario] = useState("");
  const [trds, setTrds] = useState<TRD[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten archivos de imagen");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("El tamaño de la imagen no debe superar los 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("imagen", file);

    try {
      setSaving(true);
      const json = await auth.request<any>("/documentos/upload-imagen", {
        method: "POST",
        body: formData,
      });

      const url = json.body.url;
      editor?.chain().focus().setImage({ src: url }).run();
    } catch (error: any) {
      alert(error.message || "Error al subir la imagen");
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
      Image,
      (Placeholder as any).configure({
        placeholder: "Comienza a redactar tu plantilla aquí...",
      }),
      Highlight,
    ],
    content: "",
  });

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchTrds();
      if (id) {
        fetchPlantilla();
      }
    }
  }, [id, auth.isAuthenticated]);

  async function fetchTrds() {
    try {
      const json = await auth.request<any>("/archivistica/trd");
      setTrds(json.body.trd);
    } catch (error) {
      console.error("Error al cargar TRDs:", error);
    }
  }

  async function fetchPlantilla() {
    setLoading(true);
    try {
      const json = await auth.request<any>(`/plantillas/${id}`);
      setNombre(json.body.plantilla.nombre);
      setDescripcion(json.body.plantilla.descripcion);
      setSubserieId(json.body.plantilla.subserieId?._id || json.body.plantilla.subserieId || "");
      editor?.commands.setContent(json.body.plantilla.contenidoHtml);
    } catch (error) {
      console.error("Error al cargar plantilla:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!nombre || !editor) return;
    setSaving(true);
    const contenidoHtml = editor.getHTML();

    try {
      const endpoint = id ? `/plantillas/${id}` : "/plantillas";
      const method = id ? "PUT" : "POST";

      await auth.request<any>(endpoint, {
        method,
        body: JSON.stringify({ 
          nombre, 
          descripcion, 
          contenidoHtml, 
          subserieId,
          comentario: comentario || (id ? "Actualización de contenido" : "Versión inicial")
        }),
      });

      navigate("/plantillas");
    } catch (error: any) {
      alert(error.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const insertVariable = (token: string) => {
    editor?.chain().focus().insertContent(`{{${token}}}`).run();
  };

  if (loading) return <PortalLayout><div>Cargando editor...</div></PortalLayout>;

  return (
    <PortalLayout>
      <div className="editor-page-container">
        <header className="editor-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="icon-btn" onClick={() => navigate("/plantillas")} title="Volver">
              <MdArrowBack size={24} />
            </button>
            <h1>{id ? "Editar Plantilla" : "Nueva Plantilla"}</h1>
          </div>
          <div className="editor-actions" style={{ display: 'flex', gap: '10px' }}>
            {id && (
              <button className="btn btn-ghost" onClick={() => navigate(`/plantillas/${id}/historial`)}>
                <MdHistory /> Ver Historial
              </button>
            )}
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <MdSave /> {saving ? "Guardando..." : "Guardar Formato"}
            </button>
          </div>
        </header>

        <div className="editor-meta card" style={{ marginBottom: '20px', padding: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
            <div>
              <label>Nombre del Formato</label>
              <input 
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                placeholder="Ej: Contrato de Prestación de Servicios"
                className="edit-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label>Clasificación Archivística (TRD)</label>
              <select 
                value={subserieId} 
                onChange={(e) => setSubserieId(e.target.value)}
                className="edit-input"
                style={{ width: '100%' }}
              >
                <option value="">Seleccionar TRD...</option>
                {trds.map(trd => (
                  <option key={trd.id} value={(trd.subserieId as any)._id}>
                    {trd.codigoTRD} - {(trd.subserieId as any).nombreSubserie} ({(trd.dependenciaId as any).nombreDependencia})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Descripción</label>
              <input 
                type="text" 
                value={descripcion} 
                onChange={(e) => setDescripcion(e.target.value)} 
                className="edit-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label>Comentario de Versión</label>
              <input 
                type="text" 
                value={comentario} 
                onChange={(e) => setComentario(e.target.value)} 
                placeholder="¿Qué cambió?"
                className="edit-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        <div className="editor-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
          <div className="main-editor-area">
            {/* Toolbar */}
            <div className="editor-toolbar card" style={{ padding: '5px', marginBottom: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              <button className="icon-btn" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} title="Deshacer"><MdUndo /></button>
              <button className="icon-btn" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} title="Rehacer"><MdRedo /></button>
              <span className="separator">|</span>
              <button className={`icon-btn ${editor?.isActive('heading', { level: 1 }) ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} title="Título 1" style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>H1</button>
              <button className={`icon-btn ${editor?.isActive('heading', { level: 2 }) ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="Título 2" style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>H2</button>
              <button className={`icon-btn ${editor?.isActive('heading', { level: 3 }) ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="Título 3" style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>H3</button>
              <button className={`icon-btn ${editor?.isActive('paragraph') ? 'active' : ''}`} onClick={() => editor?.chain().focus().setParagraph().run()} title="Texto Normal" style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>P</button>
              <span className="separator">|</span>
              <button className={`icon-btn ${editor?.isActive('bold') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleBold().run()} title="Negrita"><MdFormatBold /></button>
              <button className={`icon-btn ${editor?.isActive('italic') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Cursiva"><MdFormatItalic /></button>
              <button className={`icon-btn ${editor?.isActive('highlight') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleHighlight().run()} title="Resaltar"><MdHighlighter /></button>
              <span className="separator">|</span>
              <button className={`icon-btn ${editor?.isActive('bulletList') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Lista con Viñetas"><MdFormatListBulleted /></button>
              <button className={`icon-btn ${editor?.isActive('orderedList') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Lista Numerada"><MdFormatListNumbered /></button>
              <button className={`icon-btn ${editor?.isActive('blockquote') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Cita"><MdFormatQuote /></button>
              <button className="icon-btn" onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Línea Horizontal"><MdHorizontalRule /></button>
              <span className="separator">|</span>
              <button className={`icon-btn ${editor?.isActive({ textAlign: 'left' }) ? 'active' : ''}`} onClick={() => editor?.chain().focus().setTextAlign('left').run()} title="Alinear Izquierda"><MdFormatAlignLeft /></button>
              <button className={`icon-btn ${editor?.isActive({ textAlign: 'center' }) ? 'active' : ''}`} onClick={() => editor?.chain().focus().setTextAlign('center').run()} title="Centrar"><MdFormatAlignCenter /></button>
              <button className={`icon-btn ${editor?.isActive({ textAlign: 'right' }) ? 'active' : ''}`} onClick={() => editor?.chain().focus().setTextAlign('right').run()} title="Alinear Derecha"><MdFormatAlignRight /></button>
              <button className={`icon-btn ${editor?.isActive({ textAlign: 'justify' }) ? 'active' : ''}`} onClick={() => editor?.chain().focus().setTextAlign('justify').run()} title="Justificar"><MdFormatAlignJustify /></button>
              <span className="separator">|</span>
              <button className="icon-btn" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3 }).run()} title="Insertar Tabla"><MdGridOn /></button>
              <button className="icon-btn" onClick={() => fileInputRef.current?.click()} title="Insertar Imagen"><MdImage /></button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
            </div>

            {/* Controles avanzados de tablas (Solo visible si hay una tabla activa) */}
            {editor?.isActive('table') && (
              <div className="editor-toolbar card table-controls" style={{ padding: '5px', marginBottom: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px', background: '#eaf4fe', borderColor: '#b3d7ff' }}>
                <span className="small" style={{ alignSelf: 'center', marginRight: '10px', fontWeight: 'bold', color: '#0056b3', fontSize: '0.8rem' }}>Opciones de Tabla:</span>
                <button className="btn btn-ghost btn-sm" onClick={() => editor.chain().focus().addColumnBefore().run()}>+ Col Izq</button>
                <button className="btn btn-ghost btn-sm" onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Col Der</button>
                <button className="btn btn-ghost btn-sm" onClick={() => editor.chain().focus().deleteColumn().run()}>Borrar Col</button>
                <span className="separator">|</span>
                <button className="btn btn-ghost btn-sm" onClick={() => editor.chain().focus().addRowBefore().run()}>+ Fila Arriba</button>
                <button className="btn btn-ghost btn-sm" onClick={() => editor.chain().focus().addRowAfter().run()}>+ Fila Abajo</button>
                <button className="btn btn-ghost btn-sm" onClick={() => editor.chain().focus().deleteRow().run()}>Borrar Fila</button>
                <span className="separator">|</span>
                <button className="btn btn-ghost btn-sm" onClick={() => editor.chain().focus().mergeCells().run()}>Combinar Celdas</button>
                <button className="btn btn-ghost btn-sm" onClick={() => editor.chain().focus().splitCell().run()}>Dividir Celda</button>
                <span className="separator">|</span>
                <button className="btn btn-ghost btn-sm text-danger" onClick={() => editor.chain().focus().deleteTable().run()} style={{ color: '#c0392b' }}>Eliminar Tabla</button>
              </div>
            )}

            {/* Área Editable (Simulación A4) */}
            <div className="tiptap-a4-container" style={{ 
              background: '#f0f0f0', 
              padding: '20px 0', 
              display: 'flex', 
              justifyContent: 'center',
              minHeight: '800px'
            }}>
              <div className="tiptap-paper" style={{
                width: '21cm',
                minHeight: '29.7cm',
                background: 'white',
                padding: '2.5cm',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                outline: 'none'
              }}>
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          <aside className="editor-sidebar">
            <div className="card" style={{ padding: '15px' }}>
              <h3>Variables Dinámicas</h3>
              <p className="small text-muted">Haz clic para insertar tokens que se fusionarán al generar el documento.</p>
              
              <div className="variable-group" style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Empresa / Maestros</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                  <button className="btn btn-ghost btn-sm text-left" onClick={() => insertVariable('maestros.membrete.razonSocial')}>Razón Social</button>
                  <button className="btn btn-ghost btn-sm text-left" onClick={() => insertVariable('maestros.membrete.nit')}>NIT Empresa</button>
                  <button className="btn btn-ghost btn-sm text-left" onClick={() => insertVariable('maestros.representante_legal.nombre')}>Rep. Legal (Nombre)</button>
                  <button className="btn btn-ghost btn-sm text-left" onClick={() => insertVariable('maestros.representante_legal.cargo')}>Rep. Legal (Cargo)</button>
                </div>
              </div>

              <div className="variable-group" style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Entidad (Tercero)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                  <button className="btn btn-ghost btn-sm text-left" onClick={() => insertVariable('entidad.nombre')}>Nombre / Razón S.</button>
                  <button className="btn btn-ghost btn-sm text-left" onClick={() => insertVariable('entidad.numeroIdentificacion')}>Identificación</button>
                  <button className="btn btn-ghost btn-sm text-left" onClick={() => insertVariable('entidad.direccion')}>Dirección</button>
                  <button className="btn btn-ghost btn-sm text-left" onClick={() => insertVariable('entidad.ciudad')}>Ciudad</button>
                </div>
              </div>

              <div className="variable-group" style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Documento</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                  <button className="btn btn-ghost btn-sm text-left" onClick={() => insertVariable('documento.radicado')}>N° Radicado</button>
                  <button className="btn btn-ghost btn-sm text-left" onClick={() => insertVariable('documento.trd')}>Código TRD</button>
                  <button className="btn btn-ghost btn-sm text-left" onClick={() => insertVariable('documento.fecha')}>Fecha Emisión</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <style>{`
        .text-left { text-align: left !important; justify-content: flex-start !important; }
        .icon-btn.active { background: var(--primary-color); color: white; }
        .tiptap-paper *:focus { outline: none; }
        .tiptap-paper table { border-collapse: collapse; table-layout: fixed; width: 100%; margin: 0; overflow: hidden; }
        .tiptap-paper td, .tiptap-paper th { min-width: 1em; border: 1px solid #ced4da; padding: 3px 5px; vertical-align: top; box-sizing: border-box; position: relative; }
      `}</style>
    </PortalLayout>
  );
}
