import MenuSelectModal from '@/components/MenuSelectModal';
import useMenuSelectModal from '@/hooks/useMenuSelectModal';
import type { ConnectState } from '@/models/connect';
import { FC, useState } from 'react';
import { connect } from 'umi';
// 医嘱管理todo弹窗
const medicalAdviceSelect: FC<{ todoList: ConnectState['todoList'] }> = ({
	children,
	todoList,
}) => {
	const [visible, setVisible] = useState<boolean>(true);
	const { status, sum } = useMenuSelectModal({
		status: [
			{
				text: '未消耗',
				value: 'not_consumed',
				key: 'department_medical_advice_scan',
				num: 0,
			},
			{
				text: '部分消耗',
				value: 'partly_consumed',
				key: 'department_medical_advice_view',
				num: 0,
			},
			{
				text: '未退货',
				value: 'not_returned',
				key: 'department_medical_advice_return',
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
					titleKey='department_medical_advice_list'
				/>
			)}
		</>
	);
};

export default connect(({ todoList }: ConnectState) => ({
	todoList,
}))(medicalAdviceSelect);
