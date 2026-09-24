@echo off
cd /d "%~dp0"
node "%~dp0scripts\preview.mjs" desktop
if errorlevel 1 pause
