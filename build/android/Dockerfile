FROM agileek/ionic-framework:3.19.1

RUN apt-get update -y
RUN apt-get install -y bzip2 build-essential
RUN apt-get install -y pkg-config libcairo2-dev
RUN apt-get install -y libjpeg-dev

# install fastlane
RUN gem install fastlane -NV

# android build tools version
RUN ["/opt/tools/android-accept-licenses.sh", "android update sdk --all --no-ui --filter build-tools-26.0.2,android-27"]

# create app directory
RUN mkdir /app
WORKDIR /app

# install npm 5.7.0 to fix https://github.com/npm/npm/issues/19356
RUN npm install -g npm@5.7.0

# install ionic
RUN npm install -g ionic@3.20.0

# Install app dependencies, using wildcard if package-lock exists
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

# copy deploy keys for pull-access
RUN mkdir -p /root/.ssh

COPY airgap_cordova_secure_storage_deploy /root/.ssh/id_rsa
COPY airgap_cordova_secure_storage_deploy.pub /root/.ssh/id_rsa.pub

RUN chmod 700 /root/.ssh/id_rsa

RUN echo "Host gitlab.papers.tech\n\tStrictHostKeyChecking no\n" >> /root/.ssh/config

# install dependencies
RUN npm install --no-optional

# copy config.xml, ionic configs and resources to allow plugin installation
COPY config.xml /app/config.xml
COPY ionic.config.json /app/ionic.config.json
COPY ./resources /app/resources

RUN mkdir www

# run ionic android build
RUN ionic info

# removing cordova-plugin-airgap-secure-storage from package.json due to https://issues.apache.org/jira/browse/CB-13507
RUN sed -i '/cordova-plugin-airgap-secure-storage/d' ./package.json 

# Bundle app source
COPY ./hooks /app/hooks

# add android platform
RUN ionic cordova platforms add android

# Bundle app source
COPY . /app

# set version code
ARG BUILD_NR
RUN sed -i -e "s/android-versionCode=\"1\"/android-versionCode=\"$BUILD_NR\"/g" config.xml

# build apk
RUN ionic cordova build android --prod --release --no-interactive

# copy release-apk
RUN cp /app/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk android-release-unsigned.apk

RUN cp android-release-unsigned.apk android-debug.apk

# sign using debug key
RUN jarsigner -verbose -keystore ./build/android/debug.keystore -storepass android -keypass android android-debug.apk androiddebugkey
