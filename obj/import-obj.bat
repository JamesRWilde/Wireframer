@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0import-obj.ps1"
powershell -ExecutionPolicy Bypass -File "%~dp0clean-meshes.ps1"
echo All done.
pause
