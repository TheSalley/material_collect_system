# 字体文件说明

本项目使用 **HarmonyOS Sans**（华为开源，免费商用），分两层用 `unicode-range` 各管各的：

| 用途 | 文件 | 格式 | 体积 |
|---|---|---|---|
| 拉丁 / 数字 / 英文标点 | `HarmonyOS_Sans_{Regular,Medium,Bold}.ttf` | ttf | 各 ~140KB |
| 中文 / 全角标点 | `HarmonyOS_Sans_SC_{Regular,Medium,Bold}.woff2` | **子集化** woff2 | 各 ~0.9MB |

- 只保留 **400 / 500 / 700** 三个字重，其余（Thin/Light/Black、斜体）已删除。
- 中文子集：**GB2312 全集 + 项目实际用字**，共 6763 个中文字，覆盖日常与后台常见场景。
- `@font-face` 已用 `unicode-range` 分层：英文/数字只加载小的 ttf，中文才加载 SC woff2，互不拖累。

## 缺字怎么办

子集只含 GB2312 范围的中文。若将来出现生僻字（GB2312 之外的扩展汉字）显示为方框，需要：
1. 重新生成更大的字符集（改用 GBK/GB18030 全集，或把项目里新出现的字加进去）
2. 用 `fonttools` 重新子集化 `HarmonyOS_Sans_SC_*.ttf` → woff2

## 子集化方法（备查）

本机 Python 已装 `fonttools` + `brotli`。命令示例：

```
pyftsubset HarmonyOS_Sans_SC_Regular.ttf \
  --text-file=.charset.txt \
  --flavor=woff2 \
  --layout-features=* --no-hinting --desubroutinize \
  --output-file=HarmonyOS_Sans_SC_Regular.woff2
```
