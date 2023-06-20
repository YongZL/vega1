import { DescriptionsItemProps } from '@/components/Descriptions/typings';
import { ProColumns } from '@/components/ProTable/typings';

import Descriptions from '@/components/Descriptions';
import ProTable from '@/components/ProTable';
import { taxRateTextMap, yesOrNo } from '@/constants/dictionary';
import { queryDetail, updateAmbivalentPlatformOrder } from '@/services/receivingOrder';
import { accessNameMap } from '@/utils';
import { getTotalNum } from '@/utils/calculate';
import { dealPackNum } from '@/utils/dataUtil';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { CheckOutlined, EditOutlined } from '@ant-design/icons';
import { Badge, Col, Modal, Row, Select, Statistic, Tooltip } from 'antd';
import moment from 'moment';
import QrCode from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';

type PropsType = {
	approvalStatus: Record<string, any>;
	detail: Partial<ReceivingOrderController.ListRecord>;
	onCancel: () => void;
	updateListData: (key: string, value: any) => void;
};
const DetailModal = ({ approvalStatus, detail = {}, onCancel, updateListData }: PropsType) => {
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [ambivalentValue, setAmbivalentValue] = useState<boolean>(false);
	const [showEditAmbivalent, setShowEditAmbivalent] = useState<boolean>(false);
	const [goodsData, setGoodsData] = useState<ReceivingOrderController.DetailGoodsList[]>([]);
	const [receivedList, setReceivedList] = useState<ReceivingOrderController.DetailGoodsList[]>([]);
	const accessName = accessNameMap(); // 权限名称

	// 两定平台订单修改
	const confirmEditAmbivalent = async () => {
		const params = {
			receivingOrderId: detail.receivingId,
			ambivalentPlatformOrder: ambivalentValue,
		};
		const res = await updateAmbivalentPlatformOrder(params);
		if (res.code === 0) {
			setShowEditAmbivalent(false);
			notification.success('修改成功');
			updateListData('ambivalentPlatformOrder', ambivalentValue);
		}
	};

	useEffect(() => {
		const getDetail = async (receivingOrderId: number) => {
			const res = await queryDetail({ receivingOrderId });
			if (res && res.code === 0) {
				const { receiving, received } = res.data;
				setGoodsData(receiving || []);
				setReceivedList(received || []);
			}
			setLoading(false);
		};
		if (detail.receivingId) {
			setLoading(true);
			getDetail(detail.receivingId);
			setAmbivalentValue(detail.ambivalentPlatformOrder ? true : false); // 初始化两定平台订单值
		}
	}, [detail]);

	const goodsColumns: ProColumns<ReceivingOrderController.DetailGoodsList>[] = [
		{
			title: '序号',
			dataIndex: 'materialCode',
			key: 'materialCode',
			align: 'center',
			width: 60,
			render: (text, record, index: number) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 120,
			renderText: (text: string) => {
				let statusText, statusColor;
				switch (text) {
					case 'passed':
						statusText = '验收通过';
						statusColor = CONFIG_LESS['@c_starus_done'];
						break;
					case 'rejected':
						statusText = '验收不通过';
						statusColor = CONFIG_LESS['@c_starus_warning'];
						break;
					case 'partial_pass':
						statusText = '部分通过';
						statusColor = CONFIG_LESS['@c_starus_underway'];
						break;
					default:
						statusText = '未验收';
						statusColor = CONFIG_LESS['@c_starus_await'];
						break;
				}
				return (
					<Badge
						color={statusColor}
						text={statusText}
					/>
				);
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 135,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
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
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 180,
			ellipsis: true,
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 150,
			ellipsis: true,
			renderText: (text: string, record) => `${text || '-'}/${record.serialNo || '-'}`,
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 110,
			renderText: (text: number) => (text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '灭菌日期',
			dataIndex: 'sterilizationDate',
			key: 'sterilizationDate',
			width: 110,
			renderText: (text: number) => (text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'),
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 110,
			renderText: (text: number, record) => {
				const time: any = (text - Date.now()) / (1000 * 60 * 60 * 24);
				const day = parseInt(time);
				const title =
					day < 0
						? `${record.goodsName}已过期`
						: day < record.nearExpirationDays
						? `${record.goodsName}已近效期`
						: '';
				return (
					<Tooltip
						title={title}
						placement='top'>
						<span
							className={
								day < 0 ? 'cl_FF110B' : day < record.nearExpirationDays ? 'cl_FF9F00' : ''
							}>
							{text ? moment(new Date(text)).format('YYYY/MM/DD') : '-'}
						</span>
					</Tooltip>
				);
			},
		},
		{
			title: '大/中包装',
			dataIndex: 'unitNum',
			key: 'unitNum',
			width: 110,
			renderText: (text: string, record) => dealPackNum(record.largeBoxNum, text),
		},
		{
			title: '本单数量',
			dataIndex: 'quantityInMin',
			key: 'quantityInMin',
			width: 120,
			renderText: (text: number, record) => <span>{text + record.minUnitName}</span>,
		},
		{
			width: 'XXS',
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			align: 'right',
			renderText: (text: number) => convertPriceWithDecimal(text),
		},
		{
			width: 'XXS',
			title: '总价(元)',
			dataIndex: 'totalPrice',
			key: 'totalPrice',
			align: 'right',
			renderText: (text: number) => convertPriceWithDecimal(text),
		},
		{
			title: '验收通过数',
			dataIndex: 'passedQuantity',
			key: 'passedQuantity',
			width: 110,
			renderText: (text: number, record) => <span>{text ? text + record.minUnitName : '-'}</span>,
		},
		{
			title: '不通过原因',
			dataIndex: 'acceptanceConclusion',
			key: 'acceptanceConclusion',
			width: 150,
			ellipsis: true,
			renderText: (text: string) => <span>{text || '-'}</span>,
		},
		{
			title: '赠送',
			dataIndex: 'presenter',
			key: 'presenter',
			width: 120,
			ellipsis: true,
			renderText: (text: boolean) => <span>{text ? '赠送' : '-'}</span>,
		},
	];

	const options: DescriptionsItemProps[] = [
		{
			label: '验收单号',
			dataIndex: 'receivingCode',
		},
		{
			label: fields.distributor,
			dataIndex: 'distributorName',
		},
		{
			label: '验收仓库',
			dataIndex: 'warehouseName',
		},
		{
			label: '库房',
			dataIndex: 'storageAreaName',
		},
		{
			label: '预计验收日期',
			dataIndex: 'expectDeliveryDate',
			render: (text) => <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>,
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
			render: (text) => <span>{text ? moment(text).format('YYYY/MM/DD') : '-'}</span>,
		},
		{
			label: '税率',
			dataIndex: 'taxRate',
			render: (text: string) => taxRateTextMap[text] || '-',
		},
		{
			label: '发票金额',
			dataIndex: 'invoiceAmount',
			render: (text) => (text || text == 0 ? convertPriceWithDecimal(text) + '元' : '-'),
		},
		{
			label: '两定平台订单',
			dataIndex: 'ambivalentPlatformOrder',
			show: sessionStorage.getItem('hospital_id') === '107' && WEB_PLATFORM === 'MS',
			render: () => {
				if (showEditAmbivalent) {
					return (
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<Select
								size='small'
								options={yesOrNo}
								style={{ width: 80 }}
								value={ambivalentValue}
								onChange={(value) => setAmbivalentValue(value)}
							/>
							<CheckOutlined
								style={{ marginLeft: 8, cursor: 'pointer', color: CONFIG_LESS['@c_starus_await'] }}
								onClick={confirmEditAmbivalent}
							/>
						</div>
					);
				}
				return (
					<div style={{ display: 'flex', alignItems: 'center' }}>
						{ambivalentValue ? '是' : '否'}
						<EditOutlined
							style={{ marginLeft: 8, cursor: 'pointer', color: CONFIG_LESS['@c_starus_await'] }}
							onClick={() => {
								setAmbivalentValue(ambivalentValue);
								setShowEditAmbivalent(true);
							}}
						/>
					</div>
				);
			},
		},
	];

	return (
		<Modal
			visible={true}
			maskClosable={false}
			title={accessName['receiving_order_view']}
			onCancel={onCancel}
			footer={false}
			className='ant-detail-modal'>
			<Row className='detailsBorderAndMargin four'>
				<Col className='left'>
					<Descriptions
						options={options}
						data={detail || {}}
						optionEmptyText='-'
						defaultColumn={3}
						minColumn={2}
					/>
				</Col>
				<Col className='right'>
					<Statistic
						title='未验收'
						value={getTotalNum(goodsData, 'quantityInMin')}
					/>
					<Statistic
						title='已验收'
						value={getTotalNum(receivedList, 'quantityInMin')}
					/>
					<Statistic
						title='当前状态'
						value={detail.status ? approvalStatus[detail.status].text : ''}
					/>
					<QrCode
						value={detail.receivingCode || ''}
						style={{
							width: '64px',
							height: '64px',
							marginBottom: '10px',
							marginLeft: '16px',
						}}
					/>
				</Col>
			</Row>

			<ProTable
				loading={loading}
				pagination={false}
				columns={goodsColumns}
				dataSource={[...goodsData, ...receivedList]}
				options={{ density: false, fullScreen: false, setting: false }}
				scroll={{ y: 300 }}
			/>
		</Modal>
	);
};

export default DetailModal;
