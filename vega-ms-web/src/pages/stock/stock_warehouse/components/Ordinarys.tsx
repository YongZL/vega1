import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import {
	goodsExpiryDate,
	stockGoodsStatus,
	stockGoodsStatusAllValueEnum,
} from '@/constants/dictionary';
import { useGoodsType } from '@/hooks/useGoodsType';
import { useStoreRoomList, useWarehouseList } from '@/hooks/useWarehouseList';
import { queryOrdinaryStockList } from '@/services/stock';
import { Form } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';
import { propsType } from './data';
import DetailModal from './detail/index';
import { getUrlParam } from '@/utils';

const ordinarys: React.FC<propsType> = ({ ...props }) => {
	const { fields } = useModel('fieldsMapping');
	const { handleprops, style } = props;
	const { type, setType } = handleprops;
	const [form] = Form.useForm();
	// 用于判断是否可以选择库房
	const [warehouseIds, setWarehouseIds] = useState<number[]>([]);
	// 请求完成了之后用于查看功能传参
	const [storageAreaId, setStorageAreaId] = useState<number>();
	const presenter = useRef<boolean>(false);
	const warehouseId = useRef<number>(0);
	const tableRef = useRef<ProTableAction>();
	const [expirationStatus, setExpirationStatus] = useState<string>('');
	const { storeRoomList, setStoreRoomList, getStorageAreas } = useStoreRoomList();
	const access = useAccess();
	const [isExportFile, setIsExportFile] = useState(false);
	const warehouseList = (useWarehouseList() || []).map((item) => {
		const { name, id, nameAcronym } = item;
		if (name && name == '中心仓库') {
			warehouseId.current = id;
		}
		return { value: id, label: name, key: (nameAcronym || '') + '' + name };
	});
	const tagsData = useGoodsType({ goodsValue: '1', ordinaryValue: '2' }); //类型

	useEffect(() => {
		form.setFieldsValue({ type: [type] });
	}, [type]);

	const searchColumns: ProFormColumns<StockController.GetOrdinaryStockList> = [
		{
			title: '类型',
			dataIndex: 'type',
			valueType: 'tagSelect',
			fieldProps: {
				defaultValue: ['2'],
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
			title: '状态',
			dataIndex: 'statusList',
			valueType: 'tagSelect',
			fieldProps: {
				options: stockGoodsStatus,
			},
		},

		{
			title: '效期(天)',
			dataIndex: 'expirationDates',
			valueType: 'select',
			fieldProps: {
				mode: 'multiple',
				showArrow: true,
				options: goodsExpiryDate,
			},
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
				onChange: (val) => {
					setWarehouseIds(val || []);
					if (!val || !val.length) {
						setStoreRoomList([]);
						form.resetFields(['storageAreaId']);
					}
					if (val && val.length > 0) {
						getStorageAreas({ warehouseIds: val });
					}
				},
				filterOption: (input, option: any) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '库房',
			dataIndex: 'storageAreaId',
			valueType: 'select',
			fieldProps: {
				showSearch: true,
				showArrow: true,
				options: storeRoomList,
				disabled: !warehouseIds.length,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '套包编号/名',
			dataIndex: 'keyword',
		},
	];

	useEffect(() => {
		let value = warehouseId.current;
		if (value && expirationStatus) {
			form.setFieldsValue({
				warehouseIds: value,
			});
		}
	}, [warehouseId.current, expirationStatus]);

	useEffect(() => {
		if (type === '2') {
			let tabList = JSON.parse(sessionStorage.getItem('dictionary') || '{}').package_config || [];
			tabList.map((value: { text: string }) => {
				if (value.text == '医耗套包') {
					presenter.current = false;
				}
			});
		}
	}, [location.search, type]);

	const packageOrdinaryColumns: ProColumns<StockController.GetQueryOrdinaryStockList>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			width: 'XS',
			title: '状态',
			dataIndex: 'status',
			filters: false,
			valueEnum: stockGoodsStatusAllValueEnum,
		},
		{
			width: 'L',
			title: '仓库',
			dataIndex: 'warehouseName',
			ellipsis: true,
		},
		{
			width: 'L',
			title: fields.goodsCode,
			dataIndex: 'ordinaryCode',
			ellipsis: true,
		},
		{
			width: 'XXL',
			title: '医耗套包名称',
			dataIndex: 'ordinaryName',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '医耗套包说明',
			dataIndex: 'ordinaryDescription',
			ellipsis: true,
		},
		{
			width: 'XS',
			title: '数量',
			dataIndex: 'num',
		},
		{
			width: 'S',
			title: '效期(天)',
			dataIndex: 'remaining',
			sorter: true,
			key: 'expiration_date',
			render: (text, record) => {
				let name =
					(record.remaining as number) <= 0
						? 'cl_FF110B'
						: (record.remaining as number) < (record.nearExpirationDays as number)
						? 'cl_FF9F00'
						: '';
				return (
					<span className={name}>
						{(record.remaining as number) > 0 ? `${record.remaining}` : '已过期'}
					</span>
				);
			},
		},
		{
			width: 'XXS',
			title: '操作',
			dataIndex: 'option',
			fixed: 'right',
			render: (id, record) => {
				return (
					access.inventory_quantity_view && (
						<div className='operation'>
							<DetailModal
								trigger={<span className='handleLink'>查看</span>}
								record={record}
								activeTab={'ordinaryBulk'}
								storageAreaId={storageAreaId}
							/>
						</div>
					)
				);
			},
		},
	];
	return (
		<div style={style}>
			<ProTable
				tableInfoCode='inventory_quantity_ordinary_list'
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				loadConfig={{
					request: false,
				}}
				api={queryOrdinaryStockList}
				// tableInfoId="245"
				rowKey={(record, index) => index as number}
				columns={packageOrdinaryColumns}
				tableRef={tableRef}
				beforeSearch={(value: Record<string, any>) => {
					const { warehouseIds, statusList, presenter } = value;
					const params = {
						...value,
						presenter: presenter ? (presenter === 'all' ? '' : presenter.toString()) : undefined,
						warehouseIds: warehouseIds ? warehouseIds.toString() : undefined,
						statusList: statusList ? statusList.toString() : undefined,
						expirationDates: value.expirationDates ? value.expirationDates.toString() : undefined,
					};
					return params;
				}}
				requestCompleted={(_list, params) => {
					setIsExportFile(_list.length > 0);
					setStorageAreaId(params.storageAreaId);
				}}
				toolBarRender={() => [
					access.consume_history_export && (
						<ExportFile
							data={{
								filters: { ...tableRef.current?.getParams },
								link: '/api/admin/stock/1.0/packageOrdinary/export',
								getForm: tableRef.current?.getParams,
							}}
							disabled={!isExportFile}
						/>
					),
				]}
			/>
		</div>
	);
};

export default ordinarys;
