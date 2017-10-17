FROM node:6.2.2

RUN mkdir -p /code
WORKDIR /code

RUN apt-get update && apt-get install -y python-pip python-dev
RUN pip install awscli

RUN npm install -g yarn
ADD package.json /code/package.json
ADD yarn.lock /code/yarn.lock
RUN yarn install --frozen-lockfile --non-interactive && yarn cache clean

ADD services/ /code/services/
ADD run.sh /code/run.sh

ADD webpack.config.js /code/webpack.config.js
