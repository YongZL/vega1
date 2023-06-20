import TabsMax from '@/components/TabsMax';
import Warehouse from '../warehouse/list';
import GoodShelves from '../goodShelves/list';
const tabsList = [
	{
		name: '库房',
		key: '1',
		pageType: 'handle',
		permissions: 'warehouse_house',
		Tab: Warehouse,
	},
	{
		name: '货架',
		key: '2',
		pageType: 'handle',
		permissions: 'goods_shelves',
		Tab: GoodShelves,
	},
];
const config = ['', ''];
const Tab = ({ ...props }) => {
	return (
		<TabsMax
			tabsList={tabsList}
			config={config}
			match={props.match}
		/>
	);
};

export default Tab;
