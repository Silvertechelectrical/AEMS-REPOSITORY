FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/package.json
COPY tsconfig.base.json ./
RUN npm install
COPY . .
RUN npm --workspace @kusf/api run build
EXPOSE 4000
CMD ["npm", "--workspace", "@kusf/api", "run", "start"]
