import TabsMax from '@/components/TabsMax';
import InvoiceAudit from '../components/list/index';

const tabsList = [
	{
		name: '货票同行',
		key: '1',
		// permissions: 'consume_history_list', //暂无相关权限，这里用已存在权限暂时替代下，以方便看到页面，权限更新后更改
		Tab: InvoiceAudit,
		pageType: 'query',
	},
	{
		name: '消耗结算',
		key: '2',
		// permissions: 'consume_history_list', //暂无相关权限，这里用已存在权限暂时替代下，以方便看到页面，权限更新后更改
		Tab: InvoiceAudit,
		pageType: 'query',
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
