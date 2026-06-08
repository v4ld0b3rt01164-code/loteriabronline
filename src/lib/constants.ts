export const ANIMAIS: Record<number, string> = {
  1: 'Avestruz', 2: 'Águia', 3: 'Burro', 4: 'Borboleta',
  5: 'Cachorro', 6: 'Cabra', 7: 'Carneiro', 8: 'Camelo',
  9: 'Cobra', 10: 'Coelho', 11: 'Cavalo', 12: 'Elefante',
  13: 'Galo', 14: 'Gato', 15: 'Jacaré', 16: 'Leão',
  17: 'Macaco', 18: 'Porco', 19: 'Pavão', 20: 'Peru',
  21: 'Touro', 22: 'Tigre', 23: 'Urso', 24: 'Veado',
  25: 'Vaca',
};

export const LOTERIA_PAGES = [
  { slug: 'index', label: 'RIO / LBR / FEDERAL', page: '/' },
  { slug: 'look', label: 'LOOK - GOIÁS', page: '/look' },
  { slug: 'nacional', label: 'NACIONAL', page: '/nacional' },
  { slug: 'bahia', label: 'BAHIA', page: '/bahia' },
  { slug: 'saopaulo', label: 'SÃO PAULO', page: '/saopaulo' },
] as const;

export const FILTROS: Record<string, string[]> = {
  index: ['BR', 'RIO DE JANEIRO', 'FEDERAL'],
  look: ['GOIÁS'],
  nacional: ['NACIONAL'],
  bahia: ['BAHIA'],
  saopaulo: ['SÃO PAULO'],
  federal: ['FEDERAL'],
};

export const NOMES_LOTERIAS: Record<string, string> = {
  NACIONAL: 'NACIONAL',
  FEDERAL: 'FEDERAL',
  RJ: 'RIO DE JANEIRO',
  SP: 'SÃO PAULO',
  BA: 'BAHIA',
  LBR: 'BR',
  LOOK: 'GOIÁS',
};

export const API_URL =
  window.API_URL ||
  'https://atualiza-resultados.v4ld0b3rt01164.workers.dev/api/listar';
