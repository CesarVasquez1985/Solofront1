import { Routes } from '@angular/router';
import { ClienteComponent } from './cliente/cliente.component';
import { UsuariosComponent } from './Administracion/usuarios/usuarios.component';
import { RolesComponent } from './Administracion/roles/roles.component';
import { AccesosComponent } from './Administracion/accesos/accesos.component';
import { NuevoClienteComponent } from './cliente/nuevo-cliente/nuevo-cliente.component';
import { LoginComponent } from './auth/login/login.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { authGuard } from './Services/auth.guard';
import { ProductosListComponent } from './productos/productos-list/productos-list.component';
import { ProductoFormComponent } from './productos/producto-form/producto-form.component';
import { ReporteInventarioComponent } from './productos/reporte-inventario/reporte-inventario.component';

export const routes: Routes = [
  { path: '', component: LoginComponent, pathMatch: 'full' },
  { path: 'login', redirectTo: '', pathMatch: 'full' },
  { path: 'recuperar-password', component: ForgotPasswordComponent },
  { path: 'clientes', component: ClienteComponent, canActivate: [authGuard] },
  { path: 'productos', component: ProductosListComponent, canActivate: [authGuard] },
  { path: 'productos/nuevo', component: ProductoFormComponent, canActivate: [authGuard] },
  { path: 'productos/editar/:id', component: ProductoFormComponent, canActivate: [authGuard] },
  { path: 'productos/reporte-inventario', component: ReporteInventarioComponent, canActivate: [authGuard] },
  { path: 'nuevo-cliente', component: NuevoClienteComponent, pathMatch: 'full', canActivate: [authGuard] },
  { path: 'editar-cliente/:parametro', component: NuevoClienteComponent, pathMatch: 'full', canActivate: [authGuard] },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      { path: 'admin', component: UsuariosComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'accesos', component: AccesosComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
