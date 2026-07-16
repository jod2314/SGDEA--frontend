# 🔍 Script de Escaneo Preventivo de Contraste
# Detecta colores hardcodeados y variables CSS obsoletas en archivos TSX/CSS
# Ejecutar antes de cada commit para prevenir regresiones de contraste
# Uso: powershell -File .agents/scripts/contrast_scan.ps1

param(
    [string]$Path = "src",
    [switch]$Strict  # Si se activa, falla con exit code 1 al encontrar problemas
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ESCANEO PREVENTIVO DE CONTRASTE v1.0" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Patrones de colores hexadecimales en estilos inline de JSX
$hexPatterns = @(
    "color:\s*[`"']#",
    "background:\s*[`"']#",
    "border.*:\s*[`"'].*#[0-9a-fA-F]",
    "background:\s*#[0-9a-fA-F]",
    "color:\s*#[0-9a-fA-F]",
    "border.*:\s*.*#[0-9a-fA-F]"
)

# Patrones de colores con nombre en estilos inline de JSX
$namedColorPatterns = @(
    "background:\s*[`"']white",
    "background:\s*[`"']black",
    "color:\s*[`"']white",
    "color:\s*[`"']black",
    "background:\s*white;",
    "background:\s*black;",
    "color:\s*white;",
    "color:\s*black;"
)

# Variables CSS obsoletas del proyecto SGDEA
$obsoleteVarPatterns = @(
    "var\(--primary-color\)",
    "var\(--text-muted\)",
    "var\(--border-color\)"
)

$totalIssues = 0
$fileIssues = @{}

# Escanear archivos TSX
$tsxFiles = Get-ChildItem -Path $Path -Recurse -Include "*.tsx" -ErrorAction SilentlyContinue

Write-Host "Escaneando $($tsxFiles.Count) archivos TSX...`n" -ForegroundColor Yellow

foreach ($file in $tsxFiles) {
    $content = Get-Content $file.FullName -ErrorAction SilentlyContinue
    $issues = @()

    for ($i = 0; $i -lt $content.Count; $i++) {
        $line = $content[$i]
        $lineNum = $i + 1

        # Verificar patrones hexadecimales
        foreach ($pattern in $hexPatterns) {
            if ($line -match $pattern) {
                $issues += [PSCustomObject]@{
                    Line = $lineNum
                    Type = "COLOR_HEX"
                    Content = $line.Trim()
                }
                $totalIssues++
                break
            }
        }

        # Verificar colores con nombre
        foreach ($pattern in $namedColorPatterns) {
            if ($line -match $pattern) {
                $issues += [PSCustomObject]@{
                    Line = $lineNum
                    Type = "COLOR_NAMED"
                    Content = $line.Trim()
                }
                $totalIssues++
                break
            }
        }

        # Verificar variables obsoletas
        foreach ($pattern in $obsoleteVarPatterns) {
            if ($line -match $pattern) {
                $issues += [PSCustomObject]@{
                    Line = $lineNum
                    Type = "VAR_OBSOLETA"
                    Content = $line.Trim()
                }
                $totalIssues++
                break
            }
        }
    }

    if ($issues.Count -gt 0) {
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
        $fileIssues[$relativePath] = $issues

        Write-Host "  ❌ $relativePath ($($issues.Count) problemas)" -ForegroundColor Red
        foreach ($issue in $issues) {
            $icon = switch ($issue.Type) {
                "COLOR_HEX"    { "🎨" }
                "COLOR_NAMED"  { "🏷️" }
                "VAR_OBSOLETA" { "⚠️" }
            }
            Write-Host "     $icon L$($issue.Line): $($issue.Content.Substring(0, [Math]::Min(120, $issue.Content.Length)))" -ForegroundColor DarkGray
        }
        Write-Host ""
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RESULTADO DEL ESCANEO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Archivos escaneados: $($tsxFiles.Count)" -ForegroundColor White
Write-Host "  Archivos con problemas: $($fileIssues.Count)" -ForegroundColor $(if ($fileIssues.Count -gt 0) { "Red" } else { "Green" })
Write-Host "  Total de colores fijos detectados: $totalIssues" -ForegroundColor $(if ($totalIssues -gt 0) { "Red" } else { "Green" })
Write-Host "========================================`n" -ForegroundColor Cyan

if ($totalIssues -gt 0) {
    Write-Host "ACCION REQUERIDA: Reemplazar los colores fijos por variables del tema:" -ForegroundColor Yellow
    Write-Host "  Fondos      -> var(--surface), var(--bg-app), var(--primary-light-1)" -ForegroundColor White
    Write-Host "  Textos      -> var(--text-primary), var(--text-secondary), var(--muted)" -ForegroundColor White
    Write-Host "  Bordes      -> var(--glass-border)" -ForegroundColor White
    Write-Host "  Primario    -> var(--primary), var(--primary-hover)" -ForegroundColor White
    Write-Host "  Peligro     -> var(--danger)" -ForegroundColor White
    Write-Host ""

    if ($Strict) {
        Write-Host "MODO ESTRICTO: Se encontraron $totalIssues problemas. Abortando." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ No se encontraron colores fijos ni variables obsoletas. ¡Excelente!" -ForegroundColor Green
}
