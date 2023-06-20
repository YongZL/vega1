import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { timeType } from '@/constants';
import { useWarehouseList } from '@/hooks/useWarehouseList';
import { queryGoodsStockList } from '@/services/history';
import { Form } from 'antd';
import moment from 'moment';
import { formatStrConnect } from '@/utils/format';
import React, { useEffect, useRef } from 'react';
import { useModel } from 'umi';
import { propsType } from './data';

const Goods: React.FC<propsType> = ({ ...props }) => {
	const { handleprops, style } = props;
	const { type, setType } = handleprops;
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const tagsData = [{ value: '1', label: fields.baseGoods }];
	const warehouseList = (useWarehouseList() || []).map((item) => {
		const { name, id, nameAcronym } = item;
		return { value: id, label: name, key: (nameAcronym || '') + '' + name };
	});

	const searchColumns: ProFormColumns<HistoryController.QuerGoodsStockList> = [
		{
			title: '类型',
			dataIndex: 'types',
			valueType: 'tagSelect',
			fieldProps: {
				defaultValue: ['1'],
				multiple: false,
				options: tagsData,
				onChange: (value: '1' | '2' | undefined) => {
					if (value) {
						setType(value);
					}
				},
			},
		},
		{
			title: '历史时间',
			dataIndex: 'historyTime',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType,
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
		},
		{
			title: '规格/型号',
			dataIndex: 'commonSearch.specificationAndModel',
		},
		{
			title: '仓库',
			dataIndex: 'warehouseIds',
			valueType: 'select',
			fieldProps: {
				mode: 'multiple',
				showSearch: true,
				showArrow: true,
				options: warehouseList,
				filterOption: (input, option: any) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
	];

	const columns: ProColumns<HistoryController.QueryGoodsStockList>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			render: (text, record, index) => {
				return <span>{index + 1}</span>;
			},
		},
		{
			width: 'S',
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			ellipsis: true,
		},
		{
			width: 'L',
			title: fields.goodsName,
			dataIndex: 'goodsName',
			ellipsis: true,
		},
		{
			width: 'M',
			title: '批号/序列号',
			dataIndex: 'lotNum',
			ellipsis: true,
			renderText: (text, record) => (
				<span>{`${text || '-'}/${record.serialNo || record.serialNum || '-'}`}</span>
			),
		},
		{
			width: 'L',
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			width: 'XXL',
			title: fields.distributor,
			dataIndex: 'distributorName',
			ellipsis: true,
		},
		{
			width: 'XL',
			title: '仓库',
			dataIndex: 'warehouseName',
			ellipsis: true,
		},
		{
			width: 'S',
			title: '历史时间',
			dataIndex: 'historyTime',
			render: (text, record) => {
				return record.historyTime ? moment(Number(text)).format('YYYY/MM/DD') : '-';
			},
		},
		{
			width: 'XXS',
			title: '已上架',
			dataIndex: 'putOnShelfCount',
			key: 'put_on_shelf_count',
		},
		{
			width: 'XXS',
			title: '已下架',
			dataIndex: 'putOffShelfCount',
			key: 'put_off_shelf_count',
		},
		{
			width: 'XXS',
			title: '待上架',
			dataIndex: 'stayOnShelfCount',
			key: 'stay_on_shelf_count',
		},
		{
			width: 'XXS',
			title: '退回',
			dataIndex: 'returnCount',
			key: 'return_count',
		},
		{
			width: 'XXS',
			title: '验收',
			dataIndex: 'receivedCount',
			key: 'received_count',
		},
		{
			width: 'XXS',
			title: '消耗',
			dataIndex: 'consumedCount',
			key: 'consumed_count',
		},
		{
			width: 'XXS',
			title: '退货中',
			dataIndex: 'pendingReturnCount',
			key: 'pending_return_count',
		},
		{
			width: 'XXS',
			title: '调拨中',
			dataIndex: 'reallocatingCount',
			key: 'reallocating_count',
		},
		{
			width: 'XXS',
			title: '调拨进',
			dataIndex: 'reallocateInCount',
			key: 'reallocate_in_count',
		},
		{
			width: 'XXS',
			title: '调拨出',
			dataIndex: 'reallocateOutCount',
			key: 'reallocate_out_count',
		},
	];

	useEffect(() => {
		form.setFieldsValue({ type: [type] });
	}, [type]);
	return (
		<div style={style}>
			<ProTable
				tableInfoCode='stock_history_list'
				loadConfig={{
					request: false,
				}}
				columns={columns}
				api={queryGoodsStockList}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				dateFormat={{
					historyTime: {
						endKey: 'endDate',
						startKey: 'startDate',
					},
				}}
				rowKey={(record, index) => index as number}
				beforeSearch={(value: Record<string, any>) => {
					const { warehouseIds } = value;
					const params = {
						...value,
						tabType: 'goods',
						warehouseIds: warehouseIds ? warehouseIds.toString() : undefined,
					};
					return params;
				}}
				tableRef={tableRef}
			/>
		</div>
	);
};

export default Goods;
