import TableBox from '@/components/TableBox';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { Descriptions, Modal, Statistic } from 'antd';
import moment from 'moment';
import { useEffect } from 'react';
import { connect, useModel } from 'umi';
import { DetailType } from '../index';

const DetailModal = ({ loading, costCentral, dispatch, ...props }) => {
	const { modalVisible, setModalVisible, type, singleCostInfo, setType } = props;
	const { detailList } = costCentral;
	const { fields } = useModel('fieldsMapping');

	useEffect(() => {
		if (modalVisible) {
			fetchDetailList();
		}
	}, [type]);

	const fetchDetailList = () => {
		dispatch({
			type: 'costCentral/queryCostCentralDetail',
			payload: {
				goodsId: singleCostInfo.goodsId,
				periodId: singleCostInfo.periodId,
				departmentId: singleCostInfo.departmentId,
				price: singleCostInfo.price,
				type: type,
			},
		});
	};

	const columnsModal = [
		{
			title: '日期',
			dataIndex: 'dateConsumed',
			key: 'dateConsumed',
			width: 80,
			render: (text) => {
				return <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>;
			},
		},
		{
			title: '科室消耗数量',
			dataIndex: 'internalQuantity',
			key: 'internalQuantity',
			width: 120,
		},
		{
			title: '外部科室',
			dataIndex: 'externalDepartmentName',
			key: 'externalDepartmentName',
			width: 150,
			ellipsis: true,
			render: (text) => {
				return <span>{text || '-'}</span>;
			},
		},
		{
			title: '外部消耗数量',
			dataIndex: 'externalQuantity',
			key: 'externalQuantity',
			ellipsis: true,
			width: 120,
		},
		{
			title: '分摊科室',
			dataIndex: 'sharedDepartmentName',
			key: 'sharedDepartmentName',
			width: 150,
			render: (text) => {
				return <span>{text || '-'}</span>;
			},
		},
		{
			title: '分摊消耗数量',
			dataIndex: 'sharedQuantity',
			key: 'sharedQuantity',
			width: 120,
		},
		{
			title: '成本(元)',
			dataIndex: 'price',
			key: 'price',
			width: 110,
			align: 'right',
			render: (text, record) => {
				return (
					<span>
						{convertPriceWithDecimal(
							record.price *
								(record.externalQuantity + record.internalQuantity + record.sharedQuantity),
						)}
					</span>
				);
			},
		},
	];

	const internalColumns = [
		{
			title: '时间',
			dataIndex: 'timeConsumed',
			key: 'timeConsumed',
			width: 80,
			render: (text) => {
				return <span>{text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'}</span>;
			},
		},
		{
			title: '科室消耗数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
		},
		{
			title: '成本(元)',
			dataIndex: 'price',
			key: 'price',
			width: 110,
			align: 'right',
			render: (text, record) => {
				return <span>{convertPriceWithDecimal(record.price * record.quantity)}</span>;
			},
		},
	];
	const externalColumns = [
		{
			title: '时间',
			dataIndex: 'timeConsumed',
			key: 'timeConsumed',
			width: 80,
			render: (text) => {
				return <span>{text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'}</span>;
			},
		},
		{
			title: '外部来源',
			dataIndex: 'incomeDepartmentName',
			key: 'incomeDepartmentName',
			width: 120,
			render: (text) => {
				return <span>{text || '-'}</span>;
			},
		},
		{
			title: '外部消耗数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
		},
		{
			title: '成本(元)',
			dataIndex: 'price',
			key: 'price',
			width: 110,
			align: 'right',
			render: (text, record) => {
				return <span>{convertPriceWithDecimal(record.price * record.quantity)}</span>;
			},
		},
	];
	const shareColumns = [
		{
			title: '时间',
			dataIndex: 'timeConsumed',
			key: 'timeConsumed',
			width: 80,
			render: (text) => {
				return <span>{text ? moment(text).format('YYYY/MM/DD HH:mm:ss') : '-'}</span>;
			},
		},
		{
			title: '分摊来源',
			dataIndex: 'incomeDepartmentName',
			key: 'incomeDepartmentName',
			width: 120,
			render: (text) => {
				return <span>{text || '-'}</span>;
			},
		},
		{
			title: '分摊消耗数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
		},
		{
			title: '成本(元)',
			dataIndex: 'price',
			key: 'price',
			width: 110,
			align: 'right',
			render: (text, record) => {
				return <span>{convertPriceWithDecimal(record.price * record.quantity)}</span>;
			},
		},
	];

	const modal = {
		title:
			type === DetailType.all
				? '查看明细'
				: type === DetailType.internal
				? '科室消耗明细'
				: type === DetailType.external
				? '外部消耗明细'
				: '分摊消耗明细',
		visible: modalVisible,
		maskClosable: false,
		onCancel: () => {
			setModalVisible(false);
			setType(undefined);
		},
		width: '80%',
		footer: false,
		destroyOnClose: true,
	};
	const tableColums =
		type === DetailType.all
			? columnsModal
			: type === DetailType.internal
			? internalColumns
			: type === DetailType.external
			? externalColumns
			: shareColumns;
	return (
		<Modal
			{...modal}
			className='modalDetails'>
			<div className='modelInfo'>
				<div className='left'>
					<Descriptions
						column={{ xs: 1, sm: 2, lg: 3 }}
						size='small'>
						<Descriptions.Item label={fields.goodsCode}>
							{singleCostInfo.materialCode || '-'}
						</Descriptions.Item>
						<Descriptions.Item label={fields.goodsName}>
							{singleCostInfo.goodsName || '-'}
						</Descriptions.Item>
						<Descriptions.Item label='规格/型号'>
							{formatStrConnect(singleCostInfo, ['specification', 'model'])}
						</Descriptions.Item>
						<Descriptions.Item label='单价(元)'>
							{convertPriceWithDecimal(singleCostInfo.price) || '-'}
						</Descriptions.Item>
						<Descriptions.Item label='生产厂家'>
							{singleCostInfo.manufacturerName || '-'}
						</Descriptions.Item>
						<Descriptions.Item label={`一级${fields.distributor}`}>
							{singleCostInfo.custodianId === 1 ? '-' : singleCostInfo.custodianName}
						</Descriptions.Item>
						<Descriptions.Item label='结算周期'>
							{' '}
							{moment(Number(singleCostInfo.timeFrom)).format('YYYY/MM/DD')} ～
							{moment(Number(singleCostInfo.timeTo)).format('YYYY/MM/DD')}
						</Descriptions.Item>
					</Descriptions>
				</div>
				<div className='right'>
					<Statistic
						title='科室'
						value={singleCostInfo.departmentName || '-'}
					/>
					<Statistic
						title='总金额(元)'
						value={
							type === DetailType.all
								? convertPriceWithDecimal(
										detailList.reduce(
											(acc, cur) =>
												acc +
												cur.price *
													(cur.internalQuantity + cur.externalQuantity + cur.sharedQuantity),
											0,
										),
								  )
								: convertPriceWithDecimal(
										detailList.reduce((acc, cur) => acc + cur.price * cur.quantity, 0),
								  )
						}
					/>
				</div>
			</div>
			<TableBox
				columns={tableColums}
				rowKey={(record, index) => {
					return index;
				}}
				dataSource={detailList}
				className='mb2'
				options={{ density: false, fullScreen: false, setting: false }}
				scroll={{ x: '100%', y: 300 }}
				pagination={false}
				tableInfoId='186'
				loading={loading}
				size='small'
			/>
		</Modal>
	);
};

export default connect(
	({
		loading,
		costCentral,
	}: {
		costCentral: any;
		loading: { effects: { [key: string]: boolean } };
	}) => ({
		costCentral,
		loading: loading.effects['costCentral/queryCostCentralDetail'],
	}),
)(DetailModal);
