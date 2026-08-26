@echo off
chcp 65001 > nul
title Diretor 360 - Telegram Bot Worker
python "%~dp0core\telegram_bot_worker.py"
pause
