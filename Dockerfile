# ==========================================
# Etapa 1: Compilación de Vite/React + TS
# ==========================================
FROM node:20-alpine as build-stage

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código y compilar para producción
COPY . .
RUN npm run build

# ==========================================
# Etapa 2: Servidor NGINX Alpine Ligero
# ==========================================
FROM nginx:alpine as production-stage

# Copiar los assets compilados de React desde el build-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Mover nuestra configuración personalizada al NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
