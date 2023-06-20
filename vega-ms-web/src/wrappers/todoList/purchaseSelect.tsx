import MenuSelectModal from '@/components/MenuSelectModal';
import useMenuSelectModal from '@/hooks/useMenuSelectModal';
import type { ConnectState } from '@/models/connect';
import { FC, useState } from 'react';
import { connect } from 'umi';
// 采购处理todo弹窗
const purchaseSelect: FC<{ todoList: ConnectState['todoList'] }> = ({ children, todoList }) => {
	const [visible, setVisible] = useState<boolean>(true);
	const { status, tabs, sum } = useMenuSelectModal({
		tabs: [
			{
				text: '采购申请',
				value: '1',
				num: 0,
				permissions: 'handled_purchase_plan',
			},
			{
				text: '采购订单',
				value: '2',
				num: 0,
				permissions: 'handled_purchase_order',
			},
		],
		status: {
			1: [
				{ text: '待提交', value: 'commit_pending', key: 'commit_purchase_plan_pending', num: 0 },
				{ text: '待审核', value: 'approval_pending', key: 'plan_approval_pending', num: 0 },
				{ text: '审核通过', value: 'approval_success', key: 'plan_to_order', num: 0 },
			],
			2: [
				{
					text: '待接收',
					value: 'receive_pending',
					key: 'handled_distributor_accept_order',
					num: 0,
				},
				{ text: '已接收', value: 'received', key: 'handled_distributor_order', num: 0 },
				{ text: '配送中', value: 'delivering', key: 'handled_distributor_make', num: 0 },
			],
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
					titleKey='purchase_handle'
				/>
			)}
		</>
	);
};

export default connect(({ todoList }: ConnectState) => ({
	todoList,
}))(purchaseSelect);
