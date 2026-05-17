import { useEffect, useState } from "react";
import PortalLayout from "../layout/PortalLayout";
import { useAuth } from "../auth/AuthProvider";
import * as IconsMd from "react-icons/md";
import { 
  BarChart as RechartsBarChart, Bar as RechartsBar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart as RechartsPieChart, Pie as RechartsPie, Cell as RechartsCell, LineChart as RechartsLineChart, Line as RechartsLine, Legend as RechartsLegend 
} from "recharts";

const BarChart = RechartsBarChart as any;
const PieChart = RechartsPieChart as any;
const LineChart = RechartsLineChart as any;
const Bar = RechartsBar as any;
const Pie = RechartsPie as any;
const Cell = RechartsCell as any;
const Line = RechartsLine as any;
const Tooltip = RechartsTooltip as any;
const Legend = RechartsLegend as any;

const MdArticle = IconsMd.MdArticle as any;
const MdFolder = IconsMd.MdFolder as any;
const MdSecurity = IconsMd.MdSecurity as any;
const MdTrendingUp = IconsMd.MdTrendingUp as any;
const MdFileDownload = IconsMd.MdFileDownload as any;

interface DashboardData {
  produccion: Array<{ _id: string; count: number; tipoArchivo: string }>;
  inventario: Array<{ _id: { estado: string; ubicacion: string }; count: number }>;
  auditoria: Array<{ _id: { dia: string; accion: string }; count: number }>;
  madurez: { porcentajeCompletitud: number; faseActual: string };
}

export default function Dashboard() {
  const auth = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const json = await auth.request<any>("/reports/dashboard");
        setData(json.body);
      } catch (error) {
        console.error("Error al cargar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    if (auth.isAuthenticated) {
      fetchDashboard();
    }
  }, [auth.isAuthenticated]);

  if (loading) return <PortalLayout><div style={{ padding: '20px' }}>Analizando datos de la organización...</div></PortalLayout>;

  // Preparar datos para gráficas
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  const produccionData = data?.produccion.map(p => ({
    name: p._id || "Sin Código",
    cantidad: p.count
  })).slice(0, 5) || [];

  const inventarioData = data?.inventario.map(i => ({
    name: `${i._id.estado} (${i._id.ubicacion})`,
    value: i.count
  })) || [];

  const auditData = data?.auditoria.reduce((acc: any[], curr) => {
    const dia = curr._id.dia;
    const existing = acc.find(a => a.dia === dia);
    if (existing) {
      existing[curr._id.accion] = (existing[curr._id.accion] || 0) + curr.count;
    } else {
      acc.push({ dia, [curr._id.accion]: curr.count });
    }
    return acc;
  }, []) || [];

  return (
    <PortalLayout>
      <div className="dashboard-container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1>Panel de Inteligencia Documental</h1>
            <p className="text-muted">Estado actual de la gestión, cumplimiento y producción de <strong>{auth.getSelectedEmpresa()?.razonSocial}</strong>.</p>
          </div>
          <button className="btn btn-ghost" onClick={() => {
            const csv = "Serie;Cantidad\n" + data?.produccion.map(p => `${p._id};${p.count}`).join("\n");
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Reporte_Produccion_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}>
            <IconsMd.MdFileDownload /> Exportar Producción
          </button>
        </header>

        {/* KPIs Superiores */}
        <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div className="card kpi-card" style={{ padding: '20px', borderLeft: '5px solid #3498db' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span className="small text-muted">Producción Total</span>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '5px 0' }}>
                  {data?.produccion.reduce((a, b) => a + b.count, 0) || 0}
                </p>
              </div>
              <MdArticle size={32} color="#3498db" />
            </div>
            <span className="small success-text">Documentos emitidos</span>
          </div>

          <div className="card kpi-card" style={{ padding: '20px', borderLeft: '5px solid #2ecc71' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span className="small text-muted">Madurez Archivística</span>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '5px 0' }}>{data?.madurez.porcentajeCompletitud}%</p>
              </div>
              <MdTrendingUp size={32} color="#2ecc71" />
            </div>
            <span className="small">{data?.madurez.faseActual.replace('_', ' ')}</span>
          </div>

          <div className="card kpi-card" style={{ padding: '20px', borderLeft: '5px solid #f1c40f' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span className="small text-muted">Expedientes Abiertos</span>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '5px 0' }}>
                  {data?.inventario.filter(i => i._id.estado === 'ABIERTO').reduce((a, b) => a + b.count, 0) || 0}
                </p>
              </div>
              <MdFolder size={32} color="#f1c40f" />
            </div>
            <span className="small">Trámites en curso</span>
          </div>

          <div className="card kpi-card" style={{ padding: '20px', borderLeft: '5px solid #9b59b6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span className="small text-muted">Eventos Auditoría</span>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '5px 0' }}>
                  {data?.auditoria.reduce((a, b) => a + b.count, 0) || 0}
                </p>
              </div>
              <MdSecurity size={32} color="#9b59b6" />
            </div>
            <span className="small">Últimos 7 días</span>
          </div>
        </div>

        {/* Gráficas Centrales */}
        <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          <section className="card" style={{ padding: '20px' }}>
            <h3>Producción por Serie Documental (Top 5)</h3>
            <div style={{ width: '100%', height: '300px', marginTop: '20px' }}>
              <ResponsiveContainer>
                <BarChart data={produccionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#3498db" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card" style={{ padding: '20px' }}>
            <h3>Estado del Inventario</h3>
            <div style={{ width: '100%', height: '300px', marginTop: '20px' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={inventarioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {inventarioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Actividad Reciente */}
        <div style={{ marginTop: '30px' }}>
          <section className="card" style={{ padding: '20px' }}>
            <h3>Actividad del Sistema (Últimos 7 días)</h3>
            <div style={{ width: '100%', height: '250px', marginTop: '20px' }}>
              <ResponsiveContainer>
                <LineChart data={auditData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dia" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="PROYECTAR_DOCUMENTO" name="Emisión" stroke="#3498db" strokeWidth={2} />
                  <Line type="monotone" dataKey="LOGIN" name="Accesos" stroke="#2ecc71" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
      <style>{`
        .kpi-card { transition: transform 0.2s; cursor: default; }
        .kpi-card:hover { transform: translateY(-5px); }
        .success-text { color: #27ae60; font-weight: 500; }
      `}</style>
    </PortalLayout>
  );
}
