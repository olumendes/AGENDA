#!/usr/bin/env python3
"""
Servidor Local para abrir pastas e arquivos no Windows - com Bandeja do Sistema

Este script roda em background na bandeja do Windows (sem exibir console).
Fornece endpoints API para o React app gerenciar licitações.

Requisitos:
  - Python 3.x
  - pystray (pip install pystray)
  - Pillow (pip install Pillow)

Como usar:
  1. Coloque este arquivo na raiz do projeto
  2. Execute: python local-server.pyw (ou clique duas vezes no arquivo)
  3. Um ícone aparecerá na bandeja do Windows
  4. O servidor ficará ouvindo em http://localhost:8080
"""

import http.server
import socketserver
import json
import os
import subprocess
import platform
import threading
import logging
import base64
from urllib.parse import urlparse, parse_qs
from pathlib import Path
from datetime import datetime

# Tente importar pystray e Pillow
try:
    from pystray import Icon, Menu, MenuItem
    from PIL import Image, ImageDraw
except ImportError:
    print("❌ Erro: pystray e/ou Pillow não estão instalados")
    print("\nExecute no prompt de comando:")
    print("  pip install pystray Pillow")
    print("\nDepois execute novamente este arquivo.")
    input("Pressione Enter para fechar...")
    exit(1)

PORT = 8080

# Configurar logging em arquivo
LOG_FILE = "local-server.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()  # Também mostra no console se houver
    ]
)
logger = logging.getLogger(__name__)

# Variáveis globais para controlar o servidor
server = None
server_thread = None
is_running = False

# Mapeamento de tipos de anexo para nomes de pastas
ATTACHMENT_FOLDERS = {
    "proposta-inicial": "Proposta Inicial",
    "proposta-final": "Proposta Final",
    "empenhos": "Empenhos",
    "atas": "Atas",
    "edital": "Edital",
    "termo": "Termo de Referência",
    "resultado": "Resultado",
    "outro": "Outros",
}


