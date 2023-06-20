import ModalMax from '@/components/ModalMax';
import type { descriptionsColumnsType, rightColumnsType } from '@/components/ModalMax/typings';
import type { ProColumns } from '@/components/ProTable';
import { pickOrderStatusAllValueEnum } from '@/constants/dictionary';
import { queryDetail } from '@/services/pickOrder';
import { millisecondToDate, formatStrConnect } from '@/utils/format';
import { FC, useEffect, useState } from 'react';
import { useModel } from 'umi';
type tableDataType =
	| PickOrderController.PickGoodsGoodsDetail
	| PickOrderController.PickPackageOrdinaryDetail;
export const DetailsModal: FC<{
	visible: boolean;
	onCancel: () => void;
	id: number;
}> = ({ visible, onCancel, id }) => {
	const { fields } = useModel('fieldsMapping');
	const [goodsData, setGoodsData] = useState<tableDataType[]>([]);
	const [ordinaryData, setOrdinaryData] = useState<tableDataType[]>([]);
	const [detail, setDetail] = useState<PickOrderController.QueryDetailRecord>({});
	const [rightColumns, setRightColumns] = useState<rightColumnsType[]>([]);
	useEffect(() => {
		const getDetail = async (id: number) => {
			let details = await queryDetail({
				id,
			});
			if (details.code === 0) {
				const { data } = details;
				setDetail(data);
				const rightColumns = [
					{
						title: '配货时长',
						value: data.pickDuration ? millisecondToDate(data.pickDuration) : '-',
					},
					{
						title: '当前状态',
						value: data.status ? pickOrderStatusAllValueEnum[data.status].text : '-',
					},
				];
				setRightColumns(rightColumns);
				setGoodsData(details.data.pickGoodsGoodsDetail || []);
				// 获取后端传过来的医耗套包信息的数组
				setOrdinaryData(details.data.pickPackageOrdinaryDetail || []);
			}
		};
		if (visible && id) {
			getDetail(id);
		}
	}, [visible, id]);
	const descriptionsColumns: descriptionsColumnsType[] = [
		{ label: '配货单号', key: 'code' },
		{ label: '推送科室', key: 'departmentName' },
		{ label: '推送仓库', key: 'warehouseName' },
		{ label: '库房', key: 'storageAreaName' },
		{ label: '配货人员', key: 'pickerName' },
		{ label: '加工台号', key: 'workbenchName' },
	];
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
	const modalMaxProps = {
		tableData: goodsData.length > 0 ? goodsData : ordinaryData,
		columns: goodsData.length > 0 ? goodsColumns : columnsOrdinary,
		tableTitle: goodsData.length > 0 ? fields.baseGoods : '医耗套包',
		detail,
		descriptionsColumns,
		rightColumns,
		visible,
		onCancel,
		title: '配货单详情',
		maskClosable: false,
		footer: false,
	};
	return <ModalMax {...modalMaxProps} />;
};
