@echo off
title Diretor 360 - Iniciador de 1-Clique
echo Iniciando o Diretor 360...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar-diretor-360.ps1"
pause