class APIHandler(http.server.SimpleHTTPRequestHandler):
    """Handler para requisições HTTP/API"""
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
    
    def send_json_response(self, data, status=200):
        """Enviar resposta JSON com headers CORS"""
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path).path
        
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else b''
            data = json.loads(body.decode('utf-8')) if body else {}
            
            # Route handling
            if parsed_path == '/abrir-pasta':
                self.handle_abrir_pasta(data)
            elif parsed_path == '/api/bids/create-folder':
                self.handle_create_folder(data)
            elif parsed_path == '/api/bids/set-base-path':
                self.handle_set_base_path(data)
            elif parsed_path == '/api/bids/open-file':
                self.handle_open_file(data)
            else:
                self.send_json_response({'error': f'Endpoint not found: {parsed_path}'}, 404)
        
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            self.send_json_response({'error': 'Invalid JSON'}, 400)
        except Exception as e:
            logger.error(f"Server error: {str(e)}")
            self.send_json_response({'error': f'Server error: {str(e)}'}, 500)
    
    def handle_abrir_pasta(self, data):
        """Handle POST /abrir-pasta - Opens a file or folder"""
        file_path = data.get('filePath', '')
        
        if not file_path:
            logger.warning("Requisição recebida sem filePath")
            self.send_json_response({'error': 'filePath is required'}, 400)
            return
        
        # Normalize path
        file_path = os.path.normpath(file_path)
        
        # Check if path exists
        if not os.path.exists(file_path):
            logger.warning(f"Caminho não existe: {file_path}")
            self.send_json_response({'error': f'Path does not exist: {file_path}'}, 400)
            return
        
        # Open the file/folder based on platform
        system = platform.system()
        
        try:
            if system == 'Windows':
                os.startfile(file_path)
            elif system == 'Darwin':
                subprocess.Popen(['open', file_path])
            else:
                subprocess.Popen(['xdg-open', file_path])
            
            logger.info(f"Aberto com sucesso: {file_path}")
            self.send_json_response({
                'success': True,
                'message': f'Opened: {file_path}'
            })
        
        except Exception as e:
            logger.error(f"Erro ao abrir arquivo: {str(e)}")
            self.send_json_response({'error': f'Failed to open: {str(e)}'}, 500)
    
    def handle_create_folder(self, data):
        """Handle POST /api/bids/create-folder - Creates bid folder structure"""
        base_path = data.get('basePath', '')
        bid = data.get('bid', {})
        
        if not base_path or not bid:
            logger.warning("Missing required fields in create-folder request")
            self.send_json_response({'error': 'Missing required fields'}, 400)
            return
        
        try:
            # Verify basePath exists and is writable
            if not os.path.exists(base_path):
                return self.send_json_response({
                    'error': 'Base path does not exist',
                    'details': f'O caminho configurado não existe: {base_path}'
                }, 400)
            
            # Test write access
            test_file = os.path.join(base_path, f".write-test-{int(datetime.now().timestamp() * 1000)}")
            try:
                with open(test_file, 'w') as f:
                    f.write('test')
                os.remove(test_file)
            except Exception:
                return self.send_json_response({
                    'error': 'Permission denied writing to base path',
                    'details': f'Sem permissão de escrita em: {base_path}'
                }, 403)
            
            # Validate bid data
            if not bid.get('bidNumber') or not bid.get('year'):
                return self.send_json_response({
                    'error': 'Invalid bid data',
                    'details': 'Número da licitação e ano são obrigatórios'
                }, 400)
            
            # Create folder structure: basePath/YEAR/STATE/CITY/BIDNUMBER
            path_parts = [base_path, str(bid['year'])]
            
            if bid.get('state'):
                path_parts.append(bid['state'].upper())
            
            if bid.get('city'):
                path_parts.append(bid['city'])
            
            path_parts.append(bid['bidNumber'])
            
            bid_folder_path = os.path.join(*path_parts)
            docs_path = os.path.join(bid_folder_path, "Docs")
            anexos_path = os.path.join(bid_folder_path, "Anexos")
            
            # Create directories
            if not os.path.exists(bid_folder_path):
                logger.info(f"Creating bid folder: {bid_folder_path}")
                os.makedirs(bid_folder_path, exist_ok=True)
            
            if not os.path.exists(docs_path):
                logger.info(f"Creating docs folder: {docs_path}")
                os.makedirs(docs_path, exist_ok=True)
            
            if not os.path.exists(anexos_path):
                logger.info(f"Creating anexos folder: {anexos_path}")
                os.makedirs(anexos_path, exist_ok=True)
            
            # Save notes if provided
            if bid.get('notes'):
                notes_path = os.path.join(docs_path, "Diario_do_Processo.txt")
                with open(notes_path, 'w', encoding='utf-8') as f:
                    f.write(f"Diário do Processo da Licitação {bid['bidNumber']}\n")
                    f.write(f"Criado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n")
                    f.write(bid['notes'])
            
            # Save attachments
            saved_attachments = []
            if bid.get('attachments'):
                for att in bid['attachments']:
                    try:
                        folder_name = ATTACHMENT_FOLDERS.get(att.get('type'), ATTACHMENT_FOLDERS['outro'])
                        type_path = os.path.join(anexos_path, folder_name)
                        
                        if not os.path.exists(type_path):
                            os.makedirs(type_path, exist_ok=True)
                        
                        # Handle base64 encoded files
                        if att.get('url', '').startswith('data:'):
                            base64_data = att['url'].split(',')[1] if ',' in att['url'] else ''
                            if base64_data:
                                file_path = os.path.join(type_path, att['name'])
                                
                                if not os.path.exists(file_path):
                                    with open(file_path, 'wb') as f:
                                        f.write(base64.b64decode(base64_data))
                                    saved_attachments.append({
                                        'name': att['name'],
                                        'type': att['type'],
                                        'isNew': True
                                    })
                                    logger.info(f"Saved attachment: {file_path}")
                                else:
                                    saved_attachments.append({
                                        'name': att['name'],
                                        'type': att['type'],
                                        'isNew': False
                                    })
                    except Exception as att_error:
                        logger.error(f"Error saving attachment {att.get('name')}: {str(att_error)}")
                        continue
            
            new_count = sum(1 for a in saved_attachments if a['isNew'])
            existing_count = sum(1 for a in saved_attachments if not a['isNew'])
            
            message = f"Pasta da licitação processada com sucesso"
            if new_count > 0:
                message += f" ({new_count} novos anexos salvos)"
            if existing_count > 0:
                message += f" ({existing_count} anexos já existentes)"
            
            logger.info(f"Folder creation success: {message}")
            
            self.send_json_response({
                'success': True,
                'bidFolderPath': bid_folder_path,
                'docsPath': docs_path,
                'anexosPath': anexos_path,
                'attachmentsSaved': new_count,
                'attachmentsSkipped': existing_count,
                'message': message,
            })
        
        except Exception as e:
            logger.error(f"Error creating folder: {str(e)}")
            self.send_json_response({'error': f'Failed to create bid folder: {str(e)}'}, 500)
    
    def handle_set_base_path(self, data):
        """Handle POST /api/bids/set-base-path - Validates and sets base path"""
        base_path = data.get('basePath', '')
        
        if not base_path:
            return self.send_json_response({'error': 'Base path is required'}, 400)
        
        try:
            # Verify the path exists or create it
            if not os.path.exists(base_path):
                os.makedirs(base_path, exist_ok=True)
            
            # Verify it's a directory
            if not os.path.isdir(base_path):
                return self.send_json_response({'error': 'Base path is not a directory'}, 400)
            
            logger.info(f"Base path set successfully: {base_path}")
            
            self.send_json_response({
                'success': True,
                'basePath': base_path,
                'message': 'Base path set successfully',
            })
        
        except Exception as e:
            logger.error(f"Error setting base path: {str(e)}")
            self.send_json_response({'error': f'Failed to set base path: {str(e)}'}, 500)
    
    def handle_open_file(self, data):
        """Handle POST /api/bids/open-file - Opens file or folder in explorer"""
        file_path = data.get('filePath', '')
        
        if not file_path:
            return self.send_json_response({'error': 'File path is required'}, 400)
        
        try:
            # Normalize path
            file_path = os.path.normpath(file_path)
            
            # Determine if it's a file or directory
            is_directory = True
            try:
                if os.path.exists(file_path):
                    is_directory = os.path.isdir(file_path)
            except Exception:
                pass  # Assume directory for network paths
            
            system = platform.system()
            
            if system == 'Windows':
                if is_directory:
                    os.startfile(file_path)
                else:
                    os.startfile(os.path.dirname(file_path))
            elif system == 'Darwin':
                subprocess.Popen(['open', '-R' if not is_directory else '', file_path])
            else:
                subprocess.Popen(['xdg-open', os.path.dirname(file_path) if not is_directory else file_path])
            
            msg_type = "Folder" if is_directory else "File"
            logger.info(f"{msg_type} opened successfully: {file_path}")
            
            self.send_json_response({
                'success': True,
                'message': f'{msg_type} opened successfully',
            })
        
        except Exception as e:
            logger.error(f"Error opening file: {str(e)}")
            self.send_json_response({'error': f'Failed to open file: {str(e)}'}, 500)
    
    def log_message(self, format, *args):
        """Override to customize log messages"""
        logger.info(format % args)


