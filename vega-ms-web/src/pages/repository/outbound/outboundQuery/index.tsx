import TabsMax from '@/components/TabsMax';
import PickList from '../components/PickList';
import Push from '../components/Push';

const tabsList = [
	{
		name: '配货',
		key: '2',
		pageType: 'query',
		permissions: 'delivery_order_query_list',
		Tab: PickList,
	},
	{
		name: '推送',
		key: '3',
		pageType: 'query',
		permissions: 'push_goods_list',
		Tab: Push,
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
