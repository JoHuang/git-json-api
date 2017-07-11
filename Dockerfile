FROM node:8.1.3

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install --production

COPY src ./src/
CMD ["npm", "start"]
