FROM agileek/ionic-framework:3.19.1

RUN apt-get update -y && apt-get install -y \
    bzip2 \
    build-essential  \
    pkg-config  \
    libjpeg-dev \
    libcairo2-dev 

# android build tools version
RUN ["/opt/tools/android-accept-licenses.sh", "android update sdk --all --no-ui --filter build-tools-26.0.2,android-27"]

# create app directory
RUN mkdir /app
WORKDIR /app

# using npm 6.5.0 to fix installing certain cordova/ionic plugins
RUN npm install -g npm@6.5.0 ionic@4.6.0

# Install app dependencies, using wildcard if package-lock exists
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

# install dependencies
RUN npm ci

# copy config.xml, ionic configs and resources to allow plugin installation
COPY config.xml /app/config.xml
COPY ionic.config.json /app/ionic.config.json
COPY ./resources /app/resources

RUN mkdir www

# run ionic android build
RUN ionic info

# Copy hooks (used to remove permissions)
COPY ./hooks /app/hooks

# add android platform
RUN ionic cordova platforms add android

# Bundle app source
COPY . /app

# post-install hook, to be safe if it got cached
RUN node config/patch_crypto.js

# set version code
ARG BUILD_NR
RUN sed -i -e "s/android-versionCode=\"1\"/android-versionCode=\"$BUILD_NR\"/g" config.xml

# disable pure getters due to https://github.com/angular/angular-cli/issues/11439 
RUN npm run disable-pure-getters

# configure mangle (keep_fnames) for bitcoinjs https://github.com/bitcoinjs/bitcoinjs-lib/issues/959
RUN npm run configure-mangle

# build apk
RUN ionic cordova build android --prod --release --no-interactive

# copy release-apk
RUN cp /app/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk android-release-unsigned.apk

RUN cp android-release-unsigned.apk android-debug.apk

# sign using debug key
RUN jarsigner -verbose -keystore ./build/android/debug.keystore -storepass android -keypass android android-debug.apk androiddebugkey
