// 主要针字符串和数字的处理
import { uniq } from 'lodash';
import moment from 'moment';
import parseBarcode from '@/libs/BarcodeParser';

/**
 * 把价格转化成每三个数字用
 *
 * @param {number | string} money 需要转换的价格
 * @returns {string}
 */
export function convertMoney(money: number | string) {
  // 获取小数型数据
  let s = `${money}`;
  if (s.indexOf('.') === -1) {
    // 如果没有小数点，在后面补个小数点和0
    s += '.0';
  }
  if (/\.\d$/.test(s)) {
    s += '0';
  }
  while (/\d{4}(\.|,)/.test(s)) {
    // 符合条件则进行替换, 每隔3位添加一个
    s = s.replace(/(\d)(\d{3}(\.|,))/, '$1,$2');
  }
  return s;
}

/**
 * 根据获取精度配置项
 * 处理成带小数点的价格
 * @param {string | number} price
 * @returns {string}
 */
const precision = JSON.parse(sessionStorage.getItem('precision') || '{}')['configValue'];
const precisionValue = parseInt(precision || 2);
let zeroPrecisionStr = '.';
for (let i = 0, j = precisionValue; i < j; i++) {
  zeroPrecisionStr += '0';
}
export function convertPriceWithDecimal(price?: string | number) {
  if (!price) return 0 + zeroPrecisionStr;

  let toPrice = (Number(price) / 10000).toFixed(precisionValue);
  const len = String(toPrice).split('.')[1] ? String(toPrice).split('.')[1].length : 0;
  if (len === 0) {
    toPrice += zeroPrecisionStr;
  } else if (len === 1) {
    toPrice += '0';
  }
  return toPrice;
}

/**
 * 提交价格 -- 小数点后两位
 * @param {string | number} price
 * @returns
 */
export function submitPrice(price?: string | number) {
  if (!price) {
    return 0.0;
  }

  return (parseFloat(`${price}`) * 10000).toFixed(0);
}

/**
 * 金额转中文
 *
 * @param {string | number} rawMoney
 * @returns
 */
export function convertMoneyToCN(rawMoney?: string | number) {
  if (!rawMoney) {
    return '';
  }
  const moneyData = `${rawMoney}`;
  // 金额装大写
  // 汉字的数字
  const cnNums = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖');
  // 基本单位
  const cnIntRadice = new Array('', '拾', '佰', '仟');
  // 对应整数部分扩展单位
  const cnIntUnits = new Array('', '万', '亿', '兆');
  // 对应小数部分单位
  const cnDecUnits = new Array('角', '分', '毫', '厘');
  // 整数金额时后面跟的字符
  const cnInteger = '整';
  // 整型完以后的单位
  const cnIntLast = '元';
  // 最大处理的数字
  const maxNum = 999999999999999.9999;
  // 金额整数部分
  let integerNum;
  // 金额小数部分
  let decimalNum;
  // 输出的中文金额字符串
  let cnString = '';
  // 分离金额后用的数组，预定义
  let parts;
  // 正负值标记
  let symbol = '';
  let money;

  if (moneyData.includes(',')) {
    money = moneyData.replace(/,/g, '');
  } else {
    money = moneyData;
  }
  if (money == '') {
    return '';
  }
  money = parseFloat(money);
  if (money >= maxNum) {
    alert('超出最大处理数字');
    return '';
  }
  if (money == 0) {
    cnString = cnNums[0] + cnIntLast + cnInteger;
    return cnString;
  }
  if (money < 0) {
    money = -money;
    symbol = '负';
  }
  money = money.toString(); //转换为字符串
  if (money.indexOf('.') == -1) {
    integerNum = money;
    decimalNum = '';
  } else {
    parts = money.split('.');
    integerNum = parts[0];
    decimalNum = parts[1].substr(0, 4);
  }
  if (parseInt(integerNum, 10) > 0) {
    //获取整型部分转换
    var zeroCount = 0;
    var IntLen = integerNum.length;
    for (var i = 0; i < IntLen; i++) {
      var n = integerNum.substr(i, 1);
      var p = IntLen - i - 1;
      var q = p / 4;
      var m = p % 4;
      if (n == '0') {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          cnString += cnNums[0];
        }
        zeroCount = 0; //归零
        cnString += cnNums[parseInt(n)] + cnIntRadice[m];
      }
      if (m == 0 && zeroCount < 4) {
        cnString += cnIntUnits[q];
      }
    }
    cnString += cnIntLast;
    //整型部分处理完毕
  }
  if (decimalNum != '') {
    //小数部分
    var decLen = decimalNum.length;
    for (var i = 0; i < decLen; i++) {
      var n = decimalNum.substr(i, 1);
      if (n != '0') {
        cnString += cnNums[Number(n)] + cnDecUnits[i];
      }
    }
  }
  if (cnString == '') {
    cnString += cnNums[0] + cnIntLast + cnInteger;
  } else if (decimalNum == '') {
    cnString += cnInteger;
  }
  cnString = symbol + cnString;

  return cnString;
}

