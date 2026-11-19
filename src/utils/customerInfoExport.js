/**
 * 客户基础信息导出：按《网站部-企业基本信息收集表》的版式组织行数据。
 * 纯数据构造，不触碰浏览器 API，便于复用与测试。
 */

export const REF_COLORS = {
  titleBg: "FF262626",
  titleFont: "FFFFFFFF",
  subBg: "FF7892B1",
  subFont: "FFFFFFFF",
  headBg: "FFD8D8D8",
  secA: "FFF3F7FC",
  secB: "FFF8FDF8",
  fillGreen: "FFF0F9F0",
  text: "FF1F2933",
  muted: "FF595959",
  sample: "FF00B0F0",
  black: "FF000000",
  line: "FF9AA6B2",
};

const THIN_BORDER = (color) => ({
  top: "thin",
  bottom: "thin",
  left: "thin",
  right: "thin",
  color,
});

function cell(overrides = {}) {
  return {
    size: 11,
    color: REF_COLORS.text,
    align: { h: "center", v: "center", wrap: true },
    border: THIN_BORDER(REF_COLORS.line),
    ...overrides,
  };
}

const PROJECT_GROUPS = {
  company_name_cn: { label: "公司全称", span: 2 },
  old_site: { label: "老网站URL相关", span: 2 },
  smtp_email: {
    label: "SMTP邮箱配置\n提供一个QQ邮箱和授权码",
    span: 2,
    mergeHint: true,
  },
};

/**
 * 构造导出所需的行数据。
 * @param {object} o
 * @param {Array} o.sections 分区定义
 * @param {object} o.form 表单值
 * @param {(field:object)=>number} o.estimateHeight 行高估算
 */
export function buildCustomerInfoRows({
  sections,
  form,
  estimateHeight,
}) {
  const rows = [];
  const C = REF_COLORS;

  // 标题
  rows.push({
    height: 54,
    cells: [
      cell({
        v: "企 业 基 本 信 息 收 集 表 （ 建 站 服 务 ）",
        colspan: 6,
        bold: true,
        size: 20,
        color: C.titleFont,
        fill: C.titleBg,
        align: { h: "center", v: "center", wrap: true },
      }),
    ],
  });

  // 副标题
  rows.push({
    height: 19,
    cells: [
      cell({
        v: "易海创腾网站部202411",
        colspan: 6,
        bold: true,
        size: 11,
        color: C.subFont,
        fill: C.subBg,
        align: { h: "right", v: "center" },
      }),
    ],
  });

  // 表头
  const headers = [
    "序号",
    "板块",
    "项目",
    "填写内容\n（以下蓝色为示例）",
    "客户填写内容",
    "用途",
  ];
  rows.push({
    height: 42,
    cells: headers.map((v) =>
      cell({
        v,
        bold: true,
        size: 14,
        color: C.black,
        fill: C.headBg,
        border: {
          top: "medium",
          bottom: "thin",
          left: "thin",
          right: "thin",
          color: C.black,
        },
      }),
    ),
  });

  let index = 0;
  sections.forEach((section, sIdx) => {
    const fill = sIdx % 2 === 0 ? C.secA : C.secB;
    let groupLeft = 0;
    let hintCoverLeft = 0;

    section.fields.forEach((field, fIdx) => {
      index += 1;
      const value = form[field.key] || "";
      const cells = [];

      // A 序号
      cells.push(
        cell({
          v: String(index),
          fill,
          border: { ...THIN_BORDER(C.line), left: "medium" },
        }),
      );

      // B 板块
      if (fIdx === 0) {
        cells.push(
          cell({
            v: section.title,
            bold: true,
            size: 12,
            color: C.black,
            fill,
            rowspan: section.fields.length,
          }),
        );
      } else {
        cells.push({ blank: true });
      }

      // C 项目
      const group = PROJECT_GROUPS[field.key];
      if (group) {
        groupLeft = group.span - 1;
        if (group.mergeHint) hintCoverLeft = group.span - 1;
        cells.push(cell({ v: group.label, fill, rowspan: group.span }));
      } else if (groupLeft > 0) {
        groupLeft -= 1;
        cells.push({ blank: true });
      } else {
        cells.push(cell({ v: field.label, fill }));
      }

      // D 示例（蓝色）
      cells.push(
        cell({
          v: field.sample || "",
          color: C.sample,
          align: { h: "left", v: "center", wrap: true },
          fill,
        }),
      );

      // E 客户填写
      cells.push(
        cell({
          v: value,
          bold: true,
          color: C.black,
          fill: C.fillGreen,
          align: { h: "center", v: "center", wrap: true },
        }),
      );

      // F 用途
      if (group && group.mergeHint) {
        cells.push(
          cell({
            v: field.hint || "",
            color: C.muted,
            align: { h: "left", v: "center", wrap: true },
            fill,
            rowspan: group.span,
            border: { ...THIN_BORDER(C.line), right: "medium" },
          }),
        );
      } else if (hintCoverLeft > 0) {
        hintCoverLeft -= 1;
        cells.push({ blank: true });
      } else {
        cells.push(
          cell({
            v: field.hint || "",
            color: C.muted,
            align: { h: "left", v: "center", wrap: true },
            fill,
            border: { ...THIN_BORDER(C.line), right: "medium" },
          }),
        );
      }

      rows.push({ height: estimateHeight(field), cells });
    });
  });

  return rows;
}

export const CUSTOMER_INFO_COLUMNS = [
  { width: 6 },
  { width: 17.5 },
  { width: 30 },
  { width: 40 },
  { width: 42 },
  { width: 40 },
];
