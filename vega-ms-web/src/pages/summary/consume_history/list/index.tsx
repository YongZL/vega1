import TabsMax from '@/components/TabsMax';
import { useGoodsType } from '@/hooks/useGoodsType';
import Goods from '../components/Goods';
import Ordinary from '../components/Ordinary';

const fields = JSON.parse(sessionStorage.getItem('fields') || '{}');

const tabsList = [
	{
		name: fields.baseGoods,
		key: '1',
		permissions: 'consume_history_list', //暂无相关权限，这里用已存在权限暂时替代下，以方便看到页面，权限更新后更改
		Tab: Goods,
	},
	{
		name: '医耗套包',
		key: '2',
		permissions: 'consume_history_list', //暂无相关权限，这里用已存在权限暂时替代下，以方便看到页面，权限更新后更改
		Tab: Ordinary,
	},
];

const config = ['', ''];

const Tab = ({ ...props }) => {
	const tabsData = useGoodsType({ goodsValue: '1', ordinaryValue: '2' });
	const tabsKeys = (tabsData || []).map((item) => item.value);
	const tabs = tabsList.filter((item: Record<string, any>) => tabsKeys.includes(item.key));

	return (
		<TabsMax
			tabsList={tabs}
			config={config}
			match={props.match}
		/>
	);
};

export default Tab;
