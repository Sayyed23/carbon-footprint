FROM caddy:2-alpine
COPY build/web /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
