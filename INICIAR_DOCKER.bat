@echo off
chcp 65001 >nul
title INICIAR DOCKER ENGINE NATIVO (WSL)
color 0A
echo ========================================================================
echo   DIRETOR 360 - INICIAR DOCKER ENGINE NATIVO (WSL Ubuntu-24.04)
echo ========================================================================
echo.
echo [1/3] Iniciando servico Docker Engine...
wsl -d Ubuntu-24.04 -u root -- systemctl start docker.socket docker.service
echo.
echo [2/3] Verificando conexao com o Docker...
wsl -d Ubuntu-24.04 -u fael -- docker info >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Docker Engine esta ATIVO e respondendo perfeitamente!
    echo.
    echo [3/3] Containers atuais:
    wsl -d Ubuntu-24.04 -u fael -- docker ps
) else (
    echo [ERRO] Falha ao comunicar com o Docker Engine.
)
echo.
echo ========================================================================
echo   DOCKER PRONTO PARA USO! (Pressione qualquer tecla para fechar)
echo ========================================================================
pause >nul