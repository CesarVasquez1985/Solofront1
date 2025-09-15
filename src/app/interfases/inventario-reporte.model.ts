export interface ProductoStockBajo {
  id: number;
  codigo: string;
  nombre: string;
  stock: number;
  umbral: number;
  valorInventario: number;
  precioCompra: number;
}

export interface InventarioReporte {
  totalProductosActivos: number;
  totalItemsEnStock: number;
  valorTotalCosto: number;
  valorTotalVenta: number;
  margenPotencial: number;
  productosStockBajo: ProductoStockBajo[];
  generadoEnUtc: string; // ISO date string
  umbralStockBajo: number;
}
