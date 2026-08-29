@echo off
chcp 65001 > nul
cls
echo ========================================================================
echo    DIRETOR 360 - PROCESSADOR INSTANTANEO DE PDF PARA PLANILHA COM NBA
echo ========================================================================
echo.
echo Processando documento bancario / POBJ...
echo.

python core/pdf_to_spreadsheet_pipeline.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================================
    echo   SUCESSO! PLANILHA GERADA EM MENOS DE 1 SEGUNDO!
    echo   Arquivo disponivel em: output\pobj_com_nba.csv
    echo ========================================================================
    echo.
) else (
    echo.
    echo Ocorreu um erro no processamento.
)
pause