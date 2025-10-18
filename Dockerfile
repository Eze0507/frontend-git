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

# 6. Ejecuta el comando de construcción de Vite. Esto genera la carpeta 'dist'.
RUN npm run build

# --- Etapa 2: Servir (Serve Stage) ---
# 7. Usa una imagen base muy ligera de Nginx para servir los archivos estáticos.
FROM nginx:alpine

# 8. Copia la configuración de Nginx (creada en el Paso 2).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 9. Copia los archivos estáticos construidos ('dist') de la etapa anterior.
# Esta es la línea crucial que mueve la app compilada al servidor Nginx.
COPY --from=build /app/dist /usr/share/nginx/html

# 10. Expone el puerto 80, que es el que Nginx escucha por defecto.
EXPOSE 80

# 11. Crea un script para iniciar nginx con el puerto correcto
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'sed -i "s/listen 80;/listen ${PORT:-80};/g" /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# 12. Comando para iniciar Nginx.
CMD ["/docker-entrypoint.sh"]