#!/usr/bin/env python3
"""
Script de diagnóstico para verificar permissões de rede e conectividade
"""

import os
import sys
import platform
import subprocess
from pathlib import Path

def check_network_drive(drive_letter):
    """Verificar se unidade de rede está acessível"""
    print(f"\n{'='*60}")
    print(f"Verificando unidade: {drive_letter}:")
    print('='*60)
    
    try:
        # Verificar se a unidade existe
        if not os.path.exists(f"{drive_letter}:"):
            print(f"❌ Unidade {drive_letter}: não está acessível")
            return False
        
        # Listar conteúdo
        try:
            contents = os.listdir(f"{drive_letter}:\\")
            print(f"✓ Unidade {drive_letter}: está acessível")
            print(f"  Primeiras pastas: {contents[:5]}")
            
            # Testar escrita
            test_file = f"{drive_letter}:\\.network-test-{os.getpid()}"
            try:
                with open(test_file, 'w') as f:
                    f.write('test')
                os.remove(test_file)
                print(f"✓ Permissão de ESCRITA: SIM")
                return True
            except PermissionError:
                print(f"❌ Permissão de ESCRITA: NÃO (acesso somente leitura)")
                return False
            except Exception as e:
                print(f"⚠  Erro ao testar escrita: {str(e)}")
                return False
                
        except PermissionError:
            print(f"❌ Sem permissão de leitura em {drive_letter}:")
            return False
        except Exception as e:
            print(f"❌ Erro ao acessar {drive_letter}: {str(e)}")
            return False
            
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        return False


def check_path(path):
    """Verificar caminho específico"""
    print(f"\n{'='*60}")
    print(f"Verificando caminho: {path}")
    print('='*60)
    
    try:
        normalized_path = os.path.normpath(path)
        print(f"Caminho normalizado: {normalized_path}")
        
        exists = os.path.exists(normalized_path)
        print(f"Existe: {'✓ SIM' if exists else '❌ NÃO'}")
        
        if exists:
            is_dir = os.path.isdir(normalized_path)
            print(f"É diretório: {'✓ SIM' if is_dir else '❌ NÃO'}")
            
            # Tentar listar conteúdo
            try:
                contents = os.listdir(normalized_path)
                print(f"Conteúdo: {len(contents)} itens")
                print(f"  Primeiros: {contents[:3]}")
            except PermissionError:
                print(f"⚠  Sem permissão de leitura")
            except Exception as e:
                print(f"⚠  Erro ao listar: {str(e)}")
        else:
            # Tentar criar
            print(f"\nTentando criar o caminho...")
            try:
                os.makedirs(normalized_path, exist_ok=True)
                print(f"✓ Caminho criado com sucesso!")
            except PermissionError:
                print(f"❌ Sem permissão para criar diretório")
            except Exception as e:
                print(f"❌ Erro ao criar: {str(e)}")
                
    except Exception as e:
        print(f"❌ Erro: {str(e)}")


def check_python_version():
    """Verificar versão do Python"""
    print(f"\n{'='*60}")
    print("Informações do Sistema")
    print('='*60)
    print(f"Python: {sys.version}")
    print(f"Plataforma: {platform.system()}")
    print(f"Processador: {platform.processor()}")


def check_dependencies():
    """Verificar dependências Python"""
    print(f"\n{'='*60}")
    print("Dependências Python")
    print('='*60)
    
    deps = {
        'pystray': 'Interface de bandeja do sistema',
        'PIL': 'Processamento de imagens',
    }
    
    for module, desc in deps.items():
        try:
            __import__(module)
            print(f"✓ {module:15} - {desc}")
        except ImportError:
            print(f"❌ {module:15} - {desc}")
            print(f"  Instale com: pip install {module}")


def main():
    """Main function"""
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + " "*10 + "DIAGNÓSTICO DE REDE - SERVIDOR LOCAL" + " "*12 + "║")
    print("╚" + "="*58 + "╝")
    
    check_python_version()
    check_dependencies()
    
    # Verificar unidades de rede comuns
    print(f"\n{'='*60}")
    print("Verificando unidades de rede")
    print('='*60)
    
    for drive in ['Z', 'Y', 'X', 'W']:
        check_network_drive(drive)
    
    # Verificar caminho específico do usuário
    user_path = input("\n\nDigite um caminho para verificar (ou pressione Enter para pular): ").strip()
    if user_path:
        check_path(user_path)
    
    print("\n" + "="*60)
    print("Diagnóstico concluído!")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
