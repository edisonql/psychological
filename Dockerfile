FROM node:alpine

WORKDIR /psychological

COPY package.json yarn.lock ./

RUN npm i -g nodemon
RUN yarn

COPY . .

EXPOSE 3001

CMD [ "nodemon", "index.js" ]
