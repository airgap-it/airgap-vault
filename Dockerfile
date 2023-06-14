FROM node:16.19.1

# See https://crbug.com/795759
RUN apt-get update && apt-get install -yq libgconf-2-4 bzip2 build-essential libxtst6
RUN apt-get install -yq git

RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 40976EAF437D05B5
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 3B4FE6ACC0B21F32
RUN echo "deb http://us-west-2.ec2.archive.ubuntu.com/ubuntu/ trusty multiverse \
deb http://us-west-2.ec2.archive.ubuntu.com/ubuntu/ trusty-updates multiverse \
deb http://us-west-2.ec2.archive.ubuntu.com/ubuntu/ trusty-backports main restricted universe multiverse" | tee /etc/apt/sources.list.d/multiverse.list

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update && apt-get install -y wget --no-install-recommends \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst  libglu1 ttf-freefont libxss1 libglib2.0-0 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get purge --auto-remove -y curl \
  && rm -rf /src/*.deb

# create app directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies, using wildcard if package-lock exists
COPY install-build-deps.js /app
COPY install-test-deps.js /app
COPY package.json /app
COPY yarn.lock /app
COPY apply-diagnostic-modules.js /app
COPY patch-dependency-versions.js /app
COPY fix-qrscanner-gradle.js /app
COPY copy-builtin-modules.js /app

RUN yarn install-test-dependencies

# install dependencies
RUN yarn install

# install static webserver
RUN yarn global add node-static

# Bundle app source
COPY . /app

# set to production
RUN export NODE_ENV=production

# build
RUN yarn build:prod

CMD ["static", "-p", "8100", "-a", "0.0.0.0", "www"]
