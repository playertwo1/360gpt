@echo off
title Diretor 360 - Trocar de Assistente IA (Handoff)
cls
echo ========================================================================
echo   DIRETOR 360 - TROCAR DE ASSISTENTE (ANTIGRAVITY / CODEX)
echo ========================================================================
echo.
echo Executando testes, backup no Google Drive, Git push e sincronizacao...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File scripts\handoff-sync.ps1

echo.
echo Pressione qualquer tecla para fechar esta janela...
pause > nul
