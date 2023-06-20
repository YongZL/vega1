import type { ProColumns } from '@/components//ProTable/typings';
import type { DescriptionsItemProps } from '@/components/Descriptions';
import Descriptions from '@/components/Descriptions';
import ProTable from '@/components/ProTable';
import { processListStatusTextMap, processListTypeTextMap } from '@/constants/dictionary';
import { getDetail } from '@/services/processingOrder';
import { accessNameMap } from '@/utils';
import '@ant-design/compatible/assets/index.css';
import { Col, Form, Modal, Row, Statistic } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
export interface UpdateProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	orderInfo: ProcessingOrderController.GetListRecord;
}

const DetailModal: React.FC<UpdateProps> = (props) => {
	const [list, setList] = useState<ProcessingOrderController.GetDetailDetails[]>([]);
	const [detail, setDetail] = useState<ProcessingOrderController.GetDetailOrder>({});
	const [loading, setLoading] = useState(false);
	const accessName = accessNameMap(); // 权限名称
	const [form] = Form.useForm();

	const { isOpen, orderInfo, setIsOpen } = props;

	// 弹窗详情
	const getDetailInfo = async () => {
		setLoading(true);
		const res = await getDetail({ processingOrderId: orderInfo.id! });
		if (res && res.code === 0) {
			setList(res.data.details);
			setDetail(res.data.order);
		}
		setLoading(false);
	};

	const columns: ProColumns<ProcessingOrderController.GetDetailDetails>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			renderText: (_text, _record, index) => index + 1,
		},
		{
			title: '医耗套包名称',
			dataIndex: 'ordinaryName',
			key: 'ordinaryName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '医耗套包说明',
			dataIndex: 'ordinaryDetailGoodsMessage',
			key: 'ordinaryDetailGoodsMessage',
			width: 200,
			render: (_text, record) => (
				<div
					className='detailGoodsMessage'
					title={record.description ? record.description : record.ordinaryDetailGoodsMessage}>
					{record.description ? record.description : record.ordinaryDetailGoodsMessage}
				</div>
			),
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			renderText: (text) => `${text}包`,
		},
	];

	useEffect(() => {
		if (isOpen) {
			getDetailInfo();
		}
	}, [isOpen]);
	const options: DescriptionsItemProps<ProcessingOrderController.GetDetailOrder>[] = [
		{
			dataIndex: 'code',
			label: '加工单号',
		},
		{
			dataIndex: 'type',
			label: '来源',
			render: () => processListTypeTextMap[detail.type!] || '-',
		},
		{
			dataIndex: 'createdName',
			label: '创建人员',
		},
		{
			dataIndex: 'timeCreated',
			label: '创建时间',
			render: () =>
				detail.timeCreated
					? moment(new Date(detail.timeCreated)).format('YYYY/MM/DD HH:mm:ss')
					: '-',
		},
		{
			dataIndex: 'storageAreaName',
			label: '库房',
		},
		{
			dataIndex: 'warehouseName',
			label: '仓库',
		},
		{
			dataIndex: 'workbenchName',
			label: '加工台',
		},
	];
	return (
		<Form form={form}>
			<Modal
				destroyOnClose
				maskClosable={false}
				visible={isOpen}
				title={accessName['process_view']}
				onCancel={() => setIsOpen(false)}
				footer={null}
				className='ant-detail-modal'>
				<Row className='detailsBorderAndMargin four'>
					<Col className='left'>
						<Descriptions<ProcessingOrderController.GetDetailOrder>
							options={options}
							data={detail}
							optionEmptyText='-'
							defaultColumn={3}
							minColumn={2}
						/>
					</Col>
					<Col className='right'>
						<Statistic
							title='类型'
							value={orderInfo.category === 'package_bulk' ? '定数包' : '医耗套包'}
						/>
						<Statistic
							title='当前状态'
							value={processListStatusTextMap[detail.status!] || '-'}
						/>
					</Col>
				</Row>
				<ProTable<ProcessingOrderController.GetDetailDetails>
					loading={loading}
					// tableInfoId="145"
					columns={columns}
					rowKey='id'
					dataSource={list}
					options={{ density: false, fullScreen: false, setting: false }}
					scroll={{ x: '100%', y: 300 }}
					pagination={false}
				/>
			</Modal>
		</Form>
	);
};

export default DetailModal;
