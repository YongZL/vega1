import type { ProTableAction } from '@/components//ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ProTable';
import api from '@/constants/api';
import { useStoreRoomList, useWarehouseList } from '@/hooks/useWarehouseList';
import { useRef, useState } from 'react';
import { useModel } from 'umi';
import { Form } from 'antd';
import { getList } from './service';
import { formatStrConnect } from '@/utils/format';

const TableList = () => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const { storeRoomList, getStorageAreas, setStoreRoomList } = useStoreRoomList();
	const tableRef = useRef<ProTableAction>();
	const [warehouseId, setWarehouseId] = useState<number>();
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const warehouseList = (useWarehouseList() || []).map((item: Record<string, any>) => {
		const { name, id, nameAcronym } = item;
		return { value: id, label: name, key: (nameAcronym || '') + '' + name };
	});
	const [isExportFile, setIsExportFile] = useState(false);
	const searchColumns: ProFormColumns = [
		{
			title: '仓库',
			dataIndex: 'warehouseIds',
			valueType: 'select',
			fieldProps: {
				placeholder: '',
				showSearch: true,
				allowClear: true,
				options: warehouseList,
				onChange: (val?: number) => {
					setWarehouseId(val);
					if (!val) {
						setStoreRoomList([]);
						form.resetFields(['storageAreaId']);
					}
					if (val) {
						getStorageAreas({ warehouseIds: [val] });
					}
				},
				filterOption: (input: string, option: { label: string }) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '库房',
			dataIndex: 'storageAreaIds',
			valueType: 'select',
			fieldProps: {
				placeholder: '',
				showSearch: true,
				allowClear: true,
				disabled: !warehouseId,
				options: storeRoomList,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '货位',
			dataIndex: 'storageLocBarcode',
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			title: fields.goodsName,
			dataIndex: 'materialName',
		},
	];

	const getSearchDate = () => {
		return tableRef.current?.getParams();
	};

	const columns = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'id',
			align: 'center',
			render: (text: string, record: object, index: number) => index + 1,
		},
		{
			width: 'M',
			title: '仓库',
			dataIndex: 'warehouseName',
		},
		{
			width: 'M',
			title: '库房',
			dataIndex: 'storageAreaName',
		},
		{
			width: 'S',
			title: '货位',
			dataIndex: 'storageLocBarcode',
		},
		{
			width: 'S',
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			width: 'L',
			title: fields.goodsName,
			dataIndex: 'goodsName',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			render: (text: string, record: { specification: string; model: string }) => {
				return <span>{formatStrConnect(record, ['specification', 'model']) || '-'}</span>;
			},
		},
		{
			width: 'L',
			ellipsis: true,
			title: '生产厂家',
			dataIndex: 'manufactureName',
		},
		{
			width: 'XS',
			title: '库存量',
			dataIndex: 'stock',
		},
	];

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable
				rowKey='id'
				tableInfoId='85'
				api={getList}
				columns={columns}
				requestCompleted={(rows) => {
					setIsExportFile(rows.length > 0);
				}}
				searchConfig={{
					columns: searchColumns,
					form,
				}}
				loadConfig={{
					request: false,
				}}
				toolBarRender={() => [
					permissions.includes('goods_inquire_export') && (
						<ExportFile
							data={{
								filters: { ...getSearchDate() },
								link: api.goods_inquire.export,
								getForm: getSearchDate,
							}}
							disabled={!isExportFile}
						/>
					),
				]}
				tableRef={tableRef}
			/>
		</div>
	);
};

export default TableList;
