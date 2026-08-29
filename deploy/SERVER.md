# 国内服务器加速指南

> 前提：域名 **ICP 备案**。未备案的域名无法绑定国内服务器（机房会拦截 80/443）。

## 第一步：用这台服务器完成备案（免费，1-2 周）

1. 腾讯云/阿里云控制台 → **网站备案** → 开始备案
2. 接入资源选**你买的那台轻量服务器**（它会提供"备案服务号"）
3. 提交材料：身份证、手机号、域名 vobl.cn（先做域名实名认证）
4. 等管局审核（1-2 周），**期间网站保持 Cloudflare 现状不动**

## 第二步：备案通过后，部署加速节点

```bash
# 登录服务器（Xshell 或 ssh）
ssh root@你的服务器IP

# 1) 安装 Nginx + certbot
apt update && apt install -y nginx certbot python3-certbot-nginx

# 2) 创建缓存目录
mkdir -p /var/cache/nginx/vobl /var/www/certbot

# 3) 上传本目录的 nginx.conf 到服务器
#    （本地执行，把文件 scp 上去）
#    scp deploy/nginx.conf root@你的服务器IP:/etc/nginx/conf.d/vobl.cn.conf

# 4) 签发 HTTPS 证书（自动验证 + 自动续期）
certbot --nginx -d www.vobl.cn

# 5) 检查并重启
nginx -t && systemctl reload nginx
```

## 第三步：切换 DNS（Cloudflare 控制台）

1. 进入 vobl.cn 的 DNS 管理
2. 把 `www` 记录改为 **A 记录 → 你的服务器公网 IP**，代理状态设为 **DNS only（灰云）**
3. 同时把 Cloudflare Pages 项目里的 custom domain `www.vobl.cn` 移除
4. 等 1-5 分钟生效

## 第四步：原图下载也走加速（可选）

把 `src/config/site.ts` 的 `r2Base` 改成 `https://www.vobl.cn/originals`
（Nginx 会把 /originals/* 反代到 R2 桶并缓存 30 天）

## 成本与注意

- 一个月服务器到期后：**不续费会被注销备案** → 建议续最便宜配置（约 24-30 元/月），或提前迁到 EdgeOne
- 香港服务器方案：如果不想等备案，加购一台**香港轻量**（同价位，无需备案），同一份 nginx.conf 微调即可（删除 /originals 的 R2 反代也行）
- 备案期间网站可正常访问（Cloudflare 不受影响）
