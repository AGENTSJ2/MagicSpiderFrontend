export async function waitForMilliseconds(milliseconds: number) {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}

export function getFormattedText(
  text = '',
  listType: ListType = 'none',
  bulletStyle: BulletStyle = 'disc',
  numberStyle: NumberStyle = 'decimal',
): string {
  if (listType === 'none') {
    return text;
  }

  let itemNumber = 0;
  return text
    .split('\n')
    .map((line) => {
      if (!line.trim()) {
        return line;
      }

      itemNumber += 1;
      if (listType === 'bullet') {
        return `${getBulletMarker(bulletStyle)} ${line}`;
      }

      return `${getNumberMarker(itemNumber, numberStyle)} ${line}`;
    })
    .join('\n');
}

export function getBulletMarker(style: BulletStyle): string {
  const markers: Record<BulletStyle, string> = {
    disc: '•',
    circle: '◦',
    square: '▪',
    dash: '-',
    check: '✓',
  };
  return markers[style];
}

export function getNumberMarker(value: number, style: NumberStyle): string {
  switch (style) {
    case 'lower-alpha':
      return `${getAlphaMarker(value, false)}.`;
    case 'upper-alpha':
      return `${getAlphaMarker(value, true)}.`;
    case 'lower-roman':
      return `${getRomanMarker(value).toLowerCase()}.`;
    case 'upper-roman':
      return `${getRomanMarker(value)}.`;
    default:
      return `${value}.`;
  }
}

export function getAlphaMarker(value: number, upperCase: boolean): string {
  let result = '';
  let current = value;
  while (current > 0) {
    current -= 1;
    result = String.fromCharCode(97 + (current % 26)) + result;
    current = Math.floor(current / 26);
  }
  return upperCase ? result.toUpperCase() : result;
}

export function getRomanMarker(value: number): string {
  const numerals: Array<[number, string]> = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let current = value;
  let result = '';
  for (const [amount, numeral] of numerals) {
    while (current >= amount) {
      result += numeral;
      current -= amount;
    }
  }
  return result;
}
export type ListType = 'none' | 'bullet' | 'number';
export type BulletStyle = 'disc' | 'circle' | 'square' | 'dash' | 'check';
export type NumberStyle =
  | 'decimal'
  | 'lower-alpha'
  | 'upper-alpha'
  | 'lower-roman'
  | 'upper-roman';
