import TabMax from '@/components/TabsMax';
import return_purchase_department from '@/pages/department/return_purchase_department/list';
import return_purchase from '@/pages/repository/return_purchase/list';

const tabsList = [
	{
		name: '中心仓库退货',
		key: '1',
		pageType: 'query',
		permissions: 'central_return_query',
		Tab: return_purchase,
	},
	{
		name: '科室退货',
		key: '2',
		pageType: 'query',
		permissions: 'department_return_query',
		Tab: return_purchase_department,
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
