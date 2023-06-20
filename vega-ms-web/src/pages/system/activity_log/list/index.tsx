import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import { activityType } from '@/constants/dictionary';
import { getOnDetail } from '@/services/audit';
import { getUrlParam } from '@/utils';
import { Form } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import CheckModal from '../cheack';
type Props = {
	location: {
		search?: string;
	};
};
const ActivityLog: React.FC<Props> = ({ ...props }) => {
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const [jumpSearch, setJumpSearch] = useState<boolean>(false);

	const searchColumns: ProFormColumns<Audit.Rulelist> = [
		{
			title: '操作类型',
			dataIndex: 'typeList',
			valueType: 'tagSelect',
			fieldProps: {
				options: activityType,
			},
		},
		{
			title: '操作时间',
			dataIndex: 'timeCreated',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: [
					{
						label: '当天',
						type: 'day',
						count: 0,
					},
					{
						label: '最近一周',
						type: 'day',
						count: -7,
					},
					{
						label: '近一个月',
						type: 'month',
						count: -1,
					},
				],
			},
		},
		{
			title: '用户名',
			dataIndex: 'userName',
		},
	];
	// 请求列表
	const getFormList = () => {
		tableRef.current?.reload();
	};

	// 查询参数变化后更新列表
	useEffect(() => {
		//  设置主页跳转状态
		const search = props.location.search;
		if (search && !jumpSearch) {
			let homeStatus = getUrlParam(search, 'status');
			form.setFieldsValue({ status: [homeStatus] });
			getFormList();
			setJumpSearch(true);
		}
	}, [props]);

	const columns: ProColumns<Audit.QueryRulelist>[] = [
		{
			width: 'XXS',
			title: '序号',
			align: 'center',
			dataIndex: 'index',
			render: (text, redord, index) => <span>{index + 1}</span>,
		},
		{
			width: 'XS',
			title: '操作类型',
			dataIndex: 'operateTypeCh',
		},
		{
			width: 'L',
			title: '用户名',
			dataIndex: 'userName',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '操作目标',
			dataIndex: 'operateTargetCh',
			render: (text, record) => {
				if (!text) {
					return <span>-</span>;
				}
				return (
					<CheckModal
						trigger={
							<span
								style={
									record.key ? { color: CONFIG_LESS['@c_starus_await'], cursor: 'pointer' } : {}
								}>
								{text + ((record.key && '[' + record.key + ']') || '')}
							</span>
						}
						detail={record}
					/>
					// <span
					//   style={record.key ? { color: CONFIG_LESS['c_starus_await'], cursor: 'pointer' } : {}}
					//   onClick={() => {
					//     record.key && openModal(record);
					//   }}
					// >
					//   {text + ((record.key && '[' + record.key + ']') || '')}
					// </span>
				);
			},
		},
		{
			title: '操作内容',
			dataIndex: 'activity',
			ellipsis: true,
		},
		{
			width: 'L',
			title: '操作时间',
			dataIndex: 'occurredTime',
			render: (text, record) => {
				return record.occurredTime
					? moment(new Date(text as number)).format('YYYY/MM/DD HH:mm:ss')
					: '-';
			},
		},
	];
	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable
				loadConfig={{
					request: false,
				}}
				rowKey='id'
				api={getOnDetail}
				tableInfoCode='logs_list'
				columns={columns}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				dateFormat={{
					timeCreated: {
						endKey: 'end',
						startKey: 'start',
					},
				}}
				beforeSearch={(value: Record<string, any>) => {
					const { typeList } = value;
					const params = {
						...value,
						typeList: typeList ? typeList.toString() : undefined,
					};
					return params;
				}}
				tableRef={tableRef}
			/>
		</div>
	);
};

export default ActivityLog;