/**
 *
 * @param {string | number} unitNum
 * @param {string} purchaseUnit
 * @returns
 */
export function formatUnitNum2(unitNum: string | number, purchaseUnit: string) {
  return `${unitNum + '/'}${purchaseUnit}`;
}

/**
 *
 * @param {string | number} unitNum
 * @param {string} purchaseUnit
 * @param {string} purchaseUnitName
 * @returns
 */
export function formatUnitNum(
  unitNum: string | number,
  purchaseUnit: string | number,
  purchaseUnitName?: string,
) {
  if (purchaseUnitName) {
    return `${unitNum || ''}${purchaseUnit && purchaseUnit + '/'}${purchaseUnitName}`;
  } else {
    return `${unitNum || ''}${unitNum && purchaseUnit ? '/' : ''}${purchaseUnit || ''}`;
  }
}

// 将金额元转换成万元
export function formatMoney(money: number) {
  if (!money) {
    return 0;
  }
  return money / 1000000;
}

// gs1格式化
export function formatToGS1(gs1Code: string, all?: string) {
  let parseResult;
  try {
    gs1Code = gs1Code
      .replace(/\(/g, '')
      .replace(/\)/g, '')
      .replace(/\（/g, '')
      .replace(/\）/g, '')
      .replace(' ', '');
    // 0169，0069，69开头的码都需要转换成00069或01069
    if (gs1Code.startsWith('0169')) {
      gs1Code = `01069${gs1Code.substr(4)}`;
    } else if (gs1Code.startsWith('0069')) {
      gs1Code = `00069${gs1Code.substr(4)}`;
    } else if (gs1Code.startsWith('69')) {
      gs1Code = `010${gs1Code}`;
    }
    parseResult = parseBarcode(gs1Code) as unknown as { parsedCodeItems: any[] };
    parseResult.parsedCodeItems = uniq(parseResult.parsedCodeItems || []);
    gs1Code = (parseResult.parsedCodeItems || [])
      .map((item) => {
        // 17码解析成了Date，需要转换成string
        if (item.ai === '17' || item.ai === '11') {
          return `(${item.ai})${moment(item.data.valueOf()).format('YYMMDD')}`;
        }
        if (typeof item.data !== 'string') {
          return `(${item.ai})${moment(item.data.valueOf()).format('YYMMDD')}`;
        }
        return `(${item.ai})${item.data}`;
      })
      .join(' ');
  } catch (error) {
    gs1Code = '';
  }
  if (all) {
    return { gs1Code, items: parseResult ? parseResult.parsedCodeItems : [] };
  }
  return gs1Code;
}

/**
 * 万 -- 小数点后两位
 *
 * @param price
 * @returns
 */
export function priceToTenThousand(price?: number | string) {
  if (!price) {
    return 0.0;
  }
  return (Number(price) / 100000000).toLocaleString('zh', {
    style: 'decimal',
    minimumFractionDigits: 4,
  });
}

