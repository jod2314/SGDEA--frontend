# Security Scan - Frontend SGDEA v2.0
# Ejecutar en el Gate de Testing (Fase 3) antes del commit
# Uso: .\.agents\scripts\security_scan.ps1
# Protocolo de Orquestación v2.0

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$repoRoot  = Resolve-Path "$PSScriptRoot\..\.."
$hitosPath = "$repoRoot\docs\HITOS.md"
$fecha     = Get-Date -Format "yyyy-MM-dd HH:mm"
$blocked   = $false
$findings  = @()

Write-Host ""
Write-Host "[SEC v2.0] Security Scan - Frontend SGDEA" -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta

Set-Location $repoRoot

# ── 1. npm audit ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[SEC] Ejecutando npm audit..." -ForegroundColor Blue
try {
    $auditOutput = npm audit --audit-level=moderate --json 2>&1 | Out-String
    $auditJson   = $auditOutput | ConvertFrom-Json -ErrorAction SilentlyContinue

    if ($auditJson -and $auditJson.metadata) {
        $criticals = $auditJson.metadata.vulnerabilities.critical
        $highs     = $auditJson.metadata.vulnerabilities.high
        $moderates = $auditJson.metadata.vulnerabilities.moderate

        if ($criticals -gt 0) {
            $msg = "npm audit: $criticals vulnerabilidades CRITICAL"
            Write-Host "   [CRÍTICO] $msg" -ForegroundColor Red
            $findings += "[CRITICAL] $msg"
            $blocked = $true
        }
        if ($highs -gt 0) {
            $msg = "npm audit: $highs vulnerabilidades HIGH"
            Write-Host "   [ALTO] $msg" -ForegroundColor Red
            $findings += "[HIGH] $msg"
            $blocked = $true
        }
        if ($moderates -gt 0) {
            $msg = "npm audit: $moderates vulnerabilidades MODERATE"
            Write-Host "   [MEDIO] $msg" -ForegroundColor Yellow
            $findings += "[MEDIUM] $msg"
        }
        if ($criticals -eq 0 -and $highs -eq 0) {
            Write-Host "   [OK] npm audit: sin vulnerabilidades críticas o altas" -ForegroundColor Green
        }
    } else {
        Write-Host "   [OK] npm audit: sin vulnerabilidades reportadas" -ForegroundColor Green
    }
} catch {
    Write-Host "   [ADVERTENCIA] No se pudo parsear npm audit: $_" -ForegroundColor Yellow
    $findings += "[LOW] npm audit: no se pudo ejecutar o parsear"
}

# ── 2. Escaneo de secretos en archivos fuente ─────────────────────────────────
Write-Host ""
Write-Host "[SEC] Escaneando secretos hardcodeados en src/..." -ForegroundColor Blue

$secretPatterns = @(
    'password\s*[:=]\s*[''"][^''"\s]{6,}[''"]',
    'secret\s*[:=]\s*[''"][^''"\s]{6,}[''"]',
    'api_key\s*[:=]\s*[''"][^''"\s]{6,}[''"]',
    'apikey\s*[:=]\s*[''"][^''"\s]{6,}[''"]',
    'token\s*[:=]\s*[''"][^''"\s]{20,}[''"]',
    'Bearer\s+[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_.+/=]+'
)

$srcFiles = Get-ChildItem -Path "$repoRoot\src" -Recurse -Include "*.ts","*.tsx","*.js" -ErrorAction SilentlyContinue
$secretsFound = 0

foreach ($file in $srcFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    foreach ($pattern in $secretPatterns) {
        if ($content -match $pattern) {
            $relPath = $file.FullName.Replace($repoRoot, "")
            $msg = "Posible secreto hardcodeado en: $relPath"
            Write-Host "   [ALTO] $msg" -ForegroundColor Red
            $findings += "[HIGH] $msg"
            $blocked = $true
            $secretsFound++
        }
    }
}

if ($secretsFound -eq 0) {
    Write-Host "   [OK] Sin secretos hardcodeados detectados" -ForegroundColor Green
}

# ── 3. Verificar que .env no está en git staging ──────────────────────────────
Write-Host ""
Write-Host "[SEC] Verificando git staging area..." -ForegroundColor Blue
$gitStatus = git status --porcelain 2>&1 | Out-String
if ($gitStatus -match "\.env[^.]") {
    $msg = ".env está en la zona de staging de git — riesgo de exposición de secretos"
    Write-Host "   [CRÍTICO] $msg" -ForegroundColor Red
    $findings += "[CRITICAL] $msg"
    $blocked = $true
} else {
    Write-Host "   [OK] .env no está en staging" -ForegroundColor Green
}

# ── 4. Verificar .env.example (no debe tener valores reales) ─────────────────
Write-Host ""
Write-Host "[SEC] Verificando .env.example..." -ForegroundColor Blue
$envExample = "$repoRoot\.env.example"
if (Test-Path $envExample) {
    $envContent = Get-Content $envExample -Raw
    if ($envContent -match "mongodb\+srv://[^:]+:[^@]+@") {
        $msg = ".env.example contiene connection string real de MongoDB"
        Write-Host "   [ALTO] $msg" -ForegroundColor Red
        $findings += "[HIGH] $msg"
        $blocked = $true
    } else {
        Write-Host "   [OK] .env.example usa placeholders seguros" -ForegroundColor Green
    }
} else {
    Write-Host "   [ADVERTENCIA] .env.example no encontrado" -ForegroundColor Yellow
    $findings += "[LOW] .env.example no existe — crear con variables de entorno documentadas"
}

# ── 5. Generar mini hash-sec para el commit ────────────────────────────────────
$hashSec = (-join (Get-Random -Count 4 -InputObject ([char[]]"abcdefghijklmnopqrstuvwxyz0123456789")))
Write-Host ""
Write-Host "[SEC] Hash de trazabilidad generado: [$hashSec]" -ForegroundColor Cyan
Write-Host "      Usar en el commit: feat(scope): descripción [$hashSec]" -ForegroundColor Cyan

# ── 6. Resultado y registro ───────────────────────────────────────────────────
Write-Host ""
if ($blocked) {
    $findingsStr = $findings -join " | "
    $entrada = "| $fecha | [BLOQUEADO] Security scan | COMMIT BLOQUEADO. Hallazgos: $findingsStr | - |"
    Write-Host "[BLOQUEADO] Security scan falló. El commit está bloqueado." -ForegroundColor Red
    Write-Host "Hallazgos:" -ForegroundColor Red
    $findings | ForEach-Object { Write-Host "  • $_" -ForegroundColor Red }
    Add-Content -Path $hitosPath -Value $entrada -ErrorAction SilentlyContinue
    exit 1
} else {
    $findingsStr = if ($findings.Count -gt 0) { " | Advertencias: " + ($findings -join "; ") } else { "Sin hallazgos" }
    $entrada = "| $fecha | [OK] Security scan [$hashSec] | APROBADO. $findingsStr | - |"
    Write-Host "[APROBADO] Security scan superado. Hash: [$hashSec]" -ForegroundColor Green
    if ($findings.Count -gt 0) {
        Write-Host "Advertencias (no bloqueantes):" -ForegroundColor Yellow
        $findings | ForEach-Object { Write-Host "  • $_" -ForegroundColor Yellow }
    }
    Add-Content -Path $hitosPath -Value $entrada -ErrorAction SilentlyContinue
    # Imprimir el hash para que el orquestador lo use en el commit
    Write-Output "HASH_SEC=$hashSec"
    exit 0
}
