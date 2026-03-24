# 图片转像素画工具

这是一个纯前端静态工具，可直接部署到 GitHub Pages，通过 `https://<用户名>.github.io/<仓库名>/` 访问。

## 已配置自动部署

仓库已包含 GitHub Actions 工作流：`.github/workflows/deploy-pages.yml`。

默认行为：
- 推送到 `main` 分支会自动部署。
- 也支持在 Actions 页面手动触发部署。

## 启用 GitHub Pages

1. 打开仓库页面 → **Settings** → **Pages**。
2. 在 **Build and deployment** 中将 **Source** 设为 **GitHub Actions**。
3. 推送一次到 `main`（或手动运行 Actions）。
4. 部署完成后访问：
   - 用户仓库：`https://<用户名>.github.io/`
   - 项目仓库（本项目常见）：`https://<用户名>.github.io/<仓库名>/`

> 本项目资源使用相对路径（`styles.css`、`script.js`），可直接在 GitHub Pages 的子路径下运行。
