# Dockerfile

# --- Etapa 1: Construcción (Build Stage) ---
# 1. Usa una imagen base con Node.js para compilar tu código.
FROM node:20-alpine AS build

# 2. Establece el directorio de trabajo dentro del contenedor.
WORKDIR /app

# 3. Copia SOLO los archivos de gestión de dependencias.
COPY package*.json ./

# 4. Instala las dependencias. 'npm ci' es mejor que 'npm install' en builds.
RUN npm ci

# 5. Copia el resto del código fuente.
COPY . .

# 5.1. Declara las variables de entorno como ARG para el build
ARG VITE_API_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}

# 6. Ejecuta el comando de construcción de Vite. Esto genera la carpeta 'dist'.
RUN npm run build

# --- Etapa 2: Servir (Serve Stage) ---
# 7. Usa una imagen base muy ligera de Nginx para servir los archivos estáticos.
FROM nginx:alpine

# 8. Instala envsubst para reemplazar variables de entorno
RUN apk add --no-cache gettext

# 9. Copia el template de configuración de Nginx
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# 10. Copia los archivos estáticos construidos ('dist') de la etapa anterior.
COPY --from=build /app/dist /usr/share/nginx/html

# 11. Expone el puerto que Railway asignará
EXPOSE 80

# 12. Script para iniciar Nginx con el puerto correcto
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'export PORT=${PORT:-80}' >> /docker-entrypoint.sh && \
    echo 'envsubst "\$PORT" < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# 13. Comando para iniciar Nginx
CMD ["/docker-entrypoint.sh"]