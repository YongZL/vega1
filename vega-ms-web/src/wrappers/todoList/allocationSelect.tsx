import MenuSelectModal from '@/components/MenuSelectModal';
import useMenuSelectModal from '@/hooks/useMenuSelectModal';
import type { ConnectState } from '@/models/connect';
import { FC, useState } from 'react';
import { connect } from 'umi';
// 调拨处理todo弹窗
const allocationSelect: FC<{ todoList: ConnectState['todoList'] }> = ({ children, todoList }) => {
	const [visible, setVisible] = useState<boolean>(true);
	const { status, sum } = useMenuSelectModal({
		status: [{ text: '待入库', value: '3', key: 'reallocate_pending', num: 0 }],
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
					titleKey='allocation_handle'
				/>
			)}
		</>
	);
};

export default connect(({ todoList }: ConnectState) => ({
	todoList,
}))(allocationSelect);
