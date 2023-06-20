import TabMax from '@/components/TabsMax';
import RelateFalse from './components/RelateFalse';
import RelateTrue from './components/RelateTrue';

const tabsList = [
	{
		name: '未对照',
		key: '1',
		permissions: 'relate_goods_list',
		Tab: RelateFalse,
	},
	{
		name: '已对照',
		key: '2',
		permissions: 'relate_goods_list',
		Tab: RelateTrue,
	},
];

const config = ['', ''];

const Tab = ({ ...props }) => {
	return (
		<TabMax
			tabsList={tabsList}
			config={config}
			match={props.match}
		/>
	);
};

export default Tab;