/**
 * 毫秒数转日期
 *
 * @param {number} msd 毫秒数
 * @returns
 */
export function millisecondToDate(msd: number) {
  if (!msd) {
    return '-';
  }
  const time = parseFloat(`${msd}`) / 1000;
  let res = `${time}`;

  if (res) {
    const d = parseInt(`${time / (60 * 60 * 24)}`);
    const h = parseInt(`${(time % (60 * 60 * 24)) / (60 * 60)}`);
    const m = parseInt(`${(time % (60 * 60)) / 60}`);
    const s = parseInt(`${time % 60}`);
    res =
      d > 0
        ? `${d}天${h}时${m}分${s}秒`
        : h > 0
          ? `${h}时${m}分${s}秒`
          : m > 0
            ? `${m}分${s}秒`
            : `${s}秒`;
  } else {
    res = '0秒';
  }
  return res;
}

/**
 *
 * @param {Array} params.list
 * @returns
 */
export function sortArray<T extends Record<string, any> = Record<string, any>>({
  list,
  key,
  desc = false,
}: {
  list: T[];
  key: string; // 排序的key
  desc?: boolean; // 是否是从大到小，默认是false
}) {
  if (list.length < 2) {
    return list;
  }
  return list.sort((a, b) => (desc ? b[key] - a[key] : a[key] - b[key]));
}

/**
 *
 * @param {goods} // 物资数据，必传
 * @param {largeKey} // 大包装取值字段
 * @param {goods} // 中包装取值字段
 * @param {goods} // 总数量字段
 * @returns string
 */
export function formatPackageQuantity({
  goods,
  largeKey = 'largeBoxNum',
  mediumKey = 'minGoodsNum',
  quantity = 'quantity',
}: {
  goods: Record<string, any>;
  largeKey?: string;
  mediumKey?: string;
  quantity?: string;
}) {
  const qty = goods[quantity];

  // 大包装数量
  const maxQty = Math.floor(qty / goods[largeKey]);
  const remainingQty = qty % goods[largeKey];

  // 中包装数量
  const mediumQty = Math.floor(remainingQty / goods[mediumKey]);

  return `${maxQty}/${mediumQty}/${remainingQty % goods[mediumKey]}`;
}

/**
 * @description 获取目标对象的某些key的value根据连接符组成字符串
 * @param {Object} target - 目标对象
 * @param {Array<String>} keys - 目标对象的key数组
 * @param {String} connector - 连接符 默认: /
 */
export const formatStrConnect = (
  target: Record<string, any>,
  keys: string[] = [],
  connector = '/',
) => {
  if (!target || typeof target !== 'object') return ''; // target 必须是对象
  if (!Array.isArray(keys)) return ''; // keys 必须是数组
  const arr = keys.reduce((list: string[], item) => {
    if (target[item]) {
      // 有值的时候才加入数组中
      list.push(target[item]);
    }
    return list;
  }, []);
  // 数组拼接成字符串
  return arr.join(connector);
};


/**
   * @description 多个空格合并成一个空格
   * @param {String} value - 需要格式化的字符串
   */
export const formatManySpaceBarToOne = (value: string) => {
  if (typeof value !== 'string') return value;
  return value.replace(/(\s)+/g, ' ');
};


/**
 * @description 对象中某些属性的值(字符串类型)去掉前后空格，中间连续多个空格只保留一个空格
 * @param {Object} map - 目标对象
 * @param {Array<String>} keys - map中key 数组
 */
export const formatValuesSpaceToOneOfMap = (map: Record<string, any>, keys: string[] = []) => {
  if (!Array.isArray(keys)) return map;

  for (let key of keys) {
    if (map.hasOwnProperty(key) && typeof map[key] === 'string') {
      map[key] = formatManySpaceBarToOne(map[key]).trim();
    }
  }

  return map;
}
