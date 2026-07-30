FROM debian:bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive \
    GLAMA_VERSION="1.0.0"
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl git && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y --no-install-recommends nodejs && npm install -g mcp-proxy@5.12.0 pnpm@10.14.0 && node --version && curl -LsSf https://astral.sh/uv/install.sh | UV_INSTALL_DIR="/usr/local/bin" sh && uv python install 3.13 --default --preview && ln -s $(uv python find) /usr/local/bin/python && python --version && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
WORKDIR /app
RUN git clone https://github.com/wrediam/better-qdrant-mcp-server . && git checkout 41804f5449176550baec5e08330e4dbc92427cf7
RUN (pnpm install || true) && (pnpm run build || true)
CMD ["mcp-proxy","pnpm","--","run","start"]
