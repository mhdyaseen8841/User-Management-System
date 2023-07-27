# Development Stage
FROM node:14-alpine AS development

WORKDIR /app/profileService


COPY package.json package-lock.json ./
RUN npm install


COPY profileService .


RUN npm run build

# Production Stage
FROM node:14-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app/profileService


RUN npm install --only=production


COPY --from=development /app/profileService/dist ./dist


EXPOSE 3002

# Start the application
CMD ["node", "dist/main"]
