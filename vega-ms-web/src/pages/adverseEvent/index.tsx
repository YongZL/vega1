import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import { getList } from '@/services/adverseEvent';
import { Button, Form } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef } from 'react';
import { history } from 'umi';

const AdverseEvent: React.FC<{}> = () => {
	const tableRef = useRef<ProTableAction>();
	const [form] = Form.useForm();
	const searchColumns: ProFormColumns = [
		{
			title: '报告日期',
			dataIndex: 'adverseDate',
			valueType: 'dateRange',
		},
		{
			title: '产品名称',
			dataIndex: 'productName',
		},
		{
			title: '报告人',
			dataIndex: 'createdBy',
		},
	];

	useEffect(() => {
		let state: any = history.location.state;
		let formData = sessionStorage.formData;
		if (
			state &&
			state.url &&
			state.url == '/adverseEvent/report' &&
			formData &&
			formData !== '{}'
		) {
			const { adverseDateStart, adverseDateEnd, productName, createdBy } = JSON.parse(formData);
			form.setFieldsValue({
				createdBy: createdBy,
				productName: productName,
				adverseDate: adverseDateStart
					? [
							moment(moment(adverseDateStart).format('YYYY/MM/DD')),
							moment(moment(adverseDateEnd).format('YYYY/MM/DD')),
					  ]
					: undefined,
			});
			setTimeout(() => form.submit(), 200);
		}
		sessionStorage.removeItem('formData');
	}, []);

	const columns: ProColumns<AdverseEvent.QuerygetList>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			render: (text, redord, index) => <span>{index + 1}</span>,
		},
		{
			width: 'L',
			title: '报告编码',
			dataIndex: 'adverseCode',
		},
		{
			width: 'L',
			title: '产品名称',
			dataIndex: 'productName',
		},
		{
			width: 'L',
			title: '报告日期',
			dataIndex: 'adverseDate',
			render: (text, record) => (
				<span>{record.adverseDate ? moment(text as string).format('YYYY/MM/DD') : '-'}</span>
			),
		},
		{
			width: 'L',
			title: '报告人',
			dataIndex: 'createdName',
		},
		{
			width: 'XXS',
			title: '操作',
			dataIndex: 'option',
			valueType: 'option',
			fixed: 'right',
			render: (id, record) => {
				return (
					<div className='operation'>
						<span
							className='handleLink'
							onClick={() => {
								saveSearchData();
								history.push({
									pathname: '/adverseEvent/report/detail',
									state: { companyType: 'company', id: record.id },
								});
							}}>
							查看
						</span>
					</div>
				);
			},
		},
	];
	const saveSearchData = () => {
		let searchData = tableRef.current?.getParams();
		if (searchData) {
			sessionStorage.setItem('formData', JSON.stringify(searchData));
		}
	};
	const add = (state: Object) => {
		saveSearchData();
		history.push({ pathname: '/adverseEvent/report/add', state: state });
	};
	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable
				tableInfoCode='adverse_event_report'
				api={getList}
				rowKey='id'
				columns={columns}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				dateFormat={{
					adverseDate: {
						endKey: 'adverseDateEnd',
						startKey: 'adverseDateStart',
					},
				}}
				loadConfig={{
					request: false,
				}}
				toolBarRender={() => [
					<Button
						type='primary'
						onClick={() => add({ companyType: 'company', pageType: 'add' })}
						style={{ width: 114 }}>
						单位/企业上报
					</Button>,
					// <Button type="primary" onClick={()=>add({companyType:'personal'})}>持有人上报</Button>
				]}
				tableRef={tableRef}
			/>
		</div>
	);
};

export default AdverseEvent;
