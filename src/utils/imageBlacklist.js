export function normalizeUrlInput(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function stripWordPressSizeSuffix(value) {
  return value.replace(/-\d+x\d+(?=\.[^.]+$)/i, "");
}

export function safelyDecodeUrlPart(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function extractUrlTail(value) {
  const trimmed = normalizeUrlInput(value);
  if (!trimmed) return "";

  try {
    const source = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
    const parsed = new URL(source, "https://blacklist.local");
    return normalizeUrlInput(
      safelyDecodeUrlPart(`${parsed.pathname || ""}${parsed.search || ""}${parsed.hash || ""}`)
    );
  } catch {
    const protocolMatch = trimmed.match(/^[a-z]+:\/\/[^/]+(\/.*)?$/i);
    if (protocolMatch) {
      return normalizeUrlInput(safelyDecodeUrlPart(protocolMatch[1] || "/"));
    }
    return normalizeUrlInput(safelyDecodeUrlPart(trimmed));
  }
}

export function buildUrlMatchTokens(value) {
  const trimmed = normalizeUrlInput(value);
  if (!trimmed) return [];

  const tokens = new Set();
  const pushToken = (item) => {
    const token = normalizeUrlInput(item);
    if (token) {
      tokens.add(token.toLowerCase());
    }
  };

  const urlTail = extractUrlTail(trimmed);
  const tailWithoutHash = urlTail.split("#")[0] || "";
  const tailWithoutQuery = tailWithoutHash.split("?")[0] || "";
  const normalizedTail = stripWordPressSizeSuffix(tailWithoutQuery);
  const tailWithoutLeadingSlash = tailWithoutQuery.replace(/^\/+/, "");
  const normalizedTailWithoutLeadingSlash = normalizedTail.replace(/^\/+/, "");

  pushToken(urlTail);
  pushToken(tailWithoutHash);
  pushToken(tailWithoutQuery);
  pushToken(normalizedTail);
  pushToken(tailWithoutLeadingSlash);
  pushToken(normalizedTailWithoutLeadingSlash);

  return [...tokens];
}

export function hasTokenIntersection(sourceTokens, targetTokens) {
  if (sourceTokens.length === 0 || targetTokens.length === 0) return false;
  const targetTokenSet = new Set(targetTokens);
  return sourceTokens.some((token) => targetTokenSet.has(token));
}

export function hasSafeContainsMatch(sourceTokens, targetTokens) {
  return sourceTokens.some(
    (sourceToken) =>
      sourceToken.length >= 4 &&
      targetTokens.some(
        (targetToken) =>
          targetToken.length >= 4 &&
          (sourceToken.includes(targetToken) || targetToken.includes(sourceToken))
      )
  );
}

export function isImageBlacklisted(url, blacklist) {
  const trimmedUrl = normalizeUrlInput(url);
  if (!trimmedUrl || !Array.isArray(blacklist) || blacklist.length === 0) {
    return false;
  }

  const imageTokens = buildUrlMatchTokens(trimmedUrl);
  if (imageTokens.length === 0) return false;

  return blacklist.some((item) => {
    const entryTokens = buildUrlMatchTokens(item);
    return (
      hasTokenIntersection(imageTokens, entryTokens) ||
      hasSafeContainsMatch(imageTokens, entryTokens)
    );
  });
}
