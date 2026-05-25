# Gate de Testing - Frontend SGDEA
# Ejecutar antes de cualquier commit
# Uso: .\.agents\scripts\run_tests.ps1

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path "$PSScriptRoot\..\.."
$hitosPath = "$repoRoot\docs\HITOS.md"
$fecha = Get-Date -Format "yyyy-MM-dd HH:mm"
$exitCode = 0

Write-Host ""
Write-Host "[TEST] Gate de Testing - Frontend SGDEA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location $repoRoot

# -- 1. Verificar TypeScript -------------------------------------------
Write-Host ""
Write-Host "[TS] Verificando TypeScript..." -ForegroundColor Blue
npx tsc --noEmit 2>&1 | Tee-Object -Variable tsOutput | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Error de TypeScript:" -ForegroundColor Red
    Write-Host $tsOutput -ForegroundColor Red
    $exitCode = 1
} else {
    Write-Host "   [OK] TypeScript OK" -ForegroundColor Green
}

# -- 2. Ejecutar tests Vitest ------------------------------------------
if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "[RUN] Ejecutando tests (Vitest)..." -ForegroundColor Blue
    npm test 2>&1 | Tee-Object -Variable testOutput
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[FALLO] Tests fallaron. Bloqueando commit." -ForegroundColor Red
        $exitCode = 1
    } else {
        Write-Host "   [OK] Todos los tests pasaron" -ForegroundColor Green
    }
}

# -- 3. Registrar resultado en HITOS.md --------------------------------
if ($exitCode -eq 0) {
    $entrada = "| $fecha | [OK] Gate de testing | TypeScript + Vitest OK - commit autorizado | - |"
    Write-Host ""
    Write-Host "[OK] Gate superado. Procediendo al commit." -ForegroundColor Green
} else {
    $entrada = "| $fecha | [FALLO] Gate de testing | Gate fallido - commit bloqueado | - |"
    Write-Host ""
    Write-Host "[ERROR] Gate fallido. Ejecuta rollback.ps1 para revertir cambios." -ForegroundColor Red
}

Add-Content -Path $hitosPath -Value $entrada -ErrorAction SilentlyContinue

exit $exitCode