def create_icon():
    """Criar ícone para a bandeja do Windows"""
    width, height = 64, 64
    image = Image.new('RGB', (width, height), color='#0066CC')
    draw = ImageDraw.Draw(image)
    
    # Desenhar um círculo branco no centro
    margin = 10
    draw.ellipse(
        [(margin, margin), (width - margin, height - margin)],
        fill='#FFFFFF'
    )
    
    return image


def start_server():
    """Iniciar o servidor HTTP"""
    global server, server_thread, is_running
    
    if is_running:
        logger.warning("Servidor já está rodando")
        return
    
    try:
        server = socketserver.TCPServer(("", PORT), APIHandler)
        is_running = True
        
        logger.info("=" * 60)
        logger.info("🚀 Servidor Local iniciado")
        logger.info(f"📁 Ouvindo em http://localhost:{PORT}")
        logger.info(f"✅ Endpoints disponíveis:")
        logger.info(f"   • POST /abrir-pasta")
        logger.info(f"   • POST /api/bids/create-folder")
        logger.info(f"   • POST /api/bids/set-base-path")
        logger.info(f"   • POST /api/bids/open-file")
        logger.info("=" * 60)
        
        # Rodar o servidor em thread separada
        server_thread = threading.Thread(target=server.serve_forever, daemon=True)
        server_thread.start()
        
    except Exception as e:
        logger.error(f"Erro ao iniciar servidor: {str(e)}")
        is_running = False


def stop_server():
    """Parar o servidor HTTP"""
    global server, is_running
    
    if not is_running:
        return
    
    try:
        if server:
            server.shutdown()
            server.server_close()
        is_running = False
        logger.info("⏹️  Servidor parado")
    except Exception as e:
        logger.error(f"Erro ao parar servidor: {str(e)}")


def open_log_file():
    """Abrir arquivo de log"""
    try:
        log_path = os.path.abspath(LOG_FILE)
        if os.path.exists(log_path):
            if platform.system() == 'Windows':
                os.startfile(log_path)
            elif platform.system() == 'Darwin':
                subprocess.Popen(['open', log_path])
            else:
                subprocess.Popen(['xdg-open', log_path])
        else:
            logger.warning("Arquivo de log não encontrado")
    except Exception as e:
        logger.error(f"Erro ao abrir log: {str(e)}")


def open_folder():
    """Abrir a pasta do projeto"""
    try:
        folder_path = os.path.abspath('.')
        if platform.system() == 'Windows':
            os.startfile(folder_path)
        elif platform.system() == 'Darwin':
            subprocess.Popen(['open', folder_path])
        else:
            subprocess.Popen(['xdg-open', folder_path])
    except Exception as e:
        logger.error(f"Erro ao abrir pasta: {str(e)}")


def on_quit(icon, item):
    """Callback para sair da aplicação"""
    logger.info("❌ Encerrando aplicação...")
    stop_server()
    icon.stop()


def main():
    """Iniciar o servidor com ícone na bandeja"""
    # Iniciar o servidor HTTP
    start_server()
    
    # Criar ícone na bandeja
    icon = Icon(
        name="LocalServer",
        icon=create_icon(),
        title="Servidor Local - Agenda",
        menu=Menu(
            MenuItem(
                "Status: 🟢 Rodando" if is_running else "Status: 🔴 Parado",
                None,
                enabled=False
            ),
            MenuItem("─" * 40, None, enabled=False),
            MenuItem("📁 Abrir Pasta do Projeto", open_folder),
            MenuItem("📋 Ver Log", open_log_file),
            MenuItem("─" * 40, None, enabled=False),
            MenuItem("🛑 Sair", on_quit),
        )
    )
    
    logger.info("✨ Ícone criado na bandeja do Windows")
    icon.run()


if __name__ == "__main__":
    main()
