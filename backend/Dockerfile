FROM node

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5000

# ENV MONGODB_USERNAME=genodb
# ENV MONGODB_PASSWORD=genodb123

CMD [ "npm", "run", "dev" ]