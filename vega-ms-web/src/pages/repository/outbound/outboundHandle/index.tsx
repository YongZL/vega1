import TabsMax from '@/components/TabsMax';
import PickReady from '../components/PickReady';
import PickList from '../components/PickList';
import Push from '../components/Push';

const tabsList = [
	{
		name: '配货提示',
		key: '1',
		pageType: 'handle',
		permissions: 'pick_pending_list',
		Tab: PickReady,
	},
	{
		name: '配货',
		key: '2',
		pageType: 'handle',
		permissions: 'pick_order_list',
		Tab: PickList,
	},
	{
		name: '推送',
		key: '3',
		pageType: 'handle',
		permissions: 'delivery_order_list',
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
