# Apify Actor - CreatiVault OpenAPI
# Node.js 20 includes native fetch/FormData/Blob for OpenAPI and upload calls.
FROM apify/actor-node:20
ENV CV_ACTOR_OPERATION=outreachSend

# Install runtime dependencies. package*.json keeps this layer cache-friendly.
COPY --chown=myuser package*.json ./
RUN npm --quiet set progress=false \
 && npm install --omit=dev --omit=optional \
 && echo "Installed npm packages:" && (npm list --omit=dev --all || true) \
 && echo "Node.js version v$(node --version)" \
 && echo "NPM version v$(npm --version)"

# Copy actor source and Apify metadata.
COPY --chown=myuser main.js ./
COPY --chown=myuser .actor .actor

CMD npm start --silent
