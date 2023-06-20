import TabMax from '@/components/TabsMax';
import ReturnPurchase_center from '@/pages/repository/return_purchase/components/ReturnPurchase_center';
import ReturnPurchase_department from '@/pages/repository/return_purchase/components/ReturnPurchase_department';

const tabsList = [
	{
		name: '中心仓库退货',
		key: '1',
		pageType: 'handle',
		permissions: 'return_goods_list',
		Tab: ReturnPurchase_center,
	},
	{
		name: '科室退货',
		key: '2',
		pageType: 'handle',
		permissions: 'department_return_goods_list',
		Tab: ReturnPurchase_department,
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
