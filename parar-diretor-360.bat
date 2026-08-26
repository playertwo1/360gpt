@echo off
title Diretor 360 - Desligador Seguro
echo Parando servicos do Diretor 360...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0parar-diretor-360.ps1"
pause
