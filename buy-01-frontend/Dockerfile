# Stage 1: Build the Angular app
FROM node:20-alpine AS build
WORKDIR /app

# On ajoute le préfixe du dossier pour chaque COPY
COPY buy-01-frontend/package*.json ./
RUN npm install

# Copier tout le contenu du dossier frontend vers le WORKDIR actuel (.)
COPY buy-01-frontend/ .
RUN npm run build --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Vérifie bien le chemin de sortie de ton build Angular (dist/...)
COPY --from=build /app/dist/buy-01-frontend/browser/ /usr/share/nginx/html

# Create SSL directory and copy certificates
# On pointe vers le sous-dossier buy-01-frontend/ pour trouver les fichiers
RUN mkdir -p /etc/nginx/ssl
COPY buy-01-frontend/nginx.crt /etc/nginx/ssl/nginx.crt
COPY buy-01-frontend/nginx.key /etc/nginx/ssl/nginx.key

# Copy custom Nginx configuration
COPY buy-01-frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]