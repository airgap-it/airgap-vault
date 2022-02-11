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

RUN yarn global add ionic@5.4.0 @capacitor/core@3.2.5 @capacitor/cli@3.2.5 && yarn cache clean --force && yarn global add n && n 16.13.1

# Install app dependencies, using wildcard if package-lock exists and copy capacitor configs and ionic configs
COPY package.json yarn.lock apply-diagnostic-modules.js capacitor.config.ts ionic.config.json /app/
COPY config /app/config

# install dependencies
# run ionic android build
RUN yarn install --frozen-lockfile && mkdir www && ionic info

# Bundle app source
COPY . /app

# set version code
ARG BUILD_NR
RUN sed -i -e "s/versionCode 1/versionCode $BUILD_NR/g" /app/android/app/build.gradle

# disable pure getters due to https://github.com/angular/angular-cli/issues/11439 
# configure mangle (keep_fnames) for bitcoinjs https://github.com/bitcoinjs/bitcoinjs-lib/issues/959
# remove unused cordova-diagnostic-plugin features
# jetify dependencies
# build ionic
# copy ionic build
# accept licenses
# clean project
# build apk
# copy release-apk
# this has nothing to do with debug!!!:
# copy release-apk
# sign using debug key
RUN yarn disable-pure-getters \
    && yarn configure-mangle \
    && yarn apply-diagnostic-modules \
    && yarn jetifier \
    && ionic build --prod \
    && cap sync android \
    && echo y | sdkmanager --sdk_root=${ANDROID_SDK_ROOT} --update \
    && /app/android/gradlew --project-dir /app/android clean \
    && /app/android/gradlew --project-dir /app/android build \
    && cp /app/android/app/build/outputs/apk/release/app-release-unsigned.apk android-release-unsigned.apk \
    && cp android-release-unsigned.apk android-debug.apk \
    && cp /app/android/app/build/outputs/apk/appium/app-appium-unsigned.apk android-appium-unsigned.apk \
    && cp android-appium-unsigned.apk android-appium.apk \
    && zipalign -p -f -v 4 android-debug.apk android-debug-aligned.apk \
    && apksigner sign --ks ./build/android/debug.keystore --ks-key-alias androiddebugkey --ks-pass pass:android --key-pass pass:android android-debug-aligned.apk \
    && zipalign -p -f -v 4 android-appium.apk android-appium-aligned.apk \
    && apksigner sign --ks ./build/android/debug.keystore --ks-key-alias androiddebugkey --ks-pass pass:android --key-pass pass:android android-appium-aligned.apk \