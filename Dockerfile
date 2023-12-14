FROM node:18 AS builder

COPY package.json .
COPY pnpm-lock.yaml .
RUN npm config set registry https://registry.npmmirror.com && npm i -g pnpm
RUN pnpm config set registry https://registry.npmmirror.com && pnpm i

COPY . .
RUN pnpm run build

FROM node:18

WORKDIR /opt/app

COPY --from=builder ./node_modules ./node_modules
COPY --from=builder ./dist ./dist

EXPOSE 3000

ENV NODE_ENV=production

CMD [ "node", "dist/main" ]