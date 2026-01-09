FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock tsconfig.json ./
COPY horarios-plus-plus-client ./horarios-plus-plus-client
COPY horarios-plus-plus-server ./horarios-plus-plus-server

# Instala dependencias del cliente con un lockfile estable y elimina el servidor para aligerar la imagen build.
RUN bun install --frozen-lockfile --cwd horarios-plus-plus-client \
  && rm -rf horarios-plus-plus-server

# Render puede inyectar los build args usando DOCKER_BUILD_ARG_*.
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN bun run --cwd horarios-plus-plus-client build

FROM nginx:1.27.2-alpine-slim AS runtime

COPY horarios-plus-plus-client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/horarios-plus-plus-client/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
