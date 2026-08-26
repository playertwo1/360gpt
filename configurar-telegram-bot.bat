@echo off
chcp 65001 > nul
title Diretor 360 - Configurador do Telegram Bot
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\setup-telegram-bot.ps1"
pause
