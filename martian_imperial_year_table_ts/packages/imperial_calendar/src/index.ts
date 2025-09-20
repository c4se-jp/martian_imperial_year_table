console.info("This is a TypeScript project!");

/**
 * 火星帝国暦の年を取得する
 */
export function getCurrentMartianYear(): number {
  // 仮の実装：地球暦から火星帝国暦への変換
  const earthYear = new Date().getFullYear();
  return earthYear + 1000; // 例：火星帝国暦は地球暦+1000年
}

/**
 * 二つの数を足し算する
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * 文字列が空かどうかを判定する
 */
export function isEmpty(str: string): boolean {
  return str.length === 0;
}
