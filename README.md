# StockMaster — Sistema de Gestión de Inventarios

API REST construida con **NestJS + TypeORM + MySQL + JWT**.

---

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js     | 18+           |
| npm         | 9+            |
| MySQL       | 8+            |

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Crear base de datos en MySQL
mysql -u root -p -e "CREATE DATABASE stockmaster;"

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MySQL y un JWT_SECRET seguro

# 4. Arrancar en modo desarrollo
npm run start:dev
```

---

## URLs importantes

| Recurso        | URL                                  |
|----------------|--------------------------------------|
| API base       | http://localhost:3000/api/v1         |
| Swagger (docs) | http://localhost:3000/api/docs       |

---

## Estructura del proyecto

```
src/
├── auth/
│   ├── decorators/  → @Roles(Role.ADMIN)
│   ├── dto/         → login.dto.ts
│   ├── guards/      → roles.guard.ts
│   ├── strategies/  → jwt.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── users/
│   ├── dto/         → create-user.dto.ts
│   └── entities/    → user.entity.ts
├── common/
│   └── enums/       → role.enum.ts
├── app.module.ts    ← ConfigModule + TypeORM
└── main.ts          ← Swagger + ValidationPipe
```

---

## Roles y permisos

| Acción                   | ADMIN | BODEGUERO | CONSULTOR |
|--------------------------|:-----:|:---------:|:---------:|
| Crear producto           | ✅    | ✅        | ❌        |
| Actualizar/Eliminar      | ✅    | ❌        | ❌        |
| Listar productos         | ✅    | ✅        | ✅        |
| Crear categorías         | ✅    | ❌        | ❌        |
| Registrar entrada/salida | ❌    | ✅        | ❌        |
| Ver movimientos          | ✅    | ✅        | ✅        |

---

## Flujo de autenticación

```
POST /api/v1/auth/register   → crear usuario
POST /api/v1/auth/login      → obtener JWT
GET  /api/v1/auth/profile    → perfil (requiere Bearer token)
```

En Swagger: login → copiar `access_token` → clic en 🔒 Authorize → pegar token.

---

## WebSocket — Socket.IO (Tiempo real)

El servidor WebSocket se conecta en la misma URL y puerto que la API REST.

### Conexión

```js
const socket = io('http://localhost:3000', {
  auth: { token: '<JWT_ACCESS_TOKEN>' },
});
```

### Eventos que emite el servidor (escuchar)

| Evento             | Payload                                      | Descripción                                      | Sala destino |
|--------------------|----------------------------------------------|--------------------------------------------------|-------------|
| `users:online`     | `ConnectedUser[]`                            | Lista de usuarios conectados (solo ADMIN)        | `admins`    |
| `stock:low`        | `{ id, nombre, stockActual, stockMinimo, … }` | Alerta de stock por debajo del mínimo           | `admins`    |
| `movement:created` | `Movement`                                   | Nuevo movimiento de inventario registrado        | `inventory` |
| `product:created`  | `Producto`                                   | Un nuevo producto fue creado                     | `inventory` |
| `product:updated`  | `Producto`                                   | Un producto fue actualizado                      | `product:{id}` |
| `product:deleted`  | `{ id }`                                     | Un producto fue eliminado                        | `inventory` |
| `joinedAdminRoom`  | `{ room: 'admins' }`                         | Confirmación de ingreso a sala de admins         | individual  |

### Eventos que recibe el servidor (emitir)

| Evento             | Payload      | Descripción                                      |
|--------------------|--------------|--------------------------------------------------|
| `joinAdminRoom`    | —            | El cliente solicita unirse a la sala `admins`    |
| `product:watch`    | `productId`  | Comienza a monitorear un producto específico     |
| `product:unwatch`  | `productId`  | Deja de monitorear un producto específico        |

### Salas (rooms)

| Sala         | Descripción                                                    |
|-------------|----------------------------------------------------------------|
| `inventory` | Todos los clientes autenticados entran automáticamente        |
| `admins`    | Solo usuarios con rol `ADMIN` (por JWT o mediante `joinAdminRoom`) |

> **Nota:** El evento `users:online` solo se envía a la sala `admins`, por lo que únicamente los administradores reciben notificaciones de quién está conectado.

### `ConnectedUser` interface

```ts
interface ConnectedUser {
  id: number;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'BODEGUERO' | 'CONSULTOR';
}
```