import TabsMax from '@/components/TabsMax';
import NoRelate from '@/pages/base_data/departmentRelate/noRelate/list';
import Relate from '@/pages/base_data/departmentRelate/relate/list';

const tabsList = [
	{
		name: '未对照',
		key: '1',
		permissions: 'relate_department',
		Tab: NoRelate,
	},
	{
		name: '已对照',
		key: '2',
		permissions: 'relate_department',
		Tab: Relate,
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
