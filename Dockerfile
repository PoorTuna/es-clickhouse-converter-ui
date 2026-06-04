# --- build stage ---
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# --- serve stage ---
# Unprivileged nginx: listens on 8080, runs as a non-root user, and keeps its
# pid/temp/cache under writable paths. This is what lets the same image run
# under OpenShift's restricted SCC (arbitrary uid, group 0) unchanged.
FROM nginxinc/nginx-unprivileged:1.27-alpine
USER root
# Backend address, resolved at container start into the nginx config. Override
# at runtime: docker run -e CONVERTER_BACKEND_URL=http://host:8000 ...
ENV CONVERTER_BACKEND_URL=http://converter:8000
# DNS resolver for runtime proxy_pass name resolution. Auto-detected from
# /etc/resolv.conf by 15-detect-resolver.envsh when left empty (works on Docker,
# Kubernetes and OpenShift); falls back to Docker's embedded DNS.
ENV CONVERTER_RESOLVER=""
# Substitute only our CONVERTER_* vars so nginx's own $host/$uri/etc. survive.
ENV NGINX_ENVSUBST_FILTER="^CONVERTER_"
COPY docker-entrypoint.d/15-detect-resolver.envsh /docker-entrypoint.d/15-detect-resolver.envsh
COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# Make config dirs group-writable (gid 0) so the envsubst entrypoint can render
# templates under an arbitrary OpenShift-assigned uid, then drop back to nginx.
RUN chmod +x /docker-entrypoint.d/15-detect-resolver.envsh \
    && chmod -R g+w /etc/nginx/conf.d /etc/nginx/templates
USER nginx
EXPOSE 8080
