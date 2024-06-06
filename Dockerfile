FROM node:20.0.0-alpine AS base
WORKDIR /usr/src/app
COPY package*.json tsconfig.json ./
RUN apk add --no-cache python3 make g++
RUN npm install

FROM base AS development 
COPY . .
EXPOSE 3000
CMD [ "npm", "run", "dev" ]

FROM base AS production
COPY . .
RUN npm prune --production
EXPOSE 3000
CMD [ "npm", "run", "start" ]
