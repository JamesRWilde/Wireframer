# Clean OBJ strings in all *.mesh.js files in the meshes folder
# Keeps only 'v' and 'f' lines inside OBJ string blocks, preserves all other code/comments

$meshFolder = Join-Path $PSScriptRoot '..\meshes'
$files = Get-ChildItem -Path $meshFolder -Filter '*.mesh.js'

foreach ($file in $files) {
    Write-Host "Cleaning: $($file.Name) ..."
    $reader = [System.IO.StreamReader]::new($file.FullName)
    $outLines = New-Object System.Collections.Generic.List[string]
    $inObjString = $false
    $lineNum = 0
    while (($line = $reader.ReadLine()) -ne $null) {
        $lineNum++
        if ($line -match '`') {
            $inObjString = -not $inObjString
            $outLines.Add($line)
            continue
        }
        if ($inObjString) {
            if ($line -match '^(v |f )') {
                $outLines.Add($line)
            }
        } else {
            $outLines.Add($line)
        }
        if ($lineNum % 1000 -eq 0) {
            Write-Host "  Processed $lineNum lines..."
        }
    }
    $reader.Close()
    Set-Content -Path $file.FullName -Value $outLines
    Write-Host "Cleaned: $($file.Name) ($lineNum lines processed)"
}
