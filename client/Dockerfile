FROM node:20-alpine

ARG NEXT_PUBLIC_API_URL=https://soolivaapi.fermag.com.tr
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

COPY package.json ./
RUN yarn install --frozen-lockfile

COPY . .

RUN echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" >> .env.local

EXPOSE 3000

CMD ["yarn", "dev"]
