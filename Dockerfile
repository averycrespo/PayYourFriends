FROM node:latest

WORKDIR /Homework3

COPY . .
RUN npm install

CMD ["npm", "start"]