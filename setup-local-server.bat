@echo off
REM ============================================================
REM Servidor Local - Setup e Configuração
REM ============================================================
REM Este script:
REM   1. Solicita permissões de administrador
REM   2. Instala dependências Python necessárias
REM   3. Inicia o servidor local na porta 8080
REM ============================================================

setlocal enabledelayedexpansion

REM Cores para output
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

echo.
echo !BLUE!================================================!RESET!
echo !BLUE!    Servidor Local - Licitação Agenda!RESET!
echo !BLUE!================================================!RESET!
echo.

REM Verificar permissões de administrador
echo !YELLOW![1/4]!RESET! Verificando permissões de administrador...
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo !RED!Erro: Este script precisa ser executado como Administrador!RESET!
    echo.
    echo Por favor:
    echo   1. Clique com botão direito em setup-local-server.bat
    echo   2. Selecione "Executar como administrador"
    echo.
    pause
    exit /b 1
)
echo !GREEN!✓ Permissões de administrador OK!RESET!
echo.

REM Verificar Python
echo !YELLOW![2/4]!RESET! Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo !RED!Erro: Python não está instalado ou não está no PATH!RESET!
    echo.
    echo Por favor instale Python 3.x de https://www.python.org
    echo Certifique-se de marcar "Add Python to PATH" durante a instalação
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set "PYTHON_VERSION=%%i"
echo !GREEN!✓ %PYTHON_VERSION% encontrado!RESET!
echo.

REM Instalar dependências
echo !YELLOW![3/4]!RESET! Instalando dependências Python...
python -m pip install --upgrade pip >nul 2>&1
python -m pip install pystray Pillow >nul 2>&1
if %errorlevel% neq 0 (
    echo !RED!Aviso: Erro ao instalar dependências!RESET!
    echo Tentando novamente...
    python -m pip install pystray Pillow
    if %errorlevel% neq 0 (
        echo !YELLOW!Algumas dependências podem não ter sido instaladas corretamente!RESET!
        echo Continuando mesmo assim...
    )
) else (
    echo !GREEN!✓ Dependências instaladas!RESET!
)
echo.

REM Verificar unidade de rede
echo !YELLOW![4/4]!RESET! Verificando conectividade de rede...
for /f "tokens=*" %%i in ('whoami /logonserver') do set "LOGON_SERVER=%%i"
echo Servidor de logon: !LOGON_SERVER!
echo.

REM Verificar permissões da pasta
echo !BLUE!================================================!RESET!
echo !BLUE!    Testando Permissões de Arquivo!RESET!
echo !BLUE!================================================!RESET!
echo.

REM Criar arquivo de teste no diretório atual
set "TEST_DIR=%cd%"
set "TEST_FILE=!TEST_DIR!\.local-server-test"

echo Testando escrita em: !TEST_DIR!
(
    echo test
) > "!TEST_FILE!" 2>nul

if exist "!TEST_FILE!" (
    del /q "!TEST_FILE!" >nul 2>&1
    echo !GREEN!✓ Permissão de escrita OK!RESET!
) else (
    echo !RED!✗ Sem permissão de escrita no diretório!RESET!
    echo !YELLOW!Verifique as permissões da pasta!RESET!
)
echo.

REM Criar diretório de logs se não existir
if not exist "logs" (
    mkdir logs
    echo !GREEN!✓ Diretório de logs criado!RESET!
)
echo.

REM Iniciar o servidor
echo !BLUE!================================================!RESET!
echo !BLUE!    Iniciando Servidor Local!RESET!
echo !BLUE!================================================!RESET!
echo.
echo !GREEN!✓ Servidor iniciando na porta 8080!RESET!
echo !GREEN!✓ O servidor está ouvindo em: http://localhost:8080!RESET!
echo.
echo Endpoints disponíveis:
echo   • POST /abrir-pasta
echo   • POST /api/bids/create-folder
echo   • POST /api/bids/set-base-path
echo   • POST /api/bids/open-file
echo.
echo !YELLOW!Logs estão sendo salvos em: local-server.log!RESET!
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

REM Iniciar o servidor
python local-server.pyw

REM Se o script chegou aqui, o servidor foi parado
echo.
echo !YELLOW!Servidor parado!RESET!
echo.
pause
