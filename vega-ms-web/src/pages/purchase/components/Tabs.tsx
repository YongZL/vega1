import { useMemo } from 'react';
import TabsMax from '@/components/TabsMax';
import PurchasePlanList from '../planList';
import PurchaseOrder from '../orderList';
import DeliveryList from '../deliveryList';

const Tabs = ({ match, pageType }: Record<string, any>) => {
	const tabsList = useMemo(
		() => [
			{
				name: '采购申请',
				key: '1',
				pageType,
				permissions: pageType === 'query' ? 'purchase_plan' : 'handled_purchase_plan',
				Tab: PurchasePlanList,
			},
			{
				name: '采购订单',
				key: '2',
				pageType,
				permissions: pageType === 'query' ? 'purchase_order' : 'handled_purchase_order',
				Tab: PurchaseOrder,
			},
			{
				name: '配送清单',
				key: '3',
				pageType,
				permissions: pageType === 'query' ? 'shipping_order' : 'handled_shipping_order',
				Tab: DeliveryList,
			},
		],
		[pageType],
	);

	const config = ['', ''];

	return (
		<TabsMax
			tabsList={tabsList}
			config={config}
			match={match}
		/>
	);
};

export default Tabs;
