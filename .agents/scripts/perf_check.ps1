# Performance Check - Frontend SGDEA v2.0
# Ejecutar en el Gate de Testing (Fase 3) antes del commit
# Uso: .\.agents\scripts\perf_check.ps1
# Protocolo de Orquestación v2.0

param(
    [switch]$Verbose,
    [switch]$UpdateBaseline   # Actualizar el baseline de performance
)

$ErrorActionPreference = "Stop"
$repoRoot     = Resolve-Path "$PSScriptRoot\..\.."
$hitosPath    = "$repoRoot\docs\HITOS.md"
$redunPath    = "$repoRoot\docs\REDUNDANCIAS.md"
$baselinePath = "$repoRoot\.agents\perf-baseline.json"
$fecha        = Get-Date -Format "yyyy-MM-dd HH:mm"
$warnings     = @()
$blocked      = $false

Write-Host ""
Write-Host "[PERF v2.0] Performance Check - Frontend SGDEA" -ForegroundColor DarkCyan
Write-Host "================================================" -ForegroundColor DarkCyan

Set-Location $repoRoot

# ── 1. Build de producción ────────────────────────────────────────────────────
Write-Host ""
Write-Host "[PERF] Ejecutando npm run build..." -ForegroundColor Blue
$buildOutput = npm run build 2>&1 | Out-String

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build falló:" -ForegroundColor Red
    Write-Host $buildOutput -ForegroundColor Red
    $entrada = "| $fecha | [BLOQUEADO] Perf check | Build falló — commit bloqueado | - |"
    Add-Content -Path $hitosPath -Value $entrada -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "   [OK] Build exitoso" -ForegroundColor Green

# ── 2. Parsear tamaños de chunks ──────────────────────────────────────────────
Write-Host ""
Write-Host "[PERF] Analizando tamaño del bundle..." -ForegroundColor Blue

$chunkLines  = $buildOutput -split "`n" | Where-Object { $_ -match "\.(js|css)\s+\|?\s*([\d.]+)\s*(kB|MB)" }
$totalKB     = 0
$chunkReport = @()

foreach ($line in $chunkLines) {
    if ($line -match "([\w\-./]+\.(js|css))\s+\|?\s*([\d.]+)\s*(kB|MB)") {
        $fileName = $Matches[1].Trim()
        $size     = [float]$Matches[3]
        $unit     = $Matches[4]
        $sizeKB   = if ($unit -eq "MB") { $size * 1024 } else { $size }
        $totalKB += $sizeKB
        $chunkReport += @{ name = $fileName; sizeKB = [math]::Round($sizeKB, 1) }

        # Alertar chunks grandes individualmente
        if ($sizeKB -gt 500) {
            $msg = "Chunk grande: $fileName = $([math]::Round($sizeKB, 1)) kB (>500 kB)"
            Write-Host "   [ADVERTENCIA] $msg" -ForegroundColor Yellow
            $warnings += $msg
        }
    }
}

$totalKBRound = [math]::Round($totalKB, 1)
Write-Host "   Bundle total: $totalKBRound kB" -ForegroundColor Cyan

# ── 3. Comparar con baseline ──────────────────────────────────────────────────
if (Test-Path $baselinePath) {
    $baseline    = Get-Content $baselinePath -Raw | ConvertFrom-Json
    $baseKB      = $baseline.totalKB
    $diffKB      = $totalKBRound - $baseKB
    $diffPct     = if ($baseKB -gt 0) { [math]::Round(($diffKB / $baseKB) * 100, 1) } else { 0 }

    Write-Host "   Baseline anterior: $baseKB kB (fecha: $($baseline.fecha))" -ForegroundColor Gray
    Write-Host "   Diferencia: $diffKB kB ($diffPct%)" -ForegroundColor $(if ($diffPct -gt 5) { "Yellow" } else { "Green" })

    if ($diffPct -gt 10) {
        $msg = "Bundle creció $diffPct% (>10%) sin justificación — considerar code splitting o lazy loading"
        Write-Host "   [ALTO] $msg" -ForegroundColor Red
        $warnings += "[ALTA] $msg"
        $blocked = $true
    } elseif ($diffPct -gt 5) {
        $msg = "Bundle creció $diffPct% (>5%) — documentar justificación"
        Write-Host "   [MEDIO] $msg" -ForegroundColor Yellow
        $warnings += "[MEDIA] $msg"
    } else {
        Write-Host "   [OK] Bundle dentro del umbral aceptable (+$diffPct%)" -ForegroundColor Green
    }
} else {
    Write-Host "   [INFO] Sin baseline previo. Crear uno con -UpdateBaseline" -ForegroundColor Gray
}

