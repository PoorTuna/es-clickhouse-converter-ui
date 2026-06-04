# --- build stage ---
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# --- serve stage ---
FROM nginx:1.27-alpine
# Backend address, resolved at container start into the nginx config. Override
# at runtime: docker run -e CONVERTER_BACKEND_URL=http://host:8000 ...
ENV CONVERTER_BACKEND_URL=http://converter:8000
# Restrict envsubst to our variable so nginx's $host/$uri/etc. survive.
ENV NGINX_ENVSUBST_FILTER=CONVERTER_BACKEND_URL
COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
