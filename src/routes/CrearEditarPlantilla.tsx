import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { API_URL } from "../auth/authConstants";
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

export default function CrearEditarPlantilla() {
  const { id } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [subserieId, setSubserieId] = useState("");
  const [trds, setTrds] = useState<TRD[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
    const empresa = auth.getSelectedEmpresa();
    try {
      const response = await fetch(`${API_URL}/archivistica/trd`, {
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa?.id || "",
        },
      });
      if (response.ok) {
        const json = await response.json();
        setTrds(json.body.trd);
      }
    } catch (error) {
      console.error("Error al cargar TRDs:", error);
    }
  }

  async function fetchPlantilla() {
    setLoading(true);
    const empresa = auth.getSelectedEmpresa();
    try {
      const response = await fetch(`${API_URL}/plantillas/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa?.id || "",
        },
      });
      if (response.ok) {
        const json = await response.json();
        setNombre(json.body.plantilla.nombre);
        setDescripcion(json.body.plantilla.descripcion);
        setSubserieId(json.body.plantilla.subserieId || "");
        editor?.commands.setContent(json.body.plantilla.contenidoHtml);
      }
    } catch (error) {
      console.error("Error al cargar plantilla:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!nombre || !editor) return;
    setSaving(true);
    const empresa = auth.getSelectedEmpresa();
    const contenidoHtml = editor.getHTML();

    try {
      const url = id ? `${API_URL}/plantillas/${id}` : `${API_URL}/plantillas`;
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
          "X-Empresa-ID": empresa?.id || "",
        },
        body: JSON.stringify({ nombre, descripcion, contenidoHtml, subserieId }),
      });

      if (response.ok) {
        navigate("/plantillas");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
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
              <label>Descripción / Observaciones</label>
              <input 
                type="text" 
                value={descripcion} 
                onChange={(e) => setDescripcion(e.target.value)} 
                placeholder="Para qué se usa esta plantilla..."
                className="edit-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        <div className="editor-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '20px' }}>
          <div className="main-editor-area">
            {/* Toolbar */}
            <div className="editor-toolbar card" style={{ padding: '5px', marginBottom: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              <button className="icon-btn" onClick={() => editor?.chain().focus().toggleBold().run()} title="Negrita"><MdFormatBold /></button>
              <button className="icon-btn" onClick={() => editor?.chain().focus().toggleItalic().run()} title="Cursiva"><MdFormatItalic /></button>
              <span className="separator">|</span>
              <button className="icon-btn" onClick={() => editor?.chain().focus().setTextAlign('left').run()} title="Alinear Izquierda"><MdFormatAlignLeft /></button>
              <button className="icon-btn" onClick={() => editor?.chain().focus().setTextAlign('center').run()} title="Centrar"><MdFormatAlignCenter /></button>
              <button className="icon-btn" onClick={() => editor?.chain().focus().setTextAlign('right').run()} title="Alinear Derecha"><MdFormatAlignRight /></button>
              <button className="icon-btn" onClick={() => editor?.chain().focus().setTextAlign('justify').run()} title="Justificar"><MdFormatAlignJustify /></button>
              <span className="separator">|</span>
              <button className="icon-btn" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3 }).run()} title="Insertar Tabla"><MdGridOn /></button>
            </div>

            {/* Editable Area (A4 Simulation) */}
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
              <h3>Variables</h3>
              <p className="small text-muted">Haz clic para insertar en el texto</p>
              
              <div className="variable-group" style={{ marginTop: '15px' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--muted)' }}>Empresa</h4>
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => insertVariable('empresa.razonSocial')}>Razón Social</button>
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => insertVariable('empresa.nit')}>NIT Empresa</button>
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => insertVariable('fecha_actual')}>Fecha Actual</button>
              </div>

              <div className="variable-group" style={{ marginTop: '15px' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--muted)' }}>Entidad (Tercero)</h4>
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => insertVariable('entidad.nombre')}>Nombre/Razón S.</button>
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => insertVariable('entidad.numeroIdentificacion')}>Identificación</button>
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => insertVariable('entidad.direccion')}>Dirección</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PortalLayout>
  );
}
