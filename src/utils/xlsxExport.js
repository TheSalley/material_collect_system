/**
 * 极简 xlsx 导出（零依赖）
 *
 * 项目里没有装 SheetJS，也不想为一个导出功能引入 1MB 依赖，
 * 这里直接按 OOXML 规范拼一个最小可用的工作簿：
 * zip（store，不压缩）+ sheet.xml + styles.xml。
 *
 * 支持：标题/副标题/表头/正文样式、自动换行、列宽、行高、单元格合并。
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function utf8(text) {
  return new TextEncoder().encode(text);
}

/**
 * 生成 zip（存储方式，无压缩）
 * @param {Array<{ name: string, content: string }>} files
 */
function buildZip(files) {
  const chunks = [];
  const central = [];
  let offset = 0;

  const now = new Date();
  const dosTime =
    (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate =
    ((now.getFullYear() - 1980) << 9) |
    ((now.getMonth() + 1) << 5) |
    now.getDate();

  files.forEach(({ name, content }) => {
    const nameBytes = utf8(name);
    const dataBytes = utf8(content);
    const crc = crc32(dataBytes);

    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(8, 0, true);
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, dataBytes.length, true);
    lv.setUint32(22, dataBytes.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    local.set(nameBytes, 30);

    chunks.push(local, dataBytes);

    const cd = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, dataBytes.length, true);
    cv.setUint32(24, dataBytes.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    cd.set(nameBytes, 46);

    central.push(cd);
    offset += local.length + dataBytes.length;
  });

  const centralSize = central.reduce((sum, item) => sum + item.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);

  return new Blob([...chunks, ...central, end], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function escapeXml(value) {
  return (
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
      // 去掉 XML 1.0 不允许的控制字符
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
  );
}

function columnName(index) {
  let name = "";
  let n = index;
  while (n >= 0) {
    name = String.fromCharCode((n % 26) + 65) + name;
    n = Math.floor(n / 26) - 1;
  }
  return name;
}

const STYLE_IDS = {
  title: 1,
  subtitle: 2,
  header: 3,
  text: 4,
  sample: 5,
  section: 6,
  index: 7,
};

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="6">
    <font><sz val="11"/><name val="Microsoft YaHei"/></font>
    <font><b/><sz val="18"/><name val="Microsoft YaHei"/></font>
    <font><sz val="10"/><color rgb="FF8A93A0"/><name val="Microsoft YaHei"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Microsoft YaHei"/></font>
    <font><sz val="11"/><color rgb="FF1F2933"/><name val="Microsoft YaHei"/></font>
    <font><sz val="11"/><color rgb="FF2B7CEE"/><name val="Microsoft YaHei"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF2B7CEE"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF2F6FC"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE8F1FD"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFDCE3EC"/></left>
      <right style="thin"><color rgb="FFDCE3EC"/></right>
      <top style="thin"><color rgb="FFDCE3EC"/></top>
      <bottom style="thin"><color rgb="FFDCE3EC"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="8">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="5" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

/* =====================================================================
 * 富样式导出（动态生成 styles.xml）
 *
 * 用于需要精细还原参考表格样式（分区底色、蓝色示例字、粗描边、跨行合并等）的场景。
 * 每个单元格用语义化的样式对象描述，内部按需注册 font / fill / border / xf 并去重。
 * ===================================================================== */

class StyleRegistry {
  constructor() {
    this.fonts = [];
    this.fills = [
      '<fill><patternFill patternType="none"/></fill>',
      '<fill><patternFill patternType="gray125"/></fill>',
    ];
    this.borders = ["<border><left/><right/><top/><bottom/><diagonal/></border>"];
    this.xfs = [
      '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>',
    ];
    this._fontCache = new Map();
    this._fillCache = new Map();
    this._borderCache = new Map();
    this._xfCache = new Map();
  }

  _key(o) {
    return JSON.stringify(o);
  }

  font(spec = {}) {
    const s = {
      name: spec.name || "微软雅黑",
      size: spec.size || 11,
      bold: !!spec.bold,
      color: spec.color || "FF000000",
    };
    const k = this._key(s);
    if (this._fontCache.has(k)) return this._fontCache.get(k);
    const parts = [];
    if (s.bold) parts.push("<b/>");
    parts.push(`<sz val="${s.size}"/>`);
    parts.push(`<color rgb="${s.color}"/>`);
    parts.push(`<name val="${s.name}"/>`);
    const idx = this.fonts.length;
    this.fonts.push(`<font>${parts.join("")}</font>`);
    this._fontCache.set(k, idx);
    return idx;
  }

  fill(rgb) {
    if (!rgb) return 0;
    const k = rgb;
    if (this._fillCache.has(k)) return this._fillCache.get(k);
    const idx = this.fills.length;
    this.fills.push(
      `<fill><patternFill patternType="solid"><fgColor rgb="${rgb}"/><bgColor indexed="64"/></patternFill></fill>`,
    );
    this._fillCache.set(k, idx);
    return idx;
  }

  border(spec = {}) {
    const map = { thin: "thin", medium: "medium", thick: "thick" };
    const side = (name) =>
      spec[name]
        ? `<${name} style="${map[spec[name]] || "thin"}"><color rgb="${spec.color || "FF000000"}"/></${name}>`
        : `<${name}/>`;
    const key = this._key({ ...spec });
    if (this._borderCache.has(key)) return this._borderCache.get(key);
    const idx = this.borders.length;
    this.borders.push(
      `<border>${side("left")}${side("right")}${side("top")}${side("bottom")}<diagonal/></border>`,
    );
    this._borderCache.set(key, idx);
    return idx;
  }

  xf({ font, fill, border, align } = {}) {
    const fontId = this.font(font || {});
    const fillId = this.fill(fill);
    const borderId = border ? this.border(border) : 0;
    const h = align?.h || "left";
    const v = align?.v || "center";
    const wrap = align?.wrap ? "1" : "0";
    const key = this._key({ fontId, fillId, borderId, h, v, wrap });
    if (this._xfCache.has(key)) return this._xfCache.get(key);
    const idx = this.xfs.length;
    this.xfs.push(
      `<xf numFmtId="0" fontId="${fontId}" fillId="${fillId}" borderId="${borderId}" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="${h}" vertical="${v}" wrapText="${wrap}"/></xf>`,
    );
    this._xfCache.set(key, idx);
    return idx;
  }

  toXml() {
    if (this.fonts.length === 0) {
      this.fonts.push('<font><sz val="11"/><name val="微软雅黑"/></font>');
    }
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="${this.fonts.length}">${this.fonts.join("")}</fonts>
  <fills count="${this.fills.length}">${this.fills.join("")}</fills>
  <borders count="${this.borders.length}">${this.borders.join("")}</borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="${this.xfs.length}">${this.xfs.join("")}</cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
  }
}

/**
 * 富样式导出：rows 为单元格描述数组，支持 colspan / rowspan / 逐格样式。
 *
 * @param {object} o
 * @param {string} o.fileName
 * @param {string} o.sheetName
 * @param {Array<{width:number}>} o.columns
 * @param {Array<{height?:number, cells:Array<object>}>} o.rows
 *   cell: { v?:string, bold?, size?, color?, fill?, border?:{...}, align?:{h,v,wrap}, colspan?, rowspan? }
 * @param {string[]} [o.merges] 额外合并（自动合并会追加）
 */
export function downloadRichXlsx({
  fileName = "export",
  sheetName = "Sheet1",
  columns = [],
  rows = [],
  merges = [],
  frame = null, // { edge: "medium", color? } 将整表外框加粗
}) {
  const registry = new StyleRegistry();
  const sheetRows = [];
  const allMerges = [...merges];

  const maxCols = Math.max(columns.length, 1);

  // 第一遍：把每个单元格铺满它跨越的所有物理格子（保证合并区域四边都有边框）
  const grid = []; // grid[rowIdx-1] = Map(colIdx -> {value, styleSpec})
  rows.forEach((row, rOff) => {
    const rowIndex = rOff + 1;
    if (!grid[rOff]) grid[rOff] = new Map();
    let colIndex = 0;
    (row.cells || []).forEach((cell) => {
      const span = cell.colspan || 1;
      const rspan = cell.rowspan || 1;
      if (cell.blank) {
        colIndex += span;
        return;
      }
      const styleSpec = {
        font: {
          size: cell.size,
          bold: cell.bold,
          color: cell.color,
          name: cell.fontName,
        },
        fill: cell.fill,
        border: cell.border,
        align: cell.align,
      };
      // 铺满整个 colspan × rowspan 区域
      for (let dr = 0; dr < rspan; dr += 1) {
        if (!grid[rOff + dr]) grid[rOff + dr] = new Map();
        for (let dc = 0; dc < span; dc += 1) {
          grid[rOff + dr].set(colIndex + dc, {
            value: dr === 0 && dc === 0 ? cell.v : undefined,
            styleSpec,
          });
        }
      }
      if (span > 1 || rspan > 1) {
        allMerges.push(
          `${columnName(colIndex)}${rowIndex}:${columnName(
            colIndex + span - 1,
          )}${rowIndex + rspan - 1}`,
        );
      }
      colIndex += span;
    });
  });

  // 整表外框：把最外圈物理格子的对应边升级为更粗的边框
  if (frame) {
    const edge = frame.edge || "medium";
    const color = frame.color;
    const lastRowOff = rows.length - 1;
    const upgrade = (entry, side) => {
      if (!entry) return;
      const prev = entry.styleSpec.border || {};
      entry.styleSpec.border = { ...prev, [side]: edge, color: color || prev.color };
    };
    grid.forEach((colsMap, rOff) => {
      colsMap.forEach((entry, c) => {
        if (rOff === 0) upgrade(entry, "top");
        if (rOff === lastRowOff) upgrade(entry, "bottom");
        if (c === 0) upgrade(entry, "left");
        if (c === maxCols - 1) upgrade(entry, "right");
      });
    });
  }

  // 第二遍：按行输出，未覆盖的空列不输出
  rows.forEach((row, rOff) => {
    const height = row.height || 22;
    const rowIndex = rOff + 1;
    const covered = grid[rOff] || new Map();
    const cells = [];
    for (let c = 0; c < maxCols; c += 1) {
      const entry = covered.get(c);
      if (!entry) continue;
      const ref = `${columnName(c)}${rowIndex}`;
      const s = registry.xf(entry.styleSpec);
      const value = entry.value == null ? "" : String(entry.value);
      cells.push(
        `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`,
      );
    }
    sheetRows.push(
      `<row r="${rowIndex}" ht="${height}" customHeight="1">${cells.join("")}</row>`,
    );
  });

  const sheetXml = buildSheetXml({
    colsXml: columns
      .map(
        (col, index) =>
          `<col min="${index + 1}" max="${index + 1}" width="${col.width}" customWidth="1"/>`,
      )
      .join(""),
    sheetRows,
    allMerges,
  });

  const blob = buildZip([
    contentTypes(),
    rootRels(),
    workbookFile(sheetName),
    workbookRels(),
    { name: "xl/styles.xml", content: registry.toXml() },
    { name: "xl/worksheets/sheet1.xml", content: sheetXml },
  ]);
  triggerDownload(blob, fileName);
}

function buildSheetXml({ colsXml, sheetRows, allMerges }) {
  const mergeXml = allMerges.length
    ? `<mergeCells count="${allMerges.length}">${allMerges
        .map((ref) => `<mergeCell ref="${ref}"/>`)
        .join("")}</mergeCells>`
    : "";
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="20"/>
  <cols>${colsXml}</cols>
  <sheetData>${sheetRows.join("")}</sheetData>
  ${mergeXml}
  <pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>
  <pageSetup orientation="portrait" fitToWidth="1" fitToHeight="0"/>
</worksheet>`;
}

function contentTypes() {
  return {
    name: "[Content_Types].xml",
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
  };
}

function rootRels() {
  return {
    name: "_rels/.rels",
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
  };
}

function workbookFile(sheetName) {
  return {
    name: "xl/workbook.xml",
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="${escapeXml(sheetName).slice(0, 31)}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
  };
}

function workbookRels() {
  return {
    name: "xl/_rels/workbook.xml.rels",
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
  };
}

function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * 导出一个带样式的 xlsx 工作表
 *
 * @param {object} options
 * @param {string} options.fileName 下载文件名（不需要 .xlsx）
 * @param {string} options.sheetName 工作表名
 * @param {string} options.title 第一行大标题
 * @param {string} options.subtitle 第二行副标题
 * @param {Array<{ width: number }>} options.columns 列定义
 * @param {Array<{ height?: number, cells: Array<{ value?: string, style?: string, colspan?: number }> }>} options.rows 数据行
 * @param {string[]} options.merges 合并区域，如 ["A1:F1"]
 */
export function downloadXlsx({
  fileName = "export",
  sheetName = "Sheet1",
  title = "",
  subtitle = "",
  columns = [],
  rows = [],
  merges = [],
}) {
  const lastCol = columnName(Math.max(columns.length - 1, 0));
  const sheetRows = [];
  const allMerges = [...merges];

  let rowIndex = 1;

  if (title) {
    sheetRows.push(
      `<row r="1" ht="34" customHeight="1"><c r="A1" s="${STYLE_IDS.title}" t="inlineStr"><is><t>${escapeXml(title)}</t></is></c></row>`,
    );
    allMerges.push(`A1:${lastCol}1`);
    rowIndex = 2;
  }

  if (subtitle) {
    sheetRows.push(
      `<row r="${rowIndex}" ht="20" customHeight="1"><c r="A${rowIndex}" s="${STYLE_IDS.subtitle}" t="inlineStr"><is><t>${escapeXml(subtitle)}</t></is></c></row>`,
    );
    allMerges.push(`A${rowIndex}:${lastCol}${rowIndex}`);
    rowIndex += 1;
  }

  rows.forEach((row) => {
    const height = row.height || 22;
    const cells = [];
    let colIndex = 0;
    (row.cells || []).forEach((cell) => {
      const ref = `${columnName(colIndex)}${rowIndex}`;
      const style = STYLE_IDS[cell.style] ?? STYLE_IDS.text;
      const value = cell.value == null ? "" : String(cell.value);
      cells.push(
        `<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`,
      );
      const span = cell.colspan || 1;
      if (span > 1) {
        allMerges.push(`${ref}:${columnName(colIndex + span - 1)}${rowIndex}`);
      }
      colIndex += span;
    });
    sheetRows.push(
      `<row r="${rowIndex}" ht="${height}" customHeight="1">${cells.join("")}</row>`,
    );
    rowIndex += 1;
  });

  const colsXml = columns
    .map(
      (col, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${col.width}" customWidth="1"/>`,
    )
    .join("");

  const mergeXml = allMerges.length
    ? `<mergeCells count="${allMerges.length}">${allMerges
        .map((ref) => `<mergeCell ref="${ref}"/>`)
        .join("")}</mergeCells>`
    : "";

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="20"/>
  <cols>${colsXml}</cols>
  <sheetData>${sheetRows.join("")}</sheetData>
  ${mergeXml}
  <pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>
</worksheet>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="${escapeXml(sheetName).slice(0, 31)}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

  const files = [
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      content: workbookXml,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    { name: "xl/styles.xml", content: STYLES_XML },
    { name: "xl/worksheets/sheet1.xml", content: sheetXml },
  ];

  const blob = buildZip(files);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
