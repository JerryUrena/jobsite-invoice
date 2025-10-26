import { LineItem } from "../types";

export function computeSubtotal(items: LineItem[]) {
  return items.reduce((s, it) => s + it.qty * it.rate, 0);
}

export function computeTotal(items: LineItem[], taxRate: number, markup: number) {

  const sub = computeSubtotal(items);
  const withMarkup = sub * (1 + markup);
  const total = withMarkup * (1 + taxRate);

  return Number(total.toFixed(2));
}
