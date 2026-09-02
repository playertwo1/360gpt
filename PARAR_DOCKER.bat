@echo off
chcp 65001 >nul
title PARAR DOCKER ENGINE TOTALMENTE (WSL)
color 0C
echo ========================================================================
echo   DIRETOR 360 - PARAR DOCKER ENGINE TOTALMENTE (LIBERAR RAM E CPU)
echo ========================================================================
echo.
echo [1/3] Parando todos os containers ativos...
wsl -d Ubuntu-24.04 -u fael -- bash -c "docker stop $(docker ps -q) 2>/dev/null"
echo.
echo [2/3] Parando servicos do Docker Engine...
wsl -d Ubuntu-24.04 -u root -- systemctl stop docker.service docker.socket
echo.
echo [3/3] Desligando o WSL para liberar 100%% da memoria RAM...
wsl --shutdown
echo.
echo ========================================================================
echo   DOCKER E WSL TOTALMENTE DESLIGADOS COM SUCESSO!
echo   (Nenhum processo em segundo plano consumindo recursos)
echo ========================================================================
echo.
echo Pressione qualquer tecla para fechar...
pause >nul