import MenuSelectModal from '@/components/MenuSelectModal';
import useMenuSelectModal from '@/hooks/useMenuSelectModal';
import type { ConnectState } from '@/models/connect';
import { FC, useState } from 'react';
import { connect } from 'umi';
// 入库处理todo弹窗、也叫科室验收
const inboundProcessingSelect: FC<{ todoList: ConnectState['todoList'] }> = ({
	children,
	todoList,
}) => {
	const [visible, setVisible] = useState<boolean>(true);
	const { status, sum } = useMenuSelectModal({
		status: [
			{
				text: '待验收',
				value: 'pending',
				key: 'warehousing_handle_pending',
				num: 0,
			},
			{
				text: '验收中',
				value: 'receiving',
				key: 'warehousing_handle_receiving',
				num: 0,
			},
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
					titleKey='Inbound_processing'
				/>
			)}
		</>
	);
};

export default connect(({ todoList }: ConnectState) => ({
	todoList,
}))(inboundProcessingSelect);
