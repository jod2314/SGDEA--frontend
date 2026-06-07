# Gate de Testing Reforzado - Frontend SGDEA v2.0
# Ejecutar antes de cualquier commit
# Uso: .\.agents\scripts\run_tests.ps1
# Protocolo de Orquestacion v2.0

param(
    [switch]$Verbose,
    [switch]$SkipTests   # Usar solo si los tests aun no estan configurados
)

$ErrorActionPreference = "Continue"
$repoRoot   = Resolve-Path "$PSScriptRoot\..\.."
$hitosPath  = "$repoRoot\docs\HITOS.md"
$fecha      = Get-Date -Format "yyyy-MM-dd HH:mm"
$exitCode   = 0
$warnings   = @()

Write-Host ""
Write-Host "[TEST v2.0] Gate de Testing - Frontend SGDEA" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

Set-Location $repoRoot

# -- 1. Verificar TypeScript --------------------------------------------------
Write-Host ""
Write-Host "[TS] Verificando TypeScript (tsc --noEmit)..." -ForegroundColor Blue
$tsOutput = npx tsc --noEmit 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Errores de TypeScript detectados:" -ForegroundColor Red
    $tsOutput | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    $exitCode = 1
} else {
    Write-Host "   [OK] TypeScript: sin errores" -ForegroundColor Green
}

# -- 2. Linter (ESLint) --------------------------------------------------------
if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "[LINT] Ejecutando ESLint..." -ForegroundColor Blue
    $lintOutput = npx eslint src --ext ts,tsx 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ADVERTENCIA] ESLint reporto advertencias o errores:" -ForegroundColor Yellow
        $lintOutput | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
        $warnings += "Lint: advertencias o errores de ESLint"
        # Lint es bloqueante si hay errores reales (no warnings)
        $lintErrors = $lintOutput | Where-Object { $_ -match "\s+error\s+" }
        if ($lintErrors) {
            Write-Host "[PAUSA] Errores criticos de lint. Corregir antes de continuar." -ForegroundColor Red
            $exitCode = 2  # Codigo 2 = pausa (no rollback)
        }
    } else {
        Write-Host "   [OK] ESLint: sin errores" -ForegroundColor Green
    }
}

# -- 3. Tests Vitest con cobertura ---------------------------------------------
if ($exitCode -eq 0 -and -not $SkipTests) {
    Write-Host ""
    Write-Host "[RUN] Ejecutando tests (Vitest + cobertura)..." -ForegroundColor Blue

    # Verificar si Vitest esta configurado
    $hasVitest = (Get-Content "$repoRoot\package.json" -Raw) -match '"vitest"'
    $hasTestScript = (Get-Content "$repoRoot\package.json" -Raw) -match '"test"'

    if (-not $hasVitest -or -not $hasTestScript) {
        Write-Host "   [ADVERTENCIA] Tests no configurados. Revisar stack.config.md." -ForegroundColor Yellow
        $warnings += "Tests: Vitest no configurado - instalar y configurar"
    } else {
        $testOutput = npm run test -- --coverage 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[FALLO] Tests fallaron. Bloqueando commit." -ForegroundColor Red
            $testOutput | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
            $exitCode = 1
        } else {
            # Extraer cobertura de lineas del output
            $coverageLine = $testOutput | Where-Object { $_ -match "Lines\s*\|\s*(\d+\.?\d*)" } | Select-Object -Last 1
            if ($coverageLine -match "(\d+\.?\d*)%") {
                $coveragePct = [float]$Matches[1]
                if ($coveragePct -lt 70) {
                    $warnMsg = "Cobertura: $coveragePct% (minimo recomendado: 70%)"
                    Write-Host "   [ADVERTENCIA] $warnMsg" -ForegroundColor Yellow
                    $warnings += $warnMsg
                } else {
                    Write-Host "   [OK] Tests: cobertura $coveragePct%" -ForegroundColor Green
                }
            } else {
                Write-Host "   [OK] Tests pasaron (cobertura no detectada automaticamente)" -ForegroundColor Green
                $warnings += "Cobertura: no se pudo parsear el porcentaje - revisar manualmente"
            }
        }
    }
} elseif ($SkipTests) {
    Write-Host ""
    Write-Host "   [OMITIDO] Tests omitidos por flag -SkipTests" -ForegroundColor Yellow
    $warnings += "Tests: omitidos manualmente con -SkipTests"
}

# -- 4. Resultado y registro en HITOS.md --------------------------------------
Write-Host ""
if ($exitCode -eq 0) {
    $warningStr = if ($warnings.Count -gt 0) { " | Advertencias: " + ($warnings -join "; ") } else { "" }
    $entrada = "| $fecha | [OK] Gate frontend v2.0 | TS + Lint + Tests OK$warningStr | - |"
    Write-Host "[OK] Gate superado. Procediendo al commit." -ForegroundColor Green
    if ($warnings.Count -gt 0) {
        Write-Host "   Advertencias registradas: $($warnings.Count)" -ForegroundColor Yellow
        $warnings | ForEach-Object { Write-Host "   • $_" -ForegroundColor Yellow }
    }
} elseif ($exitCode -eq 2) {
    $entrada = "| $fecha | [PAUSA] Gate frontend v2.0 | Lint: errores criticos - corregir antes de commit | - |"
    Write-Host "[PAUSA] Corregir errores de lint antes de continuar." -ForegroundColor Yellow
    exit 2
} else {
    $entrada = "| $fecha | [FALLO] Gate frontend v2.0 | Gate fallido - commit bloqueado. Ejecutar rollback.ps1 | - |"
    Write-Host "[ERROR] Gate fallido. Ejecuta rollback.ps1 para revertir cambios." -ForegroundColor Red
}

Add-Content -Path $hitosPath -Value $entrada -ErrorAction SilentlyContinue

exit $exitCode
