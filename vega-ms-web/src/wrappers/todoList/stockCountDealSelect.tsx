import MenuSelectModal from '@/components/MenuSelectModal';
import useMenuSelectModal from '@/hooks/useMenuSelectModal';
import type { ConnectState } from '@/models/connect';
import { FC, useState } from 'react';
import { connect } from 'umi';
// 盘点处理todo弹窗
const stockCountDealSelect: FC<{ todoList: ConnectState['todoList'] }> = ({
	children,
	todoList,
}) => {
	const [visible, setVisible] = useState<boolean>(true);
	const { status, sum } = useMenuSelectModal({
		status: [
			{
				text: '待盘库',
				value: 'stock_taking_pending',
				key: 'stock_count_deal',
				num: 0,
			},
			{
				text: '盘库中',
				value: 'stock_taking',
				key: 'stock_count_query',
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
					titleKey='stock_count_deal'
				/>
			)}
		</>
	);
};

export default connect(({ todoList }: ConnectState) => ({
	todoList,
}))(stockCountDealSelect);
