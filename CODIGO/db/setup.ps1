# Script de setup de BD PostgreSQL para Puertas Blindadas Finanzas
# Ejecutar desde la raíz del proyecto: .\db\setup.ps1

param(
    [string]$DbName = "pblindadas_finanzas",
    [string]$DbUser = "postgres",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432
)

Write-Host "=== Puertas Blindadas Finanzas - Setup BD ===" -ForegroundColor Cyan

# Crear base de datos (ignora error si ya existe)
Write-Host "Creando base de datos '$DbName'..." -ForegroundColor Yellow
psql -h $DbHost -p $DbPort -U $DbUser -c "CREATE DATABASE $DbName;" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  BD ya existe o error al crear (continuando...)" -ForegroundColor DarkYellow
}

# Ejecutar schema
Write-Host "Ejecutando schema (3 schemas: finanzas, terreno, inventario)..." -ForegroundColor Yellow
psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f "$PSScriptRoot\schema.sql"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Schema ejecutado correctamente." -ForegroundColor Green
} else {
    Write-Host "  Error al ejecutar schema." -ForegroundColor Red
    exit 1
}

# Ejecutar datos de prueba
Write-Host "Insertando datos de prueba..." -ForegroundColor Yellow
psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f "$PSScriptRoot\seed.sql"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Datos insertados correctamente." -ForegroundColor Green
} else {
    Write-Host "  Error al insertar datos." -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Setup completado exitosamente ===" -ForegroundColor Green
Write-Host "Conexión: postgresql://${DbUser}@${DbHost}:${DbPort}/${DbName}" -ForegroundColor Cyan
