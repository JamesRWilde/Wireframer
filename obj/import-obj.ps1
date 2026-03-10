# OBJ Mesh Import Script for Wireframer (PowerShell)
# Usage: powershell -ExecutionPolicy Bypass -File obj/import-obj.ps1
# Processes all .obj files in obj/input/, generates mesh JS files, and moves processed files to obj/processed/

$InputDir = Join-Path $PSScriptRoot 'input'
$ProcessedDir = Join-Path $PSScriptRoot 'processed'
$MeshesDir = Join-Path $PSScriptRoot '..\meshes'
$LoaderPath = Join-Path $PSScriptRoot '..\loader.js'

if (!(Test-Path $InputDir)) { Write-Error "Input folder not found: $InputDir"; exit 1 }
if (!(Test-Path $ProcessedDir)) { New-Item -ItemType Directory -Path $ProcessedDir | Out-Null }

$ObjFiles = Get-ChildItem $InputDir -Filter *.obj
if ($ObjFiles.Count -eq 0) { Write-Host "No .obj files found in $InputDir"; exit 0 }

foreach ($ObjFile in $ObjFiles) {
        # Patch bootstrap.js
        $BootstrapPath = Join-Path $PSScriptRoot '..\engine\bootstrap.js'
        $Bootstrap = Get-Content $BootstrapPath -Raw
        $meshLine = "'meshes/$($ObjName.ToLower()).mesh.js',"
        if ($Bootstrap -notmatch [regex]::Escape($meshLine)) {
            $Bootstrap = $Bootstrap -replace "(// Mesh files \(OBJ-style format\)[^\[]*)", "$1`n    $meshLine"
            Set-Content -Path $BootstrapPath -Value $Bootstrap -Encoding UTF8
        }
    $ObjName = [System.IO.Path]::GetFileNameWithoutExtension($ObjFile.Name)
    $MeshName = $ObjName.Substring(0,1).ToUpper() + $ObjName.Substring(1)
    $MeshFile = Join-Path $MeshesDir ("$($ObjName.ToLower()).mesh.js")
        $ObjLines = Get-Content $ObjFile.FullName
        # Only allow comments, v, and f lines (no mtllib, usemtl, vt, vn, etc)
        $FilteredLines = $ObjLines | Where-Object { $_ -match '^(#|v |f )' }
        $ObjText = ($FilteredLines -join "`n")
    $MeshJs = 'window.getMesh' + $MeshName + ' = () => `
' + $ObjText + '
`;'
    Set-Content -Path $MeshFile -Value $MeshJs -Encoding UTF8
    Move-Item $ObjFile.FullName (Join-Path $ProcessedDir $ObjFile.Name) -Force

    # Patch loader.js
    $Loader = Get-Content $LoaderPath -Raw
    $key = $ObjName.ToLower()
    $displayName = $MeshName
    $entry = "    { key: '$key', name: '$displayName', build: () => window.getMesh$MeshName`?.() },"
    if ($Loader -notmatch [regex]::Escape($entry)) {
        $Loader = $Loader -replace '(window\.MESH_LIBRARY \|\| \[)', "`$1`n$entry"
        Set-Content -Path $LoaderPath -Value $Loader -Encoding UTF8
    }
}
Write-Host 'All done.'
