FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN npx playwright install chromium --with-deps
COPY . .
EXPOSE 3000
CMD ["npm", "start"]