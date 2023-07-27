# Development Stage
FROM node:14-alpine AS development

WORKDIR /app/authService


COPY package.json package-lock.json ./
RUN npm install


COPY authService .


RUN npm run build

# Production Stage
FROM node:14-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app/authService


RUN npm install --only=production


COPY --from=development /app/authService/dist ./dist


EXPOSE 3001


CMD ["node", "dist/main"]
