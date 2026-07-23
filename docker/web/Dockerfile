FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/package.json
COPY tsconfig.base.json ./
RUN npm install
COPY . .
RUN npm --workspace @kusf/web run build
EXPOSE 3000
CMD ["npm", "--workspace", "@kusf/web", "run", "start"]
