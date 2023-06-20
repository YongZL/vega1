import type { DescriptionsItemProps } from '@/components/Descriptions';
import Descriptions from '@/components/Descriptions';
import ProTable from '@/components/ProTable';
import type { ProColumns } from '@/components/ProTable/typings';
import { deliveryGoodsStatusValueEnum, deliveryStatusValueEnum } from '@/constants/dictionary';
import { queryDetail } from '@/services/deliveryOrder';
import { accessNameMap, judgeBarCodeOrUDI } from '@/utils';
import { convertPriceWithDecimal, formatStrConnect, formatUnitNum } from '@/utils/format';
import { Col, Modal, Row, Spin, Statistic } from 'antd';
import { FC, useEffect, useState } from 'react';
import { useModel } from 'umi';
const CheckModal: FC<{
	visible: boolean;
	onCancel: () => void;
	detail: DeliveryOrderController.QueryRuleRecord;
}> = ({ detail = {}, visible, onCancel }) => {
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [details, setDetails] = useState<DeliveryOrderController.Order>({});
	const [sumPrice, setSumPrice] = useState(0);
	const [goodsData, setGoodsData] = useState<DeliveryOrderController.DeliveryGoodsDetail[]>([]);
	const [ordinaryData, setOrdinaryData] = useState<
		DeliveryOrderController.DeliveryPackageOrdinaryDetail[]
	>([]);
	const accessName = accessNameMap(); // 权限名称

	const getDetail = async (id: number) => {
		setLoading(true);
		let details = await queryDetail({
			deliveryId: id,
		});
		setLoading(false);
		if (details.code === 0) {
			let result = details.data;
			setSumPrice(result.sumPrice);
			setDetails(result.order);
			setGoodsData(result.deliveryGoodsDetail || []);
			// 获取后端传过来的医耗套包信息的数组
			setOrdinaryData(result.deliveryPackageOrdinaryDetail || []);
		}
	};
	useEffect(() => {
		if (visible && detail.id) {
			getDetail(detail.id);
		}
	}, [visible, detail]);
	const goodsColumns: ProColumns<DeliveryOrderController.DeliveryGoodsDetail>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			renderText: (_text, _recoed, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 120,
			filters: false,
			valueEnum: deliveryGoodsStatusValueEnum,
		},
		{
			title: `${fields.goods}条码/UDI`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 200,
			ellipsis: true,
			renderText: (text, record) => judgeBarCodeOrUDI(record, true),
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			renderText: (_text, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '包装规格',
			dataIndex: 'minGoodUnitNum',
			key: 'minGoodUnitNum',
			width: 100,
			renderText: (text, record) => formatUnitNum(text, record.unit!, record.purchaseGoodsUnit),
		},
		{
			title: '包装规格',
			dataIndex: 'minGoodUnitNum',
			key: 'minGoodUnitNum',
			width: 100,
			renderText: (text, record) => formatUnitNum(text, record.unit!, record.purchaseGoodsUnit),
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 120,
			renderText: (text, record) => {
				return `${text || '-'}/${record.serialNum || '-'}`;
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			width: 150,
			ellipsis: true,
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			width: 150,
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'procurementPrice',
			key: 'procurementPrice',
			width: 80,
			align: 'right',
			renderText: (text) => (text ? convertPriceWithDecimal(text) : '-'),
		},
		{
			title: '推送数量',
			dataIndex: 'quantity_unit',
			key: 'quantity_unit',
			width: 100,
			renderText: (_text, record) =>
				`${record.quantity}${record.packageBulkUnit ? record.packageBulkUnit : record.unit}`,
		},
		{
			title: '小计(元)',
			dataIndex: 'totalAmount',
			key: 'totalAmount',
			width: 80,
			align: 'right',
			renderText: (text) => (text ? convertPriceWithDecimal(text) : '-'),
		},
		{
			title: '复核不通过原因',
			dataIndex: 'reason',
			key: 'reason',
			width: 150,
			ellipsis: true,
			renderText: (text) => (text ? text : '-'),
		},
		{
			title: '验收不通过原因',
			dataIndex: 'acceptanceConclusion',
			key: 'acceptanceConclusion',
			width: 150,
			ellipsis: true,
			renderText: (text) => (text ? text : '-'),
		},
		{
			title: '是否需要补货',
			dataIndex: 'needToReplenish',
			key: 'needToReplenish',
			width: 120,
			renderText: (text, record) =>
				record.acceptanceOrderItemStatus === false ? (text ? '是' : '否') : '-',
		},
	];
	const columnsOrdinary: ProColumns<DeliveryOrderController.DeliveryPackageOrdinaryDetail>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			renderText: (_text, _recoed, index) => index + 1,
		},
		{
			title: '状态',
			dataIndex: 'status',
			width: 120,
			filters: false,
			valueEnum: deliveryGoodsStatusValueEnum,
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 200,
		},
		{
			title: '医耗套包名称',
			dataIndex: 'packageOrdinaryName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '医耗套包说明',
			dataIndex: 'detailGoodsMessage',
			width: 160,
			render: (_text, record) => (
				<div
					className='detailGoodsMessage'
					title={record.description ? record.description : record.detailGoodsMessage}>
					{record.description ? record.description : record.detailGoodsMessage}
				</div>
			),
		},
		{
			title: '推送数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			renderText: (text) => text,
		},
		{
			title: '复核不通过原因',
			dataIndex: 'reason',
			key: 'reason',
			width: 150,
			ellipsis: true,
			renderText: (text) => (text ? text : '-'),
		},
		{
			title: '验收不通过原因',
			dataIndex: 'acceptanceConclusion',
			key: 'acceptanceConclusion',
			width: 150,
			ellipsis: true,
			renderText: (text) => (text ? text : '-'),
		},
		{
			title: '是否需要补货',
			dataIndex: 'needToReplenish',
			key: 'needToReplenish',
			width: 120,
			renderText: (text, record) =>
				record.acceptanceOrderItemStatus === false ? (text ? '是' : '否') : '-',
		},
	];
	const options: DescriptionsItemProps<DeliveryOrderController.Order>[] = [
		{
			dataIndex: 'code',
			label: '推送单号',
		},
		{
			dataIndex: 'departmentName',
			label: '推送科室',
		},
		{
			dataIndex: 'warehouseName',
			label: '推送仓库',
		},
		{
			dataIndex: 'pusherName',
			label: '推送人员',
		},
	];
	return (
		<div>
			<Modal
				visible={visible}
				maskClosable={false}
				title={accessName['delivery_order_view']}
				onCancel={onCancel}
				footer={null}
				className='ant-detail-modal'>
				<Spin spinning={loading}>
					<Row className='detailsBorder four'>
						<Col className='left'>
							<Descriptions<DeliveryOrderController.Order>
								options={options}
								data={details}
								optionEmptyText='-'
								defaultColumn={3}
								minColumn={2}
							/>
						</Col>
						<Col className='right'>
							{goodsData.length > 0 && (
								<Statistic
									title='总金额'
									value={'￥' + convertPriceWithDecimal(sumPrice || 0)}
								/>
							)}
							<Statistic
								title='当前状态'
								value={details.status ? deliveryStatusValueEnum[details.status].text : ''}
							/>
						</Col>
					</Row>
					<>
						{goodsData.length > 0 && (
							<ProTable<DeliveryOrderController.DeliveryGoodsDetail>
								headerTitle={fields.baseGoods}
								pagination={false}
								columns={goodsColumns}
								dataSource={goodsData}
								options={{ density: false, fullScreen: false, setting: false }}
								scroll={{ x: '100%', y: 300 }}
								// tableInfoId="147"
							/>
						)}
						{/* 判断存贮医耗套包的状态里有没有数据若是由则证明是医耗套包  采用这里的表格 */}
						{ordinaryData.length > 0 && (
							<ProTable<DeliveryOrderController.DeliveryPackageOrdinaryDetail>
								headerTitle='医耗套包'
								pagination={false}
								columns={columnsOrdinary}
								dataSource={ordinaryData}
								scroll={{ x: '100%', y: 300 }}
								// tableInfoId="30"
								options={{ density: false, fullScreen: false, setting: false }}
							/>
						)}
					</>
				</Spin>
			</Modal>
		</div>
	);
};
export default CheckModal;
