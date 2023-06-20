/**
 * 获取物资类型权限,用于Tag选择组件
 */
const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');
export const useGoodsType = (
	props: { goodsValue?: string | number; ordinaryValue?: string | number } = {},
) => {
	const { goodsValue, ordinaryValue } = props;
	const tagsData = [{ value: goodsValue || 'goods', label: fields.baseGoods }];
	const tabList = JSON.parse(sessionStorage.getItem('dictionary') || '{}').package_config || [];
	tabList.forEach((value: { text: string }) => {
		if (value.text === '医耗套包') {
			tagsData.push({ value: ordinaryValue || 'package_ordinary', label: '医耗套包' });
		}
	});
	return tagsData;
};
