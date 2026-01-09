FROM oven/bun:1 AS runtime

WORKDIR /app

COPY package.json bun.lock tsconfig.json ./
COPY horarios-plus-plus-server ./horarios-plus-plus-server
COPY horarios-plus-plus-client ./horarios-plus-plus-client

RUN bun install --frozen-lockfile --production --cwd horarios-plus-plus-server \
  && rm -rf horarios-plus-plus-client

WORKDIR /app/horarios-plus-plus-server

ENV NODE_ENV=production

EXPOSE 4000

CMD ["bun", "run", "src/index.ts"]
