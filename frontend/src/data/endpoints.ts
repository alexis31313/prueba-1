import type { ModuleDef } from '../types'
import { setToken } from '../api'

export const MODULES: ModuleDef[] = [
  {
    id: 'auth',
    label: 'Auth',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/auth/register',
        fields: [
          { name: 'email', ph: 'email', val: 'test@mail.com' },
          { name: 'nombre', ph: 'nombre', val: 'Test' },
          { name: 'password', type: 'password', ph: 'password', val: 'Test123!$' },
          { name: 'rol', type: 'select', opts: ['ADMIN', 'BODEGUERO', 'CONSULTOR'], val: 'ADMIN' },
        ],
      },
      {
        method: 'POST',
        path: '/api/v1/auth/login',
        fields: [
          { name: 'email', ph: 'email', val: 'test@mail.com' },
          { name: 'password', type: 'password', ph: 'password', val: 'Test123!$' },
        ],
        onSuccess(data) {
          const d = data as Record<string, unknown>
          if (d?.access_token) setToken(d.access_token as string)
        },
      },
      {
        method: 'POST',
        path: '/api/v1/auth/refresh',
        fields: [{ name: 'refresh_token', ph: 'refresh_token' }],
      },
      { method: 'POST', path: '/api/v1/auth/logout' },
      { method: 'GET', path: '/api/v1/auth/profile' },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    endpoints: [
      { method: 'GET', path: '/api/v1/users' },
      {
        method: 'POST',
        path: '/api/v1/users',
        fields: [
          { name: 'email', ph: 'email', val: 'user@mail.com' },
          { name: 'nombre', ph: 'nombre', val: 'User' },
          { name: 'password', type: 'password', ph: 'password', val: 'User1234!' },
          { name: 'rol', type: 'select', opts: ['ADMIN', 'BODEGUERO', 'CONSULTOR'], val: 'CONSULTOR' },
        ],
      },
      { method: 'GET', path: '/api/v1/users/:id', fields: [{ name: 'id', ph: 'user ID' }] },
      {
        method: 'PATCH',
        path: '/api/v1/users/:id',
        fields: [
          { name: 'id', ph: 'user ID' },
          { name: 'nombre', ph: 'nuevo nombre' },
        ],
      },
      { method: 'DELETE', path: '/api/v1/users/:id', fields: [{ name: 'id', ph: 'user ID' }] },
    ],
  },
  {
    id: 'categorias',
    label: 'Categorías',
    endpoints: [
      { method: 'GET', path: '/api/v1/categorias' },
      {
        method: 'POST',
        path: '/api/v1/categorias',
        fields: [
          { name: 'nombre', ph: 'nombre', val: 'Nueva Categoría' },
          { name: 'descripcion', ph: 'descripción (opcional)' },
        ],
      },
      { method: 'GET', path: '/api/v1/categorias/:id', fields: [{ name: 'id', ph: 'category ID' }] },
    ],
  },
  {
    id: 'productos',
    label: 'Productos',
    endpoints: [
      { method: 'GET', path: '/api/v1/productos' },
      {
        method: 'POST',
        path: '/api/v1/productos',
        fields: [
          { name: 'nombre', ph: 'nombre', val: 'Nuevo Producto' },
          { name: 'descripcion', ph: 'descripción (opcional)' },
          { name: 'precio', ph: 'precio', val: '99.99' },
          { name: 'stockActual', ph: 'stock actual', val: '10' },
          { name: 'stockMinimo', ph: 'stock mínimo', val: '2' },
          { name: 'categoriaId', ph: 'categoria ID', val: '1' },
        ],
      },
      {
        method: 'PUT',
        path: '/api/v1/productos/:id',
        fields: [
          { name: 'id', ph: 'product ID' },
          { name: 'nombre', ph: 'nombre' },
          { name: 'precio', ph: 'precio' },
        ],
      },
      { method: 'GET', path: '/api/v1/productos/:id', fields: [{ name: 'id', ph: 'product ID' }] },
      { method: 'DELETE', path: '/api/v1/productos/:id', fields: [{ name: 'id', ph: 'product ID' }] },
    ],
  },
  {
    id: 'movements',
    label: 'Movements',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/movements',
        fields: [
          { name: 'type', type: 'select', opts: ['ENTRADA', 'SALIDA'], val: 'ENTRADA' },
          { name: 'quantity', ph: 'cantidad', val: '5' },
          { name: 'productId', ph: 'product ID', val: '1' },
          { name: 'reason', ph: 'motivo (opcional)' },
        ],
      },
      { method: 'GET', path: '/api/v1/movements' },
      { method: 'GET', path: '/api/v1/movements/:id', fields: [{ name: 'id', ph: 'movement ID' }] },
      { method: 'GET', path: '/api/v1/movements/product/:productId', fields: [{ name: 'productId', ph: 'product ID' }] },
    ],
  },
  {
    id: 'swagger',
    label: 'Swagger',
    endpoints: [
      { method: 'GET', path: '/api/docs', raw: true, desc: 'Abre Swagger UI en una nueva pestaña' },
    ],
  },
]
