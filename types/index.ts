export interface Negocio {
  id: string;
  user_id: string;
  nombre: string;
  saldo_actual: number;
  ingresos_mensuales: number;
  gastos_fijos: number;
  gastos_variables: number;
  created_at: string;
}

export interface Transaccion {
  id: string;
  negocio_id: string;
  user_id: string;
  tipo: 'ingreso' | 'gasto';
  monto: number;
  descripcion: string;
  fecha: string;
  created_at: string;
}