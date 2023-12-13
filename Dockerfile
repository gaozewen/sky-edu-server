FROM node:18 AS builder

COPY package.json .
COPY pnpm-lock.yaml .
RUN npm i -g pnpm && pnpm i

COPY . .
RUN pnpm run build

FROM node:18

WORKDIR /opt/app

COPY --from=builder ./node_modules ./node_modules
COPY --from=builder ./dist ./dist
COPY ./package.json ./package.json
COPY ./wx ./wx
COPY ./.env.prod ./.env.prod

RUN npm i -g dotenv-cli

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]