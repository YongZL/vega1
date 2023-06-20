import type { ProTableAction } from '@/components//ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import ProTable from '@/components/ResizableTable';
import { useDepartmentList } from '@/hooks/useDepartmentList';
import { useDistributorList } from '@/hooks/useDistributorList';
import { getUrlParam } from '@/utils';
import { Form, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { connect, useAccess, useModel } from 'umi';

import api from '@/constants/api';
import { goodsExpiryDate } from '@/constants/dictionary';
import { getList } from './service';
import { formatStrConnect } from '@/utils/format';

const TableList: React.FC<{}> = ({ ...props }) => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const distributorOption = useDistributorList();
	const departmentList = (useDepartmentList() || []).map((item: Record<string, any>) => {
		const { name, id, nameAcronym } = item;
		return { value: id, label: name, key: (nameAcronym || '') + '' + name };
	});
	const [isExportFile, setIsExportFile] = useState(false);
	const getSearchDate = () => {
		return tableRef.current?.getParams();
	};

	const searchColumns: ProFormColumns = [
		{
			title: '科室',
			dataIndex: 'departmentIds',
			valueType: 'select',
			fieldProps: {
				allowClear: true,
				showSearch: true,
				options: departmentList,
				filterOption: (input: string, option: { label: string }) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
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
			title: '批号/序列号',
			dataIndex: 'lotNum',
		},
		{
			title: '规格/型号',
			dataIndex: 'commonSearch.specificationAndModel',
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
			title: fields.distributor,
			dataIndex: 'distributorId',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择',
				allowClear: true,
				showSearch: true,
				options: distributorOption,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
	];

	useEffect(() => {
		const search = props.location.search;
		if (search) {
			let homeStatus = getUrlParam(search, 'expirationStatus');
			form.setFieldsValue({ expirationDates: homeStatus });
			setTimeout(() => form.submit(), 200);
		}
	}, []);

	const columns = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'id',
			align: 'center',
			render: (text: string, record: object, index: number) => index + 1,
		},
		{
			width: 'S',
			title: '科室',
			dataIndex: 'departmentName',
			ellipsis: true,
		},
		{
			width: 'L',
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
			render: (text: string, record: { specification: string; model: string }) =>
				formatStrConnect(record, ['specification', 'model']),
		},
		{
			width: 'L',
			title: '批号/序列号',
			dataIndex: 'lotNum',
			renderText: (text: string, record: { serialNum: string }) => (
				<span>{`${text || '-'}/${record.serialNum || '-'}`}</span>
			),
		},
		{
			width: 'XS',
			title: '数量',
			dataIndex: 'quantity',
		},
		{
			width: 'XS',
			title: '单位',
			dataIndex: 'unit',
		},
		{
			width: 'XS',
			title: '效期(天)',
			dataIndex: 'remainDay',
			key: 'remain_day',
			sorter: true,
			render: (
				text: number,
				record: { productionDate: string | number | Date; expirationDate: string | number | Date },
			) => {
				const name = text <= 0 ? 'cl_FF110B' : text < 30 ? 'cl_FF9F00' : '';
				const tool =
					moment(new Date(record.productionDate)).format('YYYY/MM/DD') +
					'-' +
					moment(new Date(record.expirationDate)).format('YYYY/MM/DD');
				return (
					<Tooltip
						title={tool}
						placement='top'>
						<span className={name}>{text > 0 ? text : '已过期'}</span>
					</Tooltip>
				);
			},
		},
		{
			width: 'L',
			ellipsis: true,
			title: fields.distributor,
			dataIndex: 'distributorName',
		},
		{
			width: 'L',
			ellipsis: true,
			title: '生产厂家',
			dataIndex: 'manufacturerName',
		},
	];

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', ``]} />
			</div>
			<ProTable
				rowKey='id'
				tableInfoCode='distributor_inventory_status_list'
				columns={columns}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				dateFormat={{
					createdTime: {
						endKey: 'createdTo',
						startKey: 'createdFrom',
					},
				}}
				loadConfig={{
					request: false,
				}}
				beforeSearch={(values) => {
					console.log(values);
					return {
						...values,
						expirationDates: values.expirationDates ? values.expirationDates.toString() : undefined,
					};
				}}
				api={getList}
				requestCompleted={(rows) => {
					setIsExportFile(rows.length > 0);
				}}
				toolBarRender={() => [
					access.distributor_inventory_status_list && (
						<ExportFile
							data={{
								filters: { ...getSearchDate() },
								link: api.stock.export_supplier_inventory,
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

export default connect()(TableList);
