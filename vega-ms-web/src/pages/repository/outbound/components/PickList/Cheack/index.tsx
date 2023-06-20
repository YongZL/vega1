import type { DescriptionsItemProps } from '@/components/Descriptions';
import Descriptions from '@/components/Descriptions';
import ProTable from '@/components/ProTable';
import type { ProColumns } from '@/components/ProTable/typings';
import { pickOrderStatusAllValueEnum } from '@/constants/dictionary';
import { queryDetail } from '@/services/pickOrder';
import { accessNameMap } from '@/utils';
import { millisecondToDate, formatStrConnect } from '@/utils/format';
import { Col, Modal, Row, Statistic } from 'antd';
import { FC, useEffect, useState } from 'react';
import { useModel } from 'umi';

const CheckModal: FC<{
	visible: boolean;
	onCancel: () => void;
	detail: PickOrderController.QueryRuleRecord;
}> = ({ detail = {}, visible, onCancel }) => {
	const { fields } = useModel('fieldsMapping');
	const [details, setDetails] = useState<PickOrderController.QueryDetailRecord>({});
	const [goodsData, setGoodsData] = useState<PickOrderController.PickGoodsGoodsDetail[]>([]);
	const [ordinaryData, setOrdinaryData] = useState<PickOrderController.PickPackageOrdinaryDetail[]>(
		[],
	);
	const accessName = accessNameMap(); // 权限名称

	useEffect(() => {
		const getDetail = async (id: number) => {
			let details = await queryDetail({
				id,
			});
			if (details.code === 0) {
				setDetails(details.data);
				setGoodsData(details.data.pickGoodsGoodsDetail || []);
				// 获取后端传过来的医耗套包信息的数组
				setOrdinaryData(details.data.pickPackageOrdinaryDetail || []);
			}
		};
		if (visible && detail.id) {
			getDetail(detail.id);
		}
	}, [visible, detail]);
	const goodsColumns: ProColumns<PickOrderController.PickGoodsGoodsDetail>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 60,
			renderText: (_text, _recoed, index) => index + 1,
		},
		{
			title: '货位编号',
			dataIndex: 'storageLocBarcode',
			width: 120,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			width: 140,
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
			ellipsis: true,
			width: 160,
			renderText: (_text, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 150,
			ellipsis: true,
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
			title: '推送数量',
			dataIndex: 'quantity_unit',
			width: 120,
			renderText: (_text, record) =>
				record.quantity + (record.packageBulkUnit ? record.packageBulkUnit : record.unit),
		},
		{
			title: '已拣数量',
			dataIndex: 'pickedQuantity',
			width: 120,
			renderText: (_text, record) =>
				record.pickedQuantity + (record.packageBulkUnit ? record.packageBulkUnit : record.unit),
		},
	];
	const columnsOrdinary: ProColumns<PickOrderController.PickPackageOrdinaryDetail>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			renderText: (_text, _recoed, index) => index + 1,
		},
		{
			title: '货位编号',
			dataIndex: 'locationNo',
			width: 120,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			width: 140,
		},
		{
			title: '医耗套包名称',
			dataIndex: 'ordinaryName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '医耗套包说明',
			dataIndex: 'ordinaryDetailGoodsMessage',
			width: 150,
			ellipsis: true,
			render: (text, record) => (
				<div
					className='detailGoodsMessage'
					title={record.description ? record.description : record.ordinaryDetailGoodsMessage}>
					{record.description ? record.description : record.ordinaryDetailGoodsMessage}
				</div>
			),
		},
		{
			title: '推送数量',
			dataIndex: 'quantity_unit',
			width: 120,
			renderText: (_text, record) =>
				record.quantity + (record.packageBulkUnit ? record.packageBulkUnit : record.unit),
		},
		{
			title: '已拣数量',
			dataIndex: 'pickedQuantity',
			width: 120,
			renderText: (_text, record) =>
				record.pickedQuantity + (record.packageBulkUnit ? record.packageBulkUnit : record.unit),
		},
	];
	const options: DescriptionsItemProps<PickOrderController.QueryRuleRecord>[] = [
		{
			dataIndex: 'code',
			label: '配货单号',
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
			dataIndex: 'storageAreaName',
			label: '库房',
		},
		{
			dataIndex: 'pickerName',
			label: '配货人员',
		},
		{
			dataIndex: 'workbenchName',
			label: '加工台号',
		},
	];
	return (
		<div>
			<Modal
				visible={visible}
				maskClosable={false}
				title={accessName['pick_order_view']}
				onCancel={onCancel}
				footer={null}
				className='ant-detail-modal'>
				<Row className='detailsBorder four'>
					<Col className='left'>
						<Descriptions<PickOrderController.QueryRuleRecord>
							options={options}
							data={detail as PickOrderController.QueryRuleRecord}
							optionEmptyText='-'
							defaultColumn={3}
							minColumn={2}
						/>
					</Col>
					<Col className='right'>
						<Statistic
							title='配货时长'
							value={details.pickDuration ? millisecondToDate(details.pickDuration) : '-'}
						/>
						<Statistic
							title='当前状态'
							value={details.status ? pickOrderStatusAllValueEnum[details.status].text : ''}
						/>
					</Col>
				</Row>
				<div>
					{goodsData.length > 0 && (
						<ProTable<PickOrderController.PickGoodsGoodsDetail>
							headerTitle={fields.baseGoods}
							pagination={false}
							columns={goodsColumns}
							dataSource={goodsData}
							scroll={{
								y: 300,
							}}
							// tableInfoId="144"
							options={{ density: false, fullScreen: false, setting: false }}
						/>
					)}
					{/* 判断存贮医耗套包的状态里有没有数据若是由则证明是医耗套包  采用这里的表格 */}
					{ordinaryData.length > 0 && (
						<ProTable<PickOrderController.PickPackageOrdinaryDetail>
							headerTitle='医耗套包'
							pagination={false}
							columns={columnsOrdinary}
							dataSource={ordinaryData}
							scroll={{
								y: 300,
							}}
							// tableInfoId="27"
							options={{ density: false, fullScreen: false, setting: false }}
						/>
					)}
				</div>
			</Modal>
		</div>
	);
};
export default CheckModal;
