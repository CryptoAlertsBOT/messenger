FROM node:alpine3.14

RUN mkdir /home/cryptobot
WORKDIR /home/cryptobot
COPY . .

RUN apk upgrade && \
    apk update && \
    apk add npm

RUN npm install typescript@4.3.4 -g

RUN npm run build

CMD ["npm", "run", "start"]
