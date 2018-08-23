FROM node:8-slim

# See https://crbug.com/795759
RUN apt-get update && apt-get install -yq libgconf-2-4 bzip2 build-essential
RUN apt-get install -yq git

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

# create app directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies, using wildcard if package-lock exists
COPY package.json /app
COPY package-lock.json /app

# copy deploy keys for pull-access
RUN mkdir -p /root/.ssh

COPY airgap_cordova_secure_storage_deploy /root/.ssh/id_rsa
COPY airgap_cordova_secure_storage_deploy.pub /root/.ssh/id_rsa.pub

RUN chmod 700 /root/.ssh/id_rsa

RUN echo "Host gitlab.papers.tech\n\tStrictHostKeyChecking no\n" >> /root/.ssh/config

# install dependencies
RUN npm install

# install static webserver
RUN npm install node-static -g

# Bundle app source
COPY . /app

# set to production
RUN export NODE_ENV=production

# build
RUN npm run build

CMD ["static", "-p", "8100", "-a", "0.0.0.0", "www"]
