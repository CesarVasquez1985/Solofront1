export interface ProductoModel {
  id: number;
  codigo: string; // SKU
  nombre: string;
  descripcion?: string | null;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  activo: boolean;
}

export type ProductoCreate = Omit<ProductoModel, 'id' | 'activo'> & { activo?: boolean };
export type ProductoUpdate = ProductoModel;
