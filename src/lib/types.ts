
export interface Driver {
  id: string;
  nome: string;
  cpf: string;
  placa_cavalo: string;
  telefone: string;
  ultima_lat: number | null;
  ultima_lng: number | null;
  atualizado_em: string;
}

export interface Cargo {
  id: string;
  motorista_id: string;
  local_carregamento: string;
  hora_inicio: string;
  km_inicial: number;
  local_descarga: string;
  hora_descarga: string | null;
  foto_canhoto_url: string | null;
  criado_em: string;
  status: 'loading' | 'in_transit' | 'delivered';
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
}

export interface AuthData {
  user: User | null;
  isLoggedIn: boolean;
}
