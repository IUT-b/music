# ベースイメージとしてNode.jsを使用
FROM node:18 AS builder

# 作業ディレクトリの設定
WORKDIR /app

# 必要なファイルをコンテナにコピー
COPY package.json package-lock.json ./

# 依存関係をインストール
RUN npm install

# 必要なファイルをコピー 
COPY . .

# Prisma Client の生成
RUN npx prisma generate

# Next.jsアプリケーションのビルド
RUN npm run build

# 実行環境用のイメージ
FROM node:18

WORKDIR /app

# 依存関係のみコピー
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm install --production

# ビルド済みファイルをコピー
COPY --from=builder /app ./

# 環境変数を明示的に設定
ENV NODE_ENV=production

# 必要なポートを公開
EXPOSE 3000

# Next.jsアプリケーションを起動
CMD ["npm", "start"]
