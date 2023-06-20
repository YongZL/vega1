import MenuSelectModal from '@/components/MenuSelectModal';
import useMenuSelectModal from '@/hooks/useMenuSelectModal';
import type { ConnectState } from '@/models/connect';
import { FC, useState } from 'react';
import { connect } from 'umi';
// 入库申请todo弹窗、也叫科室申请
const warehousingApplySelect: FC<{ todoList: ConnectState['todoList'] }> = ({
	children,
	todoList,
}) => {
	const [visible, setVisible] = useState<boolean>(true);
	const { status, sum } = useMenuSelectModal({
		status: [
			{
				text: '待审核',
				value: 'approval_pending',
				key: 'warehousing_apply_approval',
				num: 0,
			},
			{
				text: '待复核',
				value: 'approval_review_pending',
				key: 'goods_request_review_pending',
				num: 0,
			},
			{ text: '撤回', value: 'withdraw', key: 'warehousing_apply_withdraw', num: 0 },
			{ text: '采购中', value: 'purchasing', key: 'warehousing_apply_purchasing', num: 0 },
			{ text: '配送中', value: 'in_delivery', key: 'warehousing_apply_in_delivery', num: 0 },
		],
		todoList,
	});

	return (
		<>
			{children}
			{visible && sum > 0 && (
				<MenuSelectModal
					onFinish={() => setVisible(false)}
					status={status}
					sum={sum}
					titleKey='warehousing_apply'
				/>
			)}
		</>
	);
};

export default connect(({ todoList }: ConnectState) => ({
	todoList,
}))(warehousingApplySelect);
