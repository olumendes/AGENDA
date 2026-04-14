#!/usr/bin/env python3
"""
Local server para abrir pastas e arquivos no Windows Explorer.
Fornece endpoints API para o React app gerenciar licitações.

Use este script quando acessar a ferramenta de outro computador.

Como usar:
  1. Coloque este arquivo na raiz do projeto
  2. Execute: python local-server.py
  3. O servidor ficará ouvindo em http://localhost:8080
  4. Pressione Ctrl+C para parar

O servidor fornece os seguintes endpoints:
  • POST /abrir-pasta - Abre um arquivo ou pasta
  • POST /api/bids/create-folder - Cria estrutura de pastas para licitações
  • POST /api/bids/set-base-path - Define o caminho base
  • POST /api/bids/open-file - Abre arquivo no explorer
"""

import http.server
import socketserver
import json
import os
import subprocess
import platform
import base64
from urllib.parse import urlparse
from datetime import datetime

PORT = 8080

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
            print(f"[ERROR] JSON decode error: {str(e)}")
            self.send_json_response({'error': 'Invalid JSON'}, 400)
        except Exception as e:
            print(f"[ERROR] Server error: {str(e)}")
            self.send_json_response({'error': f'Server error: {str(e)}'}, 500)
    
    def handle_abrir_pasta(self, data):
        """Handle POST /abrir-pasta - Opens a file or folder"""
        file_path = data.get('filePath', '')
        
        if not file_path:
            print("[WARNING] Requisição recebida sem filePath")
            self.send_json_response({'error': 'filePath is required'}, 400)
            return
        
        # Normalize path
        file_path = os.path.normpath(file_path)
        
        # Check if path exists
        if not os.path.exists(file_path):
            print(f"[WARNING] Caminho não existe: {file_path}")
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
            
            print(f"[INFO] Aberto com sucesso: {file_path}")
            self.send_json_response({
                'success': True,
                'message': f'Opened: {file_path}'
            })
        
        except Exception as e:
            print(f"[ERROR] Erro ao abrir arquivo: {str(e)}")
            self.send_json_response({'error': f'Failed to open: {str(e)}'}, 500)
    
    def handle_create_folder(self, data):
        """Handle POST /api/bids/create-folder - Creates bid folder structure"""
        base_path = data.get('basePath', '')
        bid = data.get('bid', {})
        
        if not base_path or not bid:
            print("[WARNING] Missing required fields in create-folder request")
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
                print(f"[INFO] Creating bid folder: {bid_folder_path}")
                os.makedirs(bid_folder_path, exist_ok=True)
            
            if not os.path.exists(docs_path):
                print(f"[INFO] Creating docs folder: {docs_path}")
                os.makedirs(docs_path, exist_ok=True)
            
            if not os.path.exists(anexos_path):
                print(f"[INFO] Creating anexos folder: {anexos_path}")
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
                                    print(f"[INFO] Saved attachment: {file_path}")
                                else:
                                    saved_attachments.append({
                                        'name': att['name'],
                                        'type': att['type'],
                                        'isNew': False
                                    })
                    except Exception as att_error:
                        print(f"[ERROR] Error saving attachment {att.get('name')}: {str(att_error)}")
                        continue
            
            new_count = sum(1 for a in saved_attachments if a['isNew'])
            existing_count = sum(1 for a in saved_attachments if not a['isNew'])
            
            message = f"Pasta da licitação processada com sucesso"
            if new_count > 0:
                message += f" ({new_count} novos anexos salvos)"
            if existing_count > 0:
                message += f" ({existing_count} anexos já existentes)"
            
            print(f"[INFO] Folder creation success: {message}")
            
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
            print(f"[ERROR] Error creating folder: {str(e)}")
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
            
            print(f"[INFO] Base path set successfully: {base_path}")
            
            self.send_json_response({
                'success': True,
                'basePath': base_path,
                'message': 'Base path set successfully',
            })
        
        except Exception as e:
            print(f"[ERROR] Error setting base path: {str(e)}")
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
            print(f"[INFO] {msg_type} opened successfully: {file_path}")
            
            self.send_json_response({
                'success': True,
                'message': f'{msg_type} opened successfully',
            })
        
        except Exception as e:
            print(f"[ERROR] Error opening file: {str(e)}")
            self.send_json_response({'error': f'Failed to open file: {str(e)}'}, 500)
    
    def log_message(self, format, *args):
        """Override to customize log messages"""
        print(f"[{self.log_date_time_string()}] {format % args}")


def main():
    """Start the local server"""
    Handler = APIHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🚀 Local server running on http://localhost:{PORT}")
        print(f"📁 Endpoints disponíveis:")
        print(f"   • POST /abrir-pasta")
        print(f"   • POST /api/bids/create-folder")
        print(f"   • POST /api/bids/set-base-path")
        print(f"   • POST /api/bids/open-file")
        print(f"✅ Keep this window open while using the app")
        print(f"Press Ctrl+C to stop the server\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n✋ Server stopped")


if __name__ == "__main__":
    main()
