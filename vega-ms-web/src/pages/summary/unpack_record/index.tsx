import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import api from '@/constants/api';
import { useDepartmentList } from '@/hooks/useDepartmentList';
import { useWarehouseList } from '@/hooks/useWarehouseList';
import { Form } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import Detail from './detail';

import { timeType3 } from '@/constants';
import { useModel, useAccess } from 'umi';
import { queryRecordList } from './service';

const type = [
	{ text: '组包', value: 'process' },
	{ text: '拆包', value: 'unpack' },
];

const UnpackingRecord = () => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const [modalVisible, setModalVisible] = useState(false);
	const [activeTab, setActiveTab] = useState('process');
	const [detailInfo, setDetailInfo] = useState<object>({});
	const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
	const [isExportFile, setIsExportFile] = useState(false);
	const access = useAccess();
	const departmentList = (useDepartmentList() || []).map((item: Record<string, any>) => {
		const { name, id, nameAcronym } = item;
		return { value: id, label: name, key: (nameAcronym || '') + '' + name };
	});
	const warehouseList = (useWarehouseList() || []).map((item: Record<string, any>) => {
		const { name, id, nameAcronym } = item;
		return { value: id, label: name, key: (nameAcronym || '') + '' + name };
	});

	const detailData = {
		detailInfo,
		modalVisible,
		setModalVisible,
	};

	const searchColumns: ProFormColumns = [
		{
			title: '类型',
			dataIndex: 'type',
			valueType: 'tagSelect',
			initialValue: activeTab,
			fieldProps: {
				defaultValue: 'process',
				multiple: false,
				options: type,
				onChange: (value: string) => {
					setActiveTab(value);
					form.resetFields();
					form.setFieldsValue({ type: value });
					setTimeout(() => form.submit(), 200);
				},
			},
		},
		{
			title: '操作时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType3,
			},
		},
		{
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			title: '套包名称',
			dataIndex: 'packageName',
		},
		{
			title: '所属科室',
			dataIndex: 'departmentIds',
			valueType: 'select',
			fieldProps: {
				mode: 'multiple',
				showSearch: true,
				showArrow: true,
				options: departmentList,
				filterOption: (input: string, option: { label: string }) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '所属仓库',
			dataIndex: 'warehouseIds',
			valueType: 'select',
			fieldProps: {
				mode: 'multiple',
				showSearch: true,
				showArrow: true,
				options: warehouseList,
				filterOption: (input: string, option: { label: string }) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
	];

	const convertSearchParams = () => {
		return { ...tableRef.current?.getParams(), type: activeTab };
	};

	//查看
	const getDetail = async (record: Record<string, any>) => {
		const { timeCreated } = record;
		record.timeCreated = timeCreated ? moment(timeCreated).format('YYYY/MM/DD HH:mm:ss') : '';
		setModalVisible(true);
		setDetailInfo(record);
	};

	const columns: ProColumns<Record<string, any>>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			render: (_text, _record, index) => {
				return <span>{index + 1}</span>;
			},
		},
		{
			width: 'L',
			title: `${fields.goods}条码`,
			dataIndex: 'operatorBarcode',
		},
		{
			width: 'S',
			title: '所属科室',
			dataIndex: 'departmentName',
		},
		{
			width: 'L',
			title: '所属仓库',
			dataIndex: 'warehouseName',
		},
		{
			width: 'M',
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			width: 'XXXL',
			title: '套包名称',
			dataIndex: 'packageName',
		},
		{
			width: 'L',
			title: '操作时间',
			dataIndex: 'timeCreated',
			sorter: true,
			render: (text, record) => {
				return record.timeCreated ? moment(new Date(text)).format('YYYY/MM/DD HH:mm:ss') : '-';
			},
		},
		{
			width: 'S',
			title: '操作人',
			dataIndex: 'operatorName',
		},
		{
			width: 'XXS',
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			fixed: 'right',
			render: (_text, record) => {
				return (
					access.unpack_record_detail && (
						<div
							className='operation'
							style={{ display: 'flex' }}>
							<span
								className='handleLink'
								onClick={() => getDetail(record)}>
								查看
							</span>
						</div>
					)
				);
			},
		},
	];

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable
				tableInfoCode='unpack_record_list'
				columns={columns}
				rowKey={(record, index) => index!}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				dateFormat={{
					timeCreated: {
						endKey: 'timeTo',
						startKey: 'timeFrom',
					},
				}}
				loadConfig={{
					request: false,
				}}
				api={queryRecordList}
				requestCompleted={(rows) => {
					setIsExportFile(rows.length > 0);
				}}
				beforeSearch={(value: Record<string, any>) => {
					const { type, departmentIds, warehouseIds } = value;
					const params = {
						...value,
						type: type ? type.toString() : undefined,
						departmentIds: departmentIds ? departmentIds.toString() : undefined,
						warehouseIds: warehouseIds ? warehouseIds.toString() : undefined,
					};
					return params;
				}}
				toolBarRender={() => [
					permissions.includes('unpack_record_export') && (
						<ExportFile
							data={{
								filters: { ...convertSearchParams() },
								link: api.unpacking.export,
								getForm: convertSearchParams,
							}}
							disabled={!isExportFile}
						/>
					),
				]}
				tableRef={tableRef}
			/>

			{modalVisible && <Detail {...detailData} />}
		</div>
	);
};

export default UnpackingRecord;
