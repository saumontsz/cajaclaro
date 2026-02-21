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