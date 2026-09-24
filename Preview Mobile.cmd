@echo off
cd /d "%~dp0"
node "%~dp0scripts\preview.mjs" mobile
if errorlevel 1 pause
