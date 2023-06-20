import MenuSelectModal from '@/components/MenuSelectModal';
import useMenuSelectModal from '@/hooks/useMenuSelectModal';
import type { ConnectState } from '@/models/connect';
import { FC, useState } from 'react';
import { connect } from 'umi';
// 退货处理todo弹窗
const returnProcessingSelect: FC<{ todoList: ConnectState['todoList'] }> = ({
	children,
	todoList,
}) => {
	const [visible, setVisible] = useState<boolean>(true);
	const { status, tabs, sum } = useMenuSelectModal({
		tabs: [
			{
				text: '中心仓库退货',
				value: '1',
				num: 0,
				permissions: 'return_goods',
			},
			{
				text: '科室退货',
				value: '2',
				num: 0,
				permissions: 'department_return_goods',
			},
		],
		status: {
			1: [
				{
					text: '待审核',
					value: 'pending_approve',
					key: 'return_goods_pending_approve_central',
					num: 0,
				},
				{
					text: '等待退货',
					value: 'pending_return',
					key: 'return_goods_pending_confirm_central',
					num: 0,
				},
			],
			2: [
				{
					text: '待审核',
					value: 'pending_approve',
					key: 'return_goods_pending_approve_department',
					num: 0,
				},
				{
					text: '等待退货',
					value: 'pending_return',
					key: 'return_goods_pending_confirm_department',
					num: 0,
				},
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
					titleKey='return_processing'
				/>
			)}
		</>
	);
};

export default connect(({ todoList }: ConnectState) => ({
	todoList,
}))(returnProcessingSelect);
