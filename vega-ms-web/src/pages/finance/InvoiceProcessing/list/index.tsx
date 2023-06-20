import { useMemo } from 'react';
import TabsMax from '@/components/TabsMax';
import FreightTicket from './components/FreightTicket';
import SettlementAfterCancellation from './components/SettlementAfterCancellation';

const Tabs = ({ match, pageType }: Record<string, any>) => {
	const tabsList = useMemo(
		() => [
			{
				name: '货票同行',
				key: '1',
				pageType,
				// permissions: pageType === 'query' ? 'purchase_plan' : 'handled_purchase_plan',
				Tab: FreightTicket,
			},
			{
				name: '消耗结算',
				key: '2',
				pageType,
				// permissions: pageType === 'query' ? 'purchase_order' : 'handled_purchase_order',
				Tab: SettlementAfterCancellation,
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

export default ({ ...props }) => <Tabs match={props.match} />;
