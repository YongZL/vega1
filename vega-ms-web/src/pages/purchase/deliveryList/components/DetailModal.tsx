import { DescriptionsItemProps } from '@/components/Descriptions/typings';
import { ProColumns } from '@ant-design/pro-table/lib/typing';

import Descriptions from '@/components/Descriptions';
import ProTable from '@/components/ProTable';
import { shippingOrderStatusTextMap } from '@/constants/dictionary';
import { accessNameMap } from '@/utils';
import { getTotalNum } from '@/utils/calculate';
import { formatStrConnect, formatUnitNum } from '@/utils/format';
import { Button, Col, Modal, Row, Statistic } from 'antd';
import moment from 'moment';
import { connect, useModel } from 'umi';
import { taxRateTextMap } from '@/constants/dictionary';
import { convertPriceWithDecimal } from '@/utils/format';

const DetailModal = ({
	loading,
	modalVisible,
	setModalVisible,
	handleType,
	singleDeliveryInfo,
	delivery,
}: ShippingOrderController.DeliveryDetailProps) => {
	const { goodsGroupList } = delivery;
	const { fields } = useModel('fieldsMapping');
	const accessName = accessNameMap(); // 权限名称

	const columns: ProColumns<ShippingOrderController.DetailData>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text, record, index) => <span>{index + 1}</span>,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 180,
			ellipsis: true,
		},
		{
			title: 'UDI',
			dataIndex: 'udiCode',
			key: 'udiCode',
			width: 180,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 120,
			ellipsis: true,
			renderText: (text, record) => {
				return `${text || '-'}/${record.serialNo || '-'}`;
			},
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 120,
			renderText: (text: number) => (
				<span>{text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'}</span>
			),
		},
		{
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			width: 120,
			renderText: (text: number) => (
				<span>{text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'}</span>
			),
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 120,
			renderText: (text: number) => (
				<span>{text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'}</span>
			),
		},
		{
			title: '包装规格',
			dataIndex: 'unitNum',
			key: 'unitNum',
			width: 150,
			renderText: (text: number, record) => (
				<span>{formatUnitNum(text, record.minUnitName, record.purchaseUnitName)}</span>
			),
		},
		{
			title: '赋码单位',
			dataIndex: 'distributionUnitQuantity',
			key: 'distributionUnitQuantity',
			width: 150,
			renderText: (text: number, record) => (
				<span>{text ? text + record.minUnitName + '/' + record.distributionUnitName : '-'}</span>
			),
		},
		{
			title: '配送数量',
			dataIndex: 'quantityInMin',
			key: 'quantityInMin',
			width: 100,
			renderText: (text: number, record) => <span>{text + record.minUnitName}</span>,
		},
		{
			title: '产品注册证号',
			dataIndex: 'registrationNum',
			key: 'registrationNum',
			width: 150,
			ellipsis: true,
			renderText: (text: string) => <span>{text ? text : '-'}</span>,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 180,
			ellipsis: true,
		},
		{
			title: '验收通过数量',
			dataIndex: 'passedQuantity',
			key: 'passedQuantity',
			width: 120,
			renderText: (text: number, record) => <span>{text ? text + record.minUnitName : '-'}</span>,
		},
		{
			title: '验收不通过原因',
			dataIndex: 'acceptanceConclusion',
			key: 'acceptanceConclusion',
			width: 150,
			ellipsis: true,
			renderText: (text: string) => <span>{text || '-'}</span>,
		},
	];

	// 重构前已被删除的方法
	const orderComplete = () => {};

	const descriptionsOptions: DescriptionsItemProps[] = [
		{
			label: '配送单号',
			dataIndex: 'shippingOrderCode',
		},
		{
			label: fields.distributor,
			dataIndex: 'distributorName',
		},
		{
			label: '库房',
			dataIndex: 'storageAreaName',
		},
		{
			label: '预计验收日期',
			dataIndex: 'expectedDeliveryDate',
			render: (text: number) => (text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'),
		},
		{
			label: '配送人员',
			dataIndex: 'deliveryUserName',
		},
		{
			label: '联系电话',
			dataIndex: 'deliveryUserPhone',
		},
		{
			label: '发票编号',
			dataIndex: 'invoiceCode',
		},
		{
			label: '发票代码',
			dataIndex: 'invoiceNo',
		},
		{
			label: '开票日期',
			dataIndex: 'invoicingDate',
			render: (text: number) => (text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'),
		},
		{
			label: '税 率',
			dataIndex: 'taxRate',
			render: (text: number) => (text || text === 0 ? taxRateTextMap[text] : '-'),
		},
		{
			label: '发票金额',
			dataIndex: 'invoiceAmount',
			render: (text: number) => (text || text == 0 ? convertPriceWithDecimal(text) + ' 元' : '-'),
		},
		{
			label: '备注信息',
			dataIndex: 'expressNo',
		},
		{
			label: '两定平台订单',
			dataIndex: 'ambivalentPlatformOrder',
			show: sessionStorage.getItem('hospital_id') === '107' && WEB_PLATFORM === 'MS',
			render: (text) => (text ? '是' : '否'),
		},
	];

	return (
		<Modal
			title={accessName['handled_shipping_order_view']}
			visible={modalVisible}
			maskClosable={false}
			onCancel={() => setModalVisible(false)}
			footer={
				handleType == 'complete' ? (
					<Button
						type='primary'
						className='modalButton'
						onClick={orderComplete}
						loading={loading}>
						确认送达
					</Button>
				) : null
			}
			className='ant-detail-modal'>
			<Row className='detailsBorderAndMargin four'>
				<Col className='left'>
					<Descriptions
						options={descriptionsOptions}
						data={singleDeliveryInfo}
						optionEmptyText='-'
						defaultColumn={3}
						minColumn={2}
					/>
				</Col>
				<Col className='right'>
					<Statistic
						title='配送总数'
						value={getTotalNum(
							goodsGroupList,
							handleType === 'view' ? 'quantityInMin' : 'goodsQuantity',
						)}
					/>
					<Statistic
						title='当前状态'
						value={shippingOrderStatusTextMap[singleDeliveryInfo.combinedStatus] || ''}
					/>
				</Col>
			</Row>

			<ProTable
				columns={columns}
				rowKey={(record, index?: number) => `${index}`}
				options={{ density: false, fullScreen: false, setting: false }}
				dataSource={goodsGroupList}
				className='mb4'
				scroll={{ y: 300 }}
				loading={loading}
				size='small'
			/>
		</Modal>
	);
};

export default connect(
	({
		loading,
		delivery,
	}: {
		delivery: ShippingOrderController.DeliveryDataType;
		loading: { effects: { [key: string]: boolean } };
	}) => ({
		delivery,
		loading: loading.effects['delivery/queryDeliveryDetail'],
	}),
)(DetailModal);
