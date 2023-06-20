import { FC, useState, MutableRefObject } from 'react';
import { Button, Modal } from 'antd';
import { useModel } from 'umi';
import ProTable, { ProColumns, ProTableAction } from '@/components/ProTable';
import { setBatchEnable, setEnable } from '@/services/distributor';
import { notification } from '@/utils/ui';

export type DisabledModalPropsType = 'single' | 'batch';

export type DisabledModalProps = {
	visible: boolean; // 是否显示弹窗
	type: DisabledModalPropsType; // 单个或者是批量
	distributorIds: number[]; // 要禁用的配送商业 id 数组
	list: any[]; // 显示的数据源
	tableRef: MutableRefObject<ProTableAction | undefined>;
	onCancel: (bool: boolean) => void;
};

const DisabledModal: FC<DisabledModalProps> = ({
	visible,
	list,
	tableRef,
	type,
	distributorIds,
	onCancel,
}) => {
	const { fields } = useModel('fieldsMapping');

	const [loading, setLoading] = useState(false);

	// 关闭弹窗
	const modalCancel = (update: boolean) => {
		if (update) {
			tableRef.current?.reload();
		}
		if (onCancel) {
			onCancel(update);
		}
	};

	// 确认操作
	const confirmOption = async () => {
		setLoading(true);
		let res = null;
		if (type === 'single') {
			const params = {
				id: distributorIds[0],
				type: 2,
			};
			res = await setEnable(params);
		} else {
			res = await setBatchEnable(2, { ids: distributorIds });
		}

		if (res.code === 0) {
			notification.success('操作成功！');
			modalCancel(true);
		}

		setLoading(false);
	};

	const columns: ProColumns<any>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 'XXXS',
			align: 'center',
			render: (text, record, index) => index + 1,
		},

		{
			title: `${fields.distributor}名称`,
			dataIndex: 'companyName',
			key: 'companyName',
			width: 'XS',
			ellipsis: true,
		},
	];

	return (
		<Modal
			destroyOnClose
			maskClosable={false}
			visible={visible}
			title={fields.distributor + '禁用确认'}
			onCancel={() => modalCancel(false)}
			footer={[
				<Button
					key='back'
					onClick={() => modalCancel(false)}>
					取消
				</Button>,
				<Button
					type='primary'
					disabled={loading}
					loading={loading}
					onClick={confirmOption}>
					确认操作
				</Button>,
			]}>
			<ProTable<any>
				rowKey='id'
				columns={columns}
				headerTitle={`以下${fields.distributor}存在已启用的被授权关系，请核对！`}
				dataSource={list}
				pagination={{
					defaultCurrent: 1,
					pageSize: 20,
					total: list.length,
				}}
				scroll={{
					y: 300,
				}}
			/>
		</Modal>
	);
};

export default DisabledModal;
