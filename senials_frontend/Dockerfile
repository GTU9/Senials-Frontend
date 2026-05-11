# ── Stage 1: React 빌드 ──────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 캐시 레이어
COPY package.json package-lock.json ./
RUN npm ci

# 소스 복사
COPY . .

# 빌드 타임 환경변수 (docker-compose build.args 로 주입)
# REACT_APP_API_URL : 비워두면 현재 오리진 기준 상대 경로 사용
# REACT_APP_API_PREFIX : /api  (Nginx가 /api/ → 백엔드로 프록시)
ARG REACT_APP_API_URL=
ARG REACT_APP_API_PREFIX=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_API_PREFIX=$REACT_APP_API_PREFIX

RUN npm run build

# ── Stage 2: Nginx 서빙 ──────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# React 빌드 결과물 복사
COPY --from=builder /app/build /usr/share/nginx/html

# 커스텀 Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
