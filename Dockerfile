
FROM node:20.10.0-bookworm

WORKDIR /app

COPY package.json /app

RUN npm cache clear --force

RUN npm i

COPY . /app

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]
