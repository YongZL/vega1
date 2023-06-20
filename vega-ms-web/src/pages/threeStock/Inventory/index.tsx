import type { ProTableAction } from '@/components//ProTable/typings';
import Breadcrumb from '@/components/Breadcrumb';
import { ProColumns } from '@/components/ProTable';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import {
	getDepartmentList,
	getLastInventoryTime,
	getList,
	hasUnSubmit,
} from '@/services/inventory';
import { DealDate } from '@/utils/DealDate';
import { convertPriceWithDecimal } from '@/utils/format';
import { notification } from '@/utils/ui';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Form } from 'antd';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { history, useAccess } from 'umi';
import './index.less';

const InventoryList = () => {
	const [form] = Form.useForm();
	const access = useAccess();
	const tableRef = useRef<ProTableAction>();
	const [departmentName, setDepartmentName] = useState<string>();
	const [lastInventoryTime, setLastInventoryTime] = useState<string>();
	const [lastInventoryTimeCopy, setLastInventoryTimeCopy] = useState<number>();

	// 获取上次盘库时间
	const getLastInventoryTimes = async (params: number) => {
		const res = await getLastInventoryTime({ departmentId: params });
		if (res && res.code === 0) {
			let result = res.data;
			let time = result ? moment(Number(result)).format('YYYY/MM/DD HH:mm:ss') : undefined;
			setLastInventoryTime(time);
			setLastInventoryTimeCopy(Number(result));
		}
	};

	useEffect(() => {
		let pageData = sessionStorage.pageData;
		if (pageData) {
			const { departmentId, departmentName } = JSON.parse(pageData);
			getLastInventoryTimes(departmentId);
			form.setFieldsValue({ departmentId });
			setTimeout(() => form.submit(), 200);
			setDepartmentName(departmentName);
			sessionStorage.removeItem('pageData');
		}
	}, []);

	const rule = (message: string) => {
		return {
			rules: [
				{
					required: true,
					message: message,
				},
			],
		};
	};

	const operate = (
		record: InventoryController.FindInventoryRecord,
		content: string,
		page: string,
	) => {
		return (
			<span
				className='handleLink'
				onClick={() => {
					const data = {
						...record,
						pageType: page,
					};
					history.push({ pathname: `/threeStock/inventory/${page}`, state: data });
				}}>
				{content}
			</span>
		);
	};

	const searchColumns: ProFormColumns = [
		{
			title: '科室',
			dataIndex: 'departmentId',
			valueType: 'apiSelect',
			fieldProps: {
				allowClear: true,
				showSearch: true,
				api: getDepartmentList,
				fieldConfig: {
					label: 'departmentName',
					value: 'departmentId',
				},
				onChange: (value: number, e: { label: string }) => {
					getLastInventoryTimes(value);
					setDepartmentName(e.label);
				},
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
			formItemProps: {
				...rule('请选择科室'),
			},
		},
		{
			title: '创建人员',
			dataIndex: 'createdBy',
			fieldProps: {
				disabled: true,
			},
			initialValue: sessionStorage.useName,
		},
		{
			title: '该科室上次盘库时间',
			dataIndex: 'remarks',
			valueType: 'remarks',
			fieldProps: {
				className: 'lastInventoryTime',
				remarks: [lastInventoryTime],
			},
		},
	];

	const columnsList: ProColumns<InventoryController.FindInventoryRecord>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'id',
			align: 'center',
			renderText: (text, record, index) => index + 1,
		},
		{
			width: 'L',
			title: '盘库单号',
			dataIndex: 'inventoryCode',
		},
		{
			width: 'S',
			title: '科室名称',
			dataIndex: 'departmentName',
			ellipsis: true,
		},
		{
			width: 'S',
			title: '盘库人名称',
			dataIndex: 'inventoryUserName',
		},
		{
			width: 'L',
			title: '盘库时间',
			dataIndex: 'inventoryTime',
			renderText: (text) => DealDate(text, 1, '-'),
		},
		{
			width: 'S',
			title: '差异数',
			dataIndex: 'differenceQuantity',
			renderText: (text) => <span className={text < 0 ? 'negativeStyle' : ''}>{text}</span>,
		},
		{
			width: 'S',
			title: '差异总金额(元)',
			dataIndex: 'differenceAmount',
			key: 'differenceAmount',
			align: 'right',
			renderText: (text: number) => (
				<span className={text < 0 ? 'negativeStyle' : ''}>
					{text ? convertPriceWithDecimal(text) : '-'}
				</span>
			),
		},
		{
			width: 'S',
			title: '操作',
			dataIndex: 'option',
			fixed: 'right',
			render: (text, record) => {
				return (
					<>
						{access.three_stock_detail && <>{operate(record, '详情', 'detail')}</>}

						{access.three_stock_check && record.isSubmit === false && (
							<>
								<Divider type='vertical' />
								{operate(record, '盘点', 'check')}
							</>
						)}
					</>
				);
			},
		},
	];

	// 新增盘库单
	const addInventory = async () => {
		const departmentId = form.getFieldValue('departmentId');
		if (!departmentId) {
			notification.warning('请选择科室');
			return;
		}

		const res = await hasUnSubmit({ departmentId });
		if (res && res.data) {
			notification.warning('该科室存在未提交盘库记录');
			return;
		}

		const data = {
			pageType: 'add',
			departmentId,
			currentInventoryTime: new Date().getTime(),
			lastInventoryTime: lastInventoryTimeCopy,
			departmentName: departmentName,
			selectDeaprtmentId: departmentId,
		};
		history.push({ pathname: '/threeStock/inventory/inventory_add', state: data });
	};

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable
				tableInfoCode='three_stock_inventory'
				api={getList}
				rowKey='id'
				onReset={() => {
					tableRef.current?.setDataSource([]);
				}}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				loadConfig={{
					request: false,
					reset: false,
				}}
				toolBarRender={() => [
					access.three_stock_add && (
						<Button
							icon={<PlusOutlined />}
							type='primary'
							onClick={() => addInventory()}
							style={{ width: 128 }}>
							新增盘库单
						</Button>
					),
				]}
				columns={columnsList}
				tableRef={tableRef}
			/>
		</div>
	);
};

export default InventoryList;
