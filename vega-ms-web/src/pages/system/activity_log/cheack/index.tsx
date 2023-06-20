import ProTable from '@/components/ProTable';
import type { ProColumns } from '@/components/ProTable/typings';
import { getHistory } from '@/services/audit';
import { Modal } from 'antd';
import moment from 'moment';
import { cloneElement, FC, useEffect, useState } from 'react';

interface Props {
	trigger: JSX.Element;
	detail?: Audit.QueryRulelist;
}
const CheckModal: FC<Props> = ({ trigger, detail }) => {
	const [goodsData, setGoodsData] = useState<Audit.QuerygetHistory[]>([]);
	const [createModalVisible, handleModalVisible] = useState<boolean>(false);
	useEffect(() => {
		const getDetail = async (record: Audit.QueryRulelist) => {
			let res = await getHistory({
				target: record.operateTarget,
				key: record.key,
			});
			if (res && res.code === 0) {
				setGoodsData(res.data);
			}
		};
		if (detail?.key && detail?.operateTarget) {
			getDetail(detail);
		}
	}, [detail]);
	const handleCancel = () => {
		handleModalVisible(false);
	};
	const goodsColumns: ProColumns<Audit.QueryRulelist>[] = [
		{
			title: '用户名',
			dataIndex: 'userName',
			key: 'userName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '操作内容',
			dataIndex: 'activity',
			key: 'activity',
			ellipsis: true,
		},
		{
			title: '操作时间',
			dataIndex: 'occurredTime',
			key: 'occurredTime',
			width: 160,
			render: (text) => {
				return (
					<span>{text ? moment(new Date(text as number)).format('YYYY/MM/DD HH:mm:ss') : ''}</span>
				);
			},
		},
		{
			title: '操作对象',
			dataIndex: 'operateTargetCh',
			key: 'operateTargetCh',
			width: 120,
		},
		{
			title: '操作类型',
			dataIndex: 'operateTypeCh',
			key: 'operateTypeCh',
			width: 100,
		},
	];

	return (
		<>
			{cloneElement(trigger, {
				onClick: () => {
					handleModalVisible(true);
				},
			})}
			<div>
				<Modal
					visible={createModalVisible}
					width={'80%'}
					maskClosable={false}
					title='操作记录详情'
					onCancel={handleCancel}
					footer={false}
					className='ant-detail-modal'>
					<ProTable
						size='middle'
						pagination={false}
						rowKey='id'
						columns={goodsColumns as Record<string, any>[]}
						dataSource={goodsData}
						scroll={{
							x: '100%',
							y: 300,
						}}
						options={{ density: false, fullScreen: false, setting: false }}
					/>
				</Modal>
			</div>
		</>
	);
};
export default CheckModal;
