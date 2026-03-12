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
    $ObjName = [System.IO.Path]::GetFileNameWithoutExtension($ObjFile.Name)
    if ([string]::IsNullOrWhiteSpace($ObjName)) {
        Write-Error "ObjName is null or empty for file: $($ObjFile.Name)"
        continue
    }
    Write-Host "Importing: $($ObjFile.Name) as $ObjName..."
    $MeshName = $ObjName.Substring(0,1).ToUpper() + $ObjName.Substring(1)
    # Patch bootstrap.js (always lowercase for mesh file lines)
    $BootstrapPath = Join-Path $PSScriptRoot '..\engine\bootstrap.js'
    $meshLine = "    'meshes/$($ObjName.ToLower()).mesh.js',"
    $bootstrapLines = Get-Content $BootstrapPath
    $inserted = $false
    if ($bootstrapLines -notcontains $meshLine) {
        # Find the last mesh file entry in the mesh block
        $lastMeshIdx = -1
        $meshBlockCommentIdx = -1
        for ($i = 0; $i -lt $bootstrapLines.Count; $i++) {
            if ($bootstrapLines[$i] -match "// Mesh files \(OBJ-style format\)") {
                $meshBlockCommentIdx = $i
            }
            if ($bootstrapLines[$i] -match "^\s*'meshes/.*\\.mesh\\.js',") {
                $lastMeshIdx = $i
            }
            # Stop at the first non-mesh file after the mesh block
            if ($lastMeshIdx -ge 0 -and $bootstrapLines[$i] -notmatch "^\s*'meshes/.*\\.mesh\\.js',") {
                break
            }
        }
        if ($lastMeshIdx -ge 0) {
            $bootstrapLines = $bootstrapLines[0..$lastMeshIdx] + $meshLine + $bootstrapLines[($lastMeshIdx+1)..($bootstrapLines.Count-1)]
            $inserted = $true
        } elseif ($meshBlockCommentIdx -ge 0) {
            $insertAt = $meshBlockCommentIdx + 1
            $bootstrapLines = $bootstrapLines[0..($insertAt-1)] + $meshLine + $bootstrapLines[$insertAt..($bootstrapLines.Count-1)]
            $inserted = $true
        }
        if ($inserted) {
            Set-Content -Path $BootstrapPath -Value $bootstrapLines -Encoding UTF8
        }
    }
    $MeshFile = Join-Path $MeshesDir ("$($ObjName.ToLower()).mesh.js")
    $ObjLines = Get-Content $ObjFile.FullName
    # Only allow comments, v, and f lines (no mtllib, usemtl, vt, vn, etc)
    $FilteredLines = $ObjLines | Where-Object { $_ -match '^(#|v |f )' }
    $ObjText = ($FilteredLines -join "`n")
    $MeshJs = 'window.getMesh' + $MeshName + ' = () => `
' + $ObjText + '
`;' 
    Set-Content -Path $MeshFile -Value $MeshJs -Encoding UTF8
    Write-Host "Wrote mesh: $($MeshFile)"
    Move-Item $ObjFile.FullName (Join-Path $ProcessedDir $ObjFile.Name) -Force

    # Patch loader.js (lowercase key, PascalCase build function)
    $Loader = Get-Content $LoaderPath -Raw
    $key = $ObjName.ToLower()
    $displayName = $MeshName
    $entry = "    { key: '$key', name: '$displayName', build: () => window.getMesh$($MeshName)?.() },"
    if ($Loader -notmatch [regex]::Escape($entry)) {
        $Loader = $Loader -replace '(window\.MESH_LIBRARY \|\| \[)', "`$1`n$entry"
        Set-Content -Path $LoaderPath -Value $Loader -Encoding UTF8
    }
}
