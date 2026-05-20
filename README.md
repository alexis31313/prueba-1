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