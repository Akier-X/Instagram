import { ScreeningInputItem } from "@/lib/screening/types";

const MIN_SIDE = 720;

function isSizeAcceptable(item: ScreeningInputItem) {
  if (!item.width || !item.height) {
    return Boolean(item.thumbnailUrl || item.webViewUrl);
  }
  return item.width >= MIN_SIDE && item.height >= MIN_SIDE;
}

export function filterLowQuality(items: ScreeningInputItem[]) {
  return items.filter((item) => {
    if (!item.thumbnailUrl && !item.webViewUrl) {
      return false;
    }
    return isSizeAcceptable(item);
  });
}
