import MenuSelectModal from '@/components/MenuSelectModal';
import useMenuSelectModal from '@/hooks/useMenuSelectModal';
import type { ConnectState } from '@/models/connect';
import { FC, useState } from 'react';
import { connect } from 'umi';
// 验收处理todo弹窗
const receivingSelect: FC<{ todoList: ConnectState['todoList'] }> = ({ children, todoList }) => {
	const [visible, setVisible] = useState<boolean>(true);
	const { status, sum } = useMenuSelectModal({
		status: [
			{ text: '待验收', value: 'pending', key: 'shipping_order_todo_check', num: 0 },
			{ text: '验收中', value: 'receiving', key: 'receiving_order_view', num: 0 },
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
					titleKey='receiving_order'
				/>
			)}
		</>
	);
};

export default connect(({ todoList }: ConnectState) => ({
	todoList,
}))(receivingSelect);