# ── 4. Actualizar o crear baseline ────────────────────────────────────────────
if ($UpdateBaseline -or -not (Test-Path $baselinePath)) {
    $newBaseline = @{
        totalKB = $totalKBRound
        fecha   = $fecha
        chunks  = $chunkReport
    } | ConvertTo-Json -Depth 3
    Set-Content -Path $baselinePath -Value $newBaseline
    Write-Host "   [OK] Baseline actualizado: $totalKBRound kB" -ForegroundColor Green
}

# ── 5. Detectar imports circulares (si madge está disponible) ─────────────────
Write-Host ""
Write-Host "[PERF] Verificando imports circulares..." -ForegroundColor Blue
try {
    $madgeOutput = npx --yes madge --circular src/ 2>&1 | Out-String
    if ($madgeOutput -match "Found \d+ circular") {
        $msg = "Imports circulares detectados: $($madgeOutput.Trim())"
        Write-Host "   [ADVERTENCIA] $msg" -ForegroundColor Yellow
        $warnings += "[MEDIA] $msg"
    } else {
        Write-Host "   [OK] Sin imports circulares" -ForegroundColor Green
    }
} catch {
    Write-Host "   [INFO] madge no disponible — instalar con: npm i -D madge" -ForegroundColor Gray
}

# ── 6. Resultado ─────────────────────────────────────────────────────────────
Write-Host ""
$warningStr = if ($warnings.Count -gt 0) { $warnings -join " | " } else { "Sin advertencias" }

if ($blocked) {
    $entrada = "| $fecha | [BLOQUEADO] Perf check | Bundle creció >10%. $warningStr | - |"
    Write-Host "[BLOQUEADO] Performance check requiere revisión. Notificar al usuario." -ForegroundColor Red

    # Registrar en REDUNDANCIAS.md
    $redunEntry = "| $fecha | Bundle size | ALTA | Bundle creció >10% vs baseline | Revisar imports y code splitting |"
    Add-Content -Path $redunPath -Value $redunEntry -ErrorAction SilentlyContinue

    Add-Content -Path $hitosPath -Value $entrada -ErrorAction SilentlyContinue
    exit 2  # Código 2 = pausa (no rollback)
} else {
    $entrada = "| $fecha | [OK] Perf check | Bundle: $totalKBRound kB. $warningStr | - |"
    Write-Host "[APROBADO] Performance check superado. Bundle: $totalKBRound kB" -ForegroundColor Green
    if ($warnings.Count -gt 0) {
        Write-Host "Advertencias (no bloqueantes):" -ForegroundColor Yellow
        $warnings | ForEach-Object { Write-Host "  • $_" -ForegroundColor Yellow }

        # Registrar advertencias en REDUNDANCIAS.md
        foreach ($w in $warnings) {
            $redunEntry = "| $fecha | Bundle/Performance | MEDIA | $w | Revisar en próximo hito |"
            Add-Content -Path $redunPath -Value $redunEntry -ErrorAction SilentlyContinue
        }
    }
    Add-Content -Path $hitosPath -Value $entrada -ErrorAction SilentlyContinue
    exit 0
}
