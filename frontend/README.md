# SaleVicio — Frontend React 2.0

Interfaz React/Vite responsive para la plataforma SaleVicio.

Para instalación, endpoints, variables de entorno y despliegue, consultar el [README principal](../README.md) y la [guía v2](../docs/DEPLOY_V2.md).

## Desarrollo

```bash
npm ci
cp .env.example .env
npm run dev
```

En `.env`, `VITE_API_URL=http://localhost:3000` para el backend local o la URL pública del backend de Render. El frontend **no almacena credenciales de PostgreSQL**.
