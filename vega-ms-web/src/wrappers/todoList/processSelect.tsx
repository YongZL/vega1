import MenuSelectModal from '@/components/MenuSelectModal';
import useMenuSelectModal from '@/hooks/useMenuSelectModal';
import type { ConnectState } from '@/models/connect';
import { FC, useState } from 'react';
import { connect } from 'umi';
// 加工组包todo弹窗
const processSelect: FC<{ todoList: ConnectState['todoList'] }> = ({ children, todoList }) => {
	const [visible, setVisible] = useState<boolean>(true);
	const { status, sum } = useMenuSelectModal({
		status: [
			{
				text: '待生成配货单',
				value: 'operate_pending',
				key: 'processing_order_pick_pending',
				num: 0,
			},
			{ text: '待配货', value: 'pick_pending', key: 'process_list', num: 0 },
			{ text: '待加工', value: 'process_pending', key: 'processing_order_process_pending', num: 0 },
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
					titleKey='process'
				/>
			)}
		</>
	);
};

export default connect(({ todoList }: ConnectState) => ({
	todoList,
}))(processSelect);
