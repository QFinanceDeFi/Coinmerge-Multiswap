function isString(s: any) {
    return (typeof s === 'string' || s instanceof String)
  }

export function checkIsBase(sym: string): boolean {
  const str = sym ? sym.toLowerCase() : '';
  if (str === "eth" || str === "avax" || str === "bnb" || str === "matic") {
      return true;
  } else {
      return false;
  }
}

export function cleanString(str: string, decimals: number) {
  try {
    if (!str || Number(str) === 0 || isNaN(Number(str))) return '0';
    let newStr = '';
    if (str.length <= decimals) {
        const diff = decimals - str.length;
        const list = str.split('');
        for (let i = 0; i < diff; i++) {
            list.splice(0, -1, '0');
        }
        list.splice(0, -1, '0.');
        newStr = list.join('');
    } else {
        newStr = str;
        const decimalPlaces = newStr.slice(str.length - decimals);
        const inFront = newStr.slice(0, str.length - decimals);
        newStr = `${inFront}.${decimalPlaces}`;
    }

    return newStr;    
  }
  catch {
    return '0';
  }
}
  
export function toBaseUnit(value: string, decimals: number, BN: any) {
    if (!isString(value)) {
      throw new Error('Pass strings to prevent floating point precision issues.')
    }
    const ten = new BN(10);
    const base = ten.pow(new BN(decimals));
  
    // Is it negative?
    let negative = (value.substring(0, 1) === '-');
    if (negative) {
      value = value.substring(1);
    }
  
    if (value === '.') { 
      throw new Error(
      `Invalid value ${value} cannot be converted to`
      + ` base unit with ${decimals} decimals.`); 
    }
  
    // Split it into a whole and fractional part
    let comps = value.split('.');
    if (comps.length > 2) { throw new Error('Too many decimal points'); }
  
    let whole: any = comps[0], fraction = comps[1];
  
    if (!whole) { whole = '0'; }
    if (!fraction) { fraction = '0'; }
    if (fraction.length > decimals) { 
      throw new Error('Too many decimal places'); 
    }
  
    while (fraction.length < decimals) {
      fraction += '0';
    }
  
    whole = new BN(whole);
    fraction = new BN(fraction);
    let wei = (whole.mul(base)).add(fraction);
  
    if (negative) {
      wei = wei.neg();
    }
  
    return new BN(wei.toString(10), 10);
  }

export function asDollar(amount: number | string): string {
  const strAmount: string = Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  
  return strAmount;
}