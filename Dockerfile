FROM node:10

# See https://crbug.com/795759
RUN apt-get update && apt-get install -yq libgconf-2-4 bzip2 build-essential python
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
COPY install-build-deps.js /app
COPY install-test-deps.js /app
COPY package.json /app
COPY package-lock.json /app

RUN npm run install-test-dependencies

# install dependencies
RUN npm install
RUN npm install @ionic/cli@6.9.1

# install static webserver
RUN npm install node-static -g

# browserify coin-lib
# RUN npm run browserify-coinlib

# Bundle app source
COPY . /app

# set to production
RUN export NODE_ENV=production

# post-install hook, to be safe if it got cached
RUN node config/patch_crypto.js

# build
RUN npx ionic build --prod

CMD ["static", "-p", "8100", "-a", "0.0.0.0", "www"]
