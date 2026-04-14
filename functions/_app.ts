/**
 * Cloudflare Pages Function
 * Rota todas as requisições /api/* para os handlers apropriados
 * 
 * Este arquivo substitui o Express server quando hospedado no Cloudflare
 */

import { json, status } from 'itty-router-extras';
import { Router } from 'itty-router';

// Criar router
const router = Router();

/**
 * API: GET /api/ping
 * Simple health check endpoint
 */
router.get('/api/ping', () => {
  return json({
    message: 'pong',
    timestamp: new Date().toISOString(),
    environment: 'cloudflare',
  });
});

/**
 * API: GET /api/demo
 * Demo endpoint que retorna informações
 */
router.get('/api/demo', () => {
  return json({
    message: 'Hello from Cloudflare!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * API: GET /api/bids (exemplo - adicione seus endpoints reais aqui)
 */
router.get('/api/bids', () => {
  return json({
    bids: [],
    message: 'Endpoint de bids pronto',
  });
});

/**
 * API: POST /api/bids
 */
router.post('/api/bids', async (request) => {
  try {
    const body = await request.json();
    return json({
      success: true,
      message: 'Bid criado',
      data: body,
    });
  } catch (error) {
    return json({ error: 'Invalid request' }, { status: 400 });
  }
});

/**
 * Fallback para rotas não encontradas
 */
router.all('*', () => {
  return json(
    {
      error: 'Not Found',
      message: 'Endpoint não encontrado',
      path: 'Verifique a URL e tente novamente',
    },
    { status: 404 }
  );
});

/**
 * Handler principal
 */
export default {
  fetch: (request: Request) => router.handle(request),
};
