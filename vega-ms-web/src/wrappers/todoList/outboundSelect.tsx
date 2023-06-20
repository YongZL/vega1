import MenuSelectModal from '@/components/MenuSelectModal';
import useMenuSelectModal from '@/hooks/useMenuSelectModal';
import type { ConnectState } from '@/models/connect';
import { FC, useState } from 'react';
import { connect } from 'umi';
// 出库处理todo弹窗
const outboundSelect: FC<{ todoList: ConnectState['todoList'] }> = ({ children, todoList }) => {
	const [visible, setVisible] = useState<boolean>(true);
	const { status, tabs, sum } = useMenuSelectModal({
		tabs: [
			{
				text: '配货提示',
				value: '1',
				num: 0,
				permissions: 'pick_pending',
			},
			{
				text: '配货',
				value: '2',
				num: 0,
				permissions: 'pick_order',
			},
			{
				text: '推送',
				value: '3',
				num: 0,
				permissions: 'delivery_order',
			},
		],
		status: {
			1: [
				{
					text: '配货提示',
					value: 'generate_pick_order_pending',
					key: 'pick_pending_generate_pick_order_pending',
					num: 0,
				},
			],
			2: [
				{ text: '待配货', value: 'pick_pending', key: 'pick_order_pick_pending', num: 0 },
				{ text: '配货中', value: 'picking', key: 'pick_order_list', num: 0 },
			],
			3: [{ text: '待复核', value: 'check_pending', key: 'delivery_order_check_pending', num: 0 }],
		},
		todoList,
	});

	return (
		<>
			{children}
			{visible && sum > 0 && (
				<MenuSelectModal
					onFinish={() => setVisible(false)}
					status={status}
					tabs={tabs}
					defaultActiveKey={tabs && tabs[0].value}
					sum={sum}
					titleKey='outbound_handle'
				/>
			)}
		</>
	);
};

export default connect(({ todoList }: ConnectState) => ({
	todoList,
}))(outboundSelect);
