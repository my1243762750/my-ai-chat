# AI Chat Assistant - 浏览器插件开发指南

## 🚀 项目简介

这是一个基于 React + Vite 构建的浏览器插件，可以在任何网页上提供AI聊天助手功能。插件支持多种AI模型（豆包系列），支持图片上传解析，代码高亮显示，以及美观的侧边栏界面。

## 📁 浏览器插件开发必备文件结构

### 核心文件
```
my-ai-chat/
├── manifest.json           # 插件清单文件（必需）
├── package.json           # npm包配置文件
├── vite.config.js         # 构建配置文件
├── src/
│   ├── background.js      # 后台脚本（Service Worker）
│   ├── content.jsx        # 内容脚本（注入网页）
│   └── components/
│       ├── ChatSidebar.jsx    # 主界面组件
│       └── ChatSidebar.css    # 样式文件
├── public/
│   ├── icons/             # 插件图标
│   │   ├── icon16.png     # 16x16 图标
│   │   ├── icon48.png     # 48x48 图标
│   │   └── icon128.png    # 128x128 图标
│   └── index.html         # 弹窗页面（可选）
└── dist/                  # 构建输出目录
    ├── manifest.json      # 复制的清单文件
    ├── background.js      # 编译后的后台脚本
    ├── content.js         # 编译后的内容脚本
    └── icons/             # 复制的图标文件
```

### 插件开发必备知识

#### 1. **manifest.json** - 插件清单文件
这是浏览器插件的核心配置文件，定义了插件的权限、脚本、图标等信息。

```json
{
  "manifest_version": 3,        // 清单版本（Chrome扩展v3）
  "name": "插件名称",
  "version": "1.0.0",
  "description": "插件描述",
  "permissions": [              // 权限声明
    "activeTab",               // 访问当前标签页
    "storage"                  // 本地存储
  ],
  "host_permissions": [         // 主机权限
    "https://api.example.com/*"
  ],
  "background": {               // 后台脚本
    "service_worker": "background.js"
  },
  "content_scripts": [          // 内容脚本
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ],
  "action": {                   // 插件图标点击行为
    "default_title": "插件标题"
  },
  "icons": {                    // 图标配置
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

#### 2. **Background Script** - 后台脚本
在插件后台运行的脚本，处理消息传递、存储等功能。

#### 3. **Content Script** - 内容脚本
注入到网页中的脚本，可以访问和修改网页内容。

#### 4. **Icons** - 图标文件
需要提供不同尺寸的图标文件：
- `icon16.png` - 扩展管理页面
- `icon48.png` - 扩展管理页面
- `icon128.png` - Chrome Web Store

## 🛠️ 开发环境搭建

### 前置要求
- Node.js 16+
- Yarn 包管理器
- Chrome 浏览器（用于测试）

### 安装依赖
```bash
yarn install
```

### 开发构建
```bash
yarn dev
```

### 生产构建
```bash
yarn build
```

## 🎯 当前插件功能特性

### 核心功能
1. **AI对话助手** - 支持多种豆包模型
2. **侧边栏界面** - 美观的聊天界面，不影响原网页
3. **图片解析** - 支持上传图片并进行AI解析
4. **代码高亮** - 支持多种编程语言的语法高亮
5. **Markdown渲染** - 支持富文本消息显示
6. **智能布局** - 自动适应不同网站的布局

### 技术栈
- **前端框架**: React 18
- **构建工具**: Vite 5
- **UI组件**: 自定义组件
- **代码高亮**: highlight.js
- **Markdown**: react-markdown
- **样式**: CSS-in-JS

## 📱 使用教程

### 1. 安装插件
1. 运行 `yarn build` 构建插件
2. 打开 Chrome 浏览器
3. 访问 `chrome://extensions/`
4. 开启"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择项目的 `dist` 目录

### 2. 使用插件
1. 在任何网页上点击插件图标
2. 侧边栏会从右侧滑出
3. 选择AI模型（豆包系列）
4. 输入消息开始对话
5. 支持上传图片进行解析
6. 点击关闭按钮隐藏侧边栏

### 3. 功能说明

#### 模型选择
- **豆包 1.6 系列**: 最新版本，性能更强
- **豆包 1.5 系列**: 稳定版本
- **豆包 1.4 系列**: 基础版本
- **Flash/Pro/Lite**: 不同性能等级

#### 图片功能
- 支持拖拽上传图片
- 最大文件大小: 5MB
- 支持常见图片格式
- AI可以解析图片内容

#### 代码高亮
- 自动识别代码语言
- 支持复制代码功能
- 使用 GitHub Dark 主题

## 🔧 开发指南

### 添加新功能
1. 在 `src/components/` 中创建新组件
2. 在 `ChatSidebar.jsx` 中引入和使用
3. 如需与网页交互，修改 `content.jsx`
4. 如需后台功能，修改 `background.js`

### 样式定制
- 主要样式在 `ChatSidebar.jsx` 中使用 CSS-in-JS
- 全局样式在 `ChatSidebar.css` 中定义
- 支持响应式设计

### API集成
- 当前使用豆包API
- 可以在 `ChatSidebar.jsx` 中修改API调用
- 需要在 `manifest.json` 中添加相应的host权限

## 🚀 部署发布

### 本地测试
1. 构建插件: `yarn build`
2. 在Chrome中加载插件
3. 测试各项功能

### 商店发布
1. 准备商店素材（图标、截图、描述）
2. 打包 `dist` 目录为 zip 文件
3. 上传到 Chrome Web Store
4. 等待审核通过

## 📝 开发注意事项

### 权限管理
- 只申请必要的权限
- 在manifest.json中明确声明
- 考虑用户隐私和安全

### 性能优化
- 避免阻塞主线程
- 合理使用内存
- 优化包大小

### 兼容性
- 测试不同网站的兼容性
- 处理各种布局情况
- 确保不影响原网页功能

### 安全性
- 不要在代码中硬编码敏感信息
- 验证用户输入
- 使用HTTPS API

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支
3. 提交代码
4. 发起 Pull Request

## 📄 许可证

MIT License

## 🆘 常见问题

### Q: 插件无法加载？
A: 检查manifest.json语法，确保构建成功

### Q: 内容脚本不工作？
A: 检查权限设置，确保有activeTab权限

### Q: 样式不生效？
A: 检查Shadow DOM和CSS作用域

### Q: API调用失败？
A: 检查网络权限和API密钥配置

## 📞 联系方式

如有问题或建议，请提交Issue或联系开发者。

---

*最后更新: 2024年* 