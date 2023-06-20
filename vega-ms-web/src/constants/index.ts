export const invoiceSync = [
  {
    value: true,
    label: '货票同行',
  },
  {
    value: false,
    label: '消耗结算',
  },
];

export const payType = [
  {
    value: 1,
    label: '现金',
  },
  {
    value: 2,
    label: '支票',
  },
  {
    value: 3,
    label: '付委',
  },
];

export const timeType = [
  {
    label: '近三天',
    type: 'day',
    count: -3,
  },
  {
    label: '最近一周',
    type: 'day',
    count: -7,
  },
  {
    label: '近一个月',
    type: 'month',
    count: -1,
  },
];

export const timeType2 = [
  {
    label: '近三天',
    type: 'day',
    count: -3,
  },
  {
    label: '最近一周',
    type: 'day',
    count: -7,
  },
  {
    label: '近一个月',
    type: 'month',
    count: -1,
  },
];

export const timeType3 = [
  {
    label: '当天',
    type: 'day',
    count: 0,
  },
  {
    label: '最近一周',
    type: 'day',
    count: -7,
  },
  {
    label: '近一个月',
    type: 'month',
    count: -1,
  },
];

export const barcodeControl = [
  {
    label: '条码管控',
    value: true,
  },
  {
    label: '非条码管控',
    value: false,
  },
];

export const chargeType = [
  { label: '医嘱', value: 0 },
  { label: '补记账', value: 1 },
];
