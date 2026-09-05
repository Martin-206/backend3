FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

RUN mkdir -p logs uploads/user-documents uploads/delivery-proofs

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
