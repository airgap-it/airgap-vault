FROM beevelop/ionic:v2021.06.1

RUN apt-get update -y && apt-get install -y \
    bzip2 \
    build-essential  \
    pkg-config  \
    libjpeg-dev \
    libcairo2-dev 

# create app directory
RUN mkdir /app
WORKDIR /app

# using npm 7
RUN npm install -g npm@7 @capacitor/cli

# Install app dependencies, using wildcard if package-lock exists
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

# install dependencies
RUN npm ci

# copy capacitor configs and ionic configs
COPY capacitor.config.json /app/capacitor.config.json
COPY ionic.config.json /app/ionic.config.json

RUN mkdir www

# run ionic android build
RUN ionic info

# Bundle app source
COPY . /app

# post-install hook, to be safe if it got cached
RUN node config/patch_crypto.js

# set version code
ARG BUILD_NR
RUN sed -i -e "s/versionCode 1/versionCode $BUILD_NR/g" /app/android/app/build.gradle

# disable pure getters due to https://github.com/angular/angular-cli/issues/11439 
RUN npm run disable-pure-getters

# configure mangle (keep_fnames) for bitcoinjs https://github.com/bitcoinjs/bitcoinjs-lib/issues/959
RUN npm run configure-mangle

# remove unused cordova-diagnostic-plugin features
RUN npm run apply-diagnostic-modules

# jetify dependencies
RUN npx jetifier

# build ionic
RUN ionic build --prod

# copy ionic build
RUN cap sync android

# accept licenses
RUN yes | $ANDROID_HOME/tools/bin/sdkmanager --update

# clean project
RUN /app/android/gradlew --project-dir /app/android clean

# build apk
RUN /app/android/gradlew --project-dir /app/android build

# copy release-apk
RUN cp /app/android/app/build/outputs/apk/release/app-release-unsigned.apk android-release-unsigned.apk
# this has nothing to do with debug!!!:
RUN cp android-release-unsigned.apk android-debug.apk 

# copy release-apk
RUN cp /app/android/app/build/outputs/apk/appium/app-appium-unsigned.apk android-appium-unsigned.apk

RUN cp android-appium-unsigned.apk android-appium.apk


# sign using debug key
RUN jarsigner -verbose -keystore ./build/android/debug.keystore -storepass android -keypass android android-debug.apk androiddebugkey

# sign using debug key
RUN jarsigner -verbose -keystore ./build/android/debug.keystore -storepass android -keypass android android-appium.apk androiddebugkey
