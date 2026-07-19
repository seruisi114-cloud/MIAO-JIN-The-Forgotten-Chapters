# MIAO JIN — The Forgotten Chapters

私人原创音乐艺术作品集网站。当前已经完成从遗忘之钥、标题、星穹圣殿到第一篇章音乐世界的体验闭环。

第一篇章已经确定为 **《月下星海》**，并接入真实原创音频与自定义 Howler.js 播放器。

详细项目背景与设计约束请阅读 [`PROJECT_BIBLE.md`](./PROJECT_BIBLE.md)。

## 本地运行

```bash
npm install
npm run dev
```

## 基础技术

- Next.js（App Router）
- React + TypeScript
- Tailwind CSS
- Three.js + React Three Fiber + Drei
- GSAP
- Howler.js

## 首屏加载策略

- 密码页只渲染轻量 CSS 电影背景、诗句和钥匙输入，不加载 Three.js、React Three Fiber、圣殿或篇章世界。
- 密码验证成功后才动态加载宇宙与开场序列；进入圣殿、开启篇章时再分别加载对应场景。
- 开场音频组件使用 `preload: false`，只有访客点击“唤醒封印”后才开始请求音频文件。
- 异步宇宙资源超过 2 秒仍未就绪时，显示“正在唤醒星穹……”，正常快速加载时不出现提示。

当前生产构建中，页面业务首屏 JS 从约 `1.12 MB`（gzip `306 KB`）降至约 `48 KB`（gzip `14 KB`）；包含 Next.js 运行时代码与 CSS 的完整首屏传输估算从约 `508 KB gzip` 降至约 `216 KB gzip`。Three.js 被拆到密码验证后的异步 chunk。

## 开场音乐

- 文件：`public/audio/opening/opening-ambient.mp3`
- 网站路径：`/audio/opening/opening-ambient.mp3`
- 播放时机：访客输入正确的遗忘之钥后，从宇宙苏醒阶段开始
- 使用范围：宇宙苏醒、耳机提示、标题降临、进入星穹圣殿前后的氛围
- 音量策略：当前调试值为从静音淡入至 `0.6`，淡入 2 秒；发布前再按实际听感调整
- 退出策略：进入《月下星海》后仍保持低声播放，直到访客点击“开启旋律”，再用 1.5 秒淡出并卸载；随后播放正式篇章音频

开场音乐不会在网页首次打开时请求或自动播放；访客提交遗忘之钥后才开始加载，验证成功后淡入。加载失败时，开场视觉流程仍可继续，不会导致页面崩溃。
开发环境右下角会显示加载中、未播放、播放中或播放失败，并提供“测试开场音乐”按钮；控制台会记录文件加载、尝试播放、播放成功、播放失败、淡出和停止事件。正式构建不会显示这些调试控件。

## 创作者结语

星穹圣殿的中央月白星核是“创作者结语”入口。点击后进入隐藏结语空间，当前占位内容为“原作者还没有发话，敬请期待。”，署名为 `MIAO JIN`。关闭结语时直接返回原圣殿场景，不改变相机位置和画面比例。

## 第一篇章

- 篇章：第一篇章《月下星海》
- 音频文件：`public/audio/chapters/moonlit-star-sea.wav`
- 网站路径：`/audio/chapters/moonlit-star-sea.wav`
- 音频时长：约 27.60 秒
- 视觉方向：梦幻、月光、星海、温柔、沉睡、神秘
- 作者署名：金淼
- 作者介绍：一段来自东方的梦境旋律。
- 章节配置：`config/chapters.ts`

播放器不会自动播放。访客需要在音乐世界中主动选择“开启旋律”。返回星穹圣殿时，播放器会停止并释放音频资源。

## Vercel 部署准备

- Framework Preset：Next.js（自动识别）
- Install Command：保持 Vercel 默认值
- Build Command：`npm run build`
- Output Directory：保持 Next.js 默认值，不要手动填写
- 必需环境变量：`SITE_ACCESS_KEY`

请在 Vercel 项目设置中分别为 Preview 和 Production 配置 `SITE_ACCESS_KEY`，不要把真实访问密钥写入源码或提交到 Git。`.env.example` 只提供变量名示例。本地 `npm run dev` 未配置环境变量时仍可使用开发密钥 `1234567890`；生产构建运行时若未配置变量，解锁接口会安全地拒绝访问。

`public/audio` 会作为 Next.js 静态资源目录一起部署。目前包含：

- `/audio/opening/opening-ambient.mp3`
- `/audio/chapters/moonlit-star-sea.wav`

注意：入口密钥已经改为服务端校验，但 `public` 目录中的音频本质上仍是可通过已知 URL 访问的静态资源。若未来需要严格防止音频直链访问，应改为受鉴权的对象存储或服务端代理，而不应继续放在 `public` 中。
