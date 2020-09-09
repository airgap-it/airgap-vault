FROM electronuserland/builder:12

# set cache dirs
ENV ELECTRON_CACHE "/root/.cache/electron"
ENV ELECTRON_BUILDER_CACHE "/root/.cache/electron-builder"

RUN mkdir /app
COPY . /app

WORKDIR /app

# set version
ARG VERSION
RUN sed -i -e "s/\"version\": \"0.0.1\"/\"version\": \"${VERSION}\"/g" electron/package.json

# install dependencies
RUN npm install
RUN npm --prefix electron/ install

# browserify coin-lib
# RUN npm run browserify-coinlib

# build Ionic project
RUN npm run build:electron

# copy files
RUN npx cap sync electron

# build package
RUN npm --prefix electron/ run build:linux
