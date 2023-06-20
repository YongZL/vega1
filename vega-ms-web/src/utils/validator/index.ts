// 公共的 form rule validator请在此文件或者validator目录下新建文件编写
// 或者一些常用的数据校验编写

/**  校验发票金额 */
const precision = JSON.parse(sessionStorage.getItem('precision') || '{}')['configValue'];
const precisionValue = parseInt(precision || 2);
export const validateInvoiceAmount = (_rule: any, value: string) => {
  const reg = new RegExp(`^[0-9]([0-9]+)?(\.[0-9]{1,${precisionValue}})?$`);
  if (value && !reg.test(value)) {
    return Promise.reject('请输入正确数值');
  }
  if (parseFloat(value) && parseFloat(value) > 100000000) {
    return Promise.reject('最高可输入100000000');
  }
  return Promise.resolve();
};
