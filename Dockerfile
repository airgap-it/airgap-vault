FROM node:20

# See https://crbug.com/795759
RUN apt-get update && apt-get install -yq --no-install-recommends libgconf-2-4 bzip2 build-essential libxtst6
RUN apt-get install -yq --no-install-recommends git

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
  && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst  libglu1 ttf-freefont libxss1 libglib2.0-0 libxshmfence1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get purge --auto-remove -y curl \
  && rm -rf /src/*.deb

# install static webserver (as root: writes to /usr/local)
RUN yarn global add node-static

# Create the app directory owned by the unprivileged user and build everything as that
# user. The image is also run non-root by CI (yarn test-ci / yarn lint-ci write .angular/cache,
# src/coverage and lintReport.json under /app), so /app must belong to that user, not root.
RUN mkdir /app && chown node:node /app \
  && mkdir -p /home/node/.cache/yarn && chown -R node:node /home/node
WORKDIR /app
USER node

# USER changes neither HOME nor yarn's cache location: HOME would stay /root, and yarn's
# default cache sits under the root-owned /usr/local/share/.cache created by the global
# install above. Without both of these yarn fails with "hasn't been able to find a cache
# folder it can use".
ENV HOME=/home/node
ENV YARN_CACHE_FOLDER=/home/node/.cache/yarn

# Install app dependencies, using wildcard if package-lock exists
COPY --chown=node:node install-build-deps.js /app
COPY --chown=node:node install-test-deps.js /app
COPY --chown=node:node package.json /app
COPY --chown=node:node yarn.lock /app
COPY --chown=node:node apply-diagnostic-modules.js /app
COPY --chown=node:node patch-dependency-versions.js /app
COPY --chown=node:node fix-qrscanner-gradle.js /app
COPY --chown=node:node copy-builtin-modules.js /app

RUN yarn install-test-dependencies

# install dependencies
RUN yarn install

# Bundle app source
COPY --chown=node:node . /app

# set to production
RUN export NODE_ENV=production

# build
RUN yarn build:prod

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8100/', r => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["static", "-p", "8100", "-a", "0.0.0.0", "www"]
