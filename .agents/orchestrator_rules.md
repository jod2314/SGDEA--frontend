# Reglas del Orquestador — Frontend SGDEA

## Scope Permitido

Los subagentes invocados para este repo **SOLO** pueden modificar archivos dentro de:

```
frontend/
├── src/                  ✅ PERMITIDO (todo el árbol)
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── hooks/
│   ├── types/
│   └── utils/
├── public/               ✅ PERMITIDO
├── index.html            ✅ PERMITIDO
├── vite.config.ts        ✅ PERMITIDO (solo si la tarea lo requiere explícitamente)
├── package.json          ✅ PERMITIDO (solo para añadir dependencias aprobadas)
├── tsconfig.json         ⚠️  SOLO con aprobación explícita del usuario
├── .env.example          ✅ PERMITIDO
└── docs/                 ✅ PERMITIDO (HITOS.md, CHANGELOG.md, walkthrough.md)
```

## Archivos PROHIBIDOS para subagentes

```
frontend/
├── .env                  ❌ NUNCA modificar (contiene secretos reales)
├── .git/                 ❌ NUNCA modificar manualmente
├── node_modules/         ❌ NUNCA modificar
├── dist/                 ❌ NUNCA modificar (artefacto de build)
└── .agents/              ❌ NUNCA modificar desde un subagente
```

## Convenciones Obligatorias

1. **Tipos**: Toda nueva interfaz va en `src/types/types.ts`
2. **API calls**: Usar exclusivamente `auth.request<T>(endpoint, options)`
3. **Íconos**: Patrón `const MdIcon = (IconsMd as any).MdIcon`
4. **Comentarios**: En español
5. **Commits**: Formato `tipo(scope): descripción` — ej: `feat(expedientes): añadir modal de cierre`

## Tipos de Commit Permitidos

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Refactorización sin cambio funcional |
| `style` | Cambios de estilo/UI |
| `docs` | Documentación |
| `test` | Tests |
| `chore` | Mantenimiento (deps, config) |

## Criterio de Aceptación General

Un paso se considera completado cuando:
- El código TypeScript compila sin errores (`tsc --noEmit`)
- El linter no reporta errores críticos (`npm run lint`)
- La UI renderiza correctamente en el navegador
- Los cambios están reflejados en `docs/HITOS.md`
