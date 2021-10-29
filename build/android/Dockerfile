FROM beevelop/ionic:v2021.06.1

RUN apt-get update -y && apt-get install -y \
    bzip2 \
    build-essential  \
    pkg-config  \
    libjpeg-dev \
    libcairo2-dev \
    openjdk-11-jdk-headless

ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64

# create app directory
RUN mkdir /app
WORKDIR /app

RUN yarn global add ionic@5.4.0 @capacitor/core@3.2.5 @capacitor/cli@3.2.5
RUN yarn cache clean --force
RUN yarn global add n
RUN n 15.14.0

# Install app dependencies, using wildcard if package-lock exists
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
COPY config /app/config
COPY apply-diagnostic-modules.js /app

# install dependencies
RUN yarn install --frozen-lockfile

# copy capacitor configs and ionic configs
COPY capacitor.config.ts /app/capacitor.config.ts
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
RUN yarn disable-pure-getters

# configure mangle (keep_fnames) for bitcoinjs https://github.com/bitcoinjs/bitcoinjs-lib/issues/959
RUN yarn configure-mangle

# remove unused cordova-diagnostic-plugin features
RUN yarn apply-diagnostic-modules

# jetify dependencies
RUN yarn jetifier

# build ionic
RUN ionic build --prod

# copy ionic build
RUN cap sync android

# accept licenses
RUN echo y | sdkmanager --sdk_root=${ANDROID_SDK_ROOT} --update

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
