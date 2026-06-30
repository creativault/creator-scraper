# Apify Actor - TikTok Creator Search
# 基于 Node.js 20 (LTS)，CV OpenAPI 调用仅需原生 fetch，无额外运行时依赖

FROM apify/actor-node:20

# 复制依赖清单并安装（利用 Docker 层缓存）
COPY --chown=myuser package*.json ./
RUN npm --quiet set progress=false \
 && npm install --omit=dev --omit=optional \
 && echo "Installed npm packages:" && (npm list --omit=dev --all || true) \
 && echo "Node.js version v$(node --version)" \
 && echo "NPM version v$(npm --version)"

# 复制 Actor 源码与配置
COPY --chown=myuser main.js ./
COPY --chown=myuser .actor .actor

# 运行 Actor
CMD npm start --silent
