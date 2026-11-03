# ---- CyberLog 生产镜像 ----
FROM node:20-alpine

# ffmpeg：视频上传要转码 + 抽封面，缺了它上传必 500
RUN apk add --no-cache ffmpeg

WORKDIR /app

# 依赖先装，利用镜像层缓存
COPY package*.json ./
RUN npm ci

# 源码
COPY . .

RUN npm run build

# 运行时目录（首次启动若没挂卷，这些是空目录）
RUN mkdir -p content/posts public/photos public/videos

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# 注意：/app/content、/app/public/photos、/app/public/videos 需要挂卷，
# 否则重建镜像 = 丢失所有文章和媒体（详见 deploy/上线清单.md）
CMD ["npm", "start"]
