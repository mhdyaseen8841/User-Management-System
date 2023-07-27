# Development Stage
FROM node:14-alpine AS development

WORKDIR /app/userService


COPY package.json package-lock.json ./
RUN npm install


COPY userService .


RUN npm run build

# Production Stage
FROM node:14-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app/userService


RUN npm install --only=production


COPY --from=development /app/userService/dist ./dist


EXPOSE 3000


CMD ["node", "dist/main"]
