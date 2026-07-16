interface PropertyDefinition {
  type: string;
  enum?: string[];
  minimum?: number;
  description?: string;
  format?: string;
}

interface JsonSchema {
  type: string;
  properties: { [key: string]: PropertyDefinition };
  required?: string[];
}

interface FormularioDinamicoProps {
  schema: JsonSchema;
  values: { [key: string]: any };
  onChange: (key: string, value: any) => void;
  errors: { [key: string]: string };
}

export default function FormularioDinamico({ schema, values, onChange, errors }: FormularioDinamicoProps) {
  if (!schema || !schema.properties) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-slate-700/50 rounded-xl bg-slate-800/20 backdrop-blur-sm">
      <div className="col-span-full border-b border-slate-700/60 pb-2 mb-2">
        <h3 className="text-sm font-semibold text-sky-400">Campos Específicos del Tipo Documental</h3>
        <p className="text-xs text-slate-400">Campos dinámicos inyectados por JSON Schema</p>
      </div>

      {Object.entries(schema.properties).map(([key, prop]) => {
        const isRequired = schema.required?.includes(key);
        const error = errors[key];

        return (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
              {key.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase())}
              {isRequired && <span className="text-red-400">*</span>}
            </label>

            {prop.enum ? (
              <select
                value={values[key] || ''}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="">-- Seleccionar --</option>
                {prop.enum.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : prop.type === 'integer' || prop.type === 'number' ? (
              <input
                type="number"
                min={prop.minimum}
                value={values[key] ?? ''}
                onChange={(e) => onChange(key, e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={prop.description || ''}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
              />
            ) : prop.type === 'string' && prop.format === 'date' ? (
              <input
                type="date"
                value={values[key] || ''}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
              />
            ) : (
              <input
                type="text"
                value={values[key] || ''}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={prop.description || ''}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
              />
            )}

            {prop.description && !error && (
              <span className="text-[10px] text-slate-500">{prop.description}</span>
            )}
            {error && (
              <span className="text-[10px] text-red-400 font-medium">{error}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
