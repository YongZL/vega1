import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import Breadcrumb from '@/components/Breadcrumb';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { barcodeControl, chargeType, timeType3 } from '@/constants';
import { charge_scheduleList, getDepartmentList } from '@/services/hisCharge';
import { convertPriceWithDecimal } from '@/utils/format';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Form } from 'antd';
import { useRef, useState } from 'react';
import { history } from 'umi';

const StockInquiry = () => {
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const [summary, setSummary] = useState<Partial<HisChargeController.SummaryData>>({});
	const threeStock =
		(sessionStorage.getItem('threeStock') &&
			JSON.parse(sessionStorage.getItem('threeStock') || '')) ||
		{};

	const searchColumns: ProFormColumns = [
		{
			title: '计费日期',
			dataIndex: 'submitTime',
			valueType: 'dateRangeWithTag',
			fieldProps: {
				options: timeType3,
			},
		},
		{
			title: '计费分类',
			dataIndex: 'chargeType',
			valueType: 'select',
			fieldProps: {
				options: chargeType,
			},
		},
		{
			title: '执行科室',
			dataIndex: 'deptId',
			valueType: 'apiSelect',
			fieldProps: {
				allowClear: true,
				showSearch: true,
				api: getDepartmentList,
				fieldConfig: {
					label: 'departmentName',
					value: 'departmentId',
				},
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '收费项编号',
			dataIndex: 'chargeNum',
		},
		{
			title: '收费项名称',
			dataIndex: 'chargeName',
		},
		{
			title: '条码管控',
			dataIndex: 'barcode',
			valueType: 'select',
			fieldProps: {
				options: barcodeControl,
			},
		},
	];

	const columns: ProColumns<HisChargeController.HisChargeRecord>[] = [
		{
			width: 'XXS',
			title: '序号',
			dataIndex: 'index',
			align: 'center',
			renderText: (text, record, index) => index + 1,
		},
		{
			width: 'S',
			title: '收费项编号',
			dataIndex: 'chargeNum',
			ellipsis: true,
		},
		{
			width: 'S',
			title: '收费项名称',
			dataIndex: 'chargeName',
			ellipsis: true,
		},
		{
			width: 'S',
			ellipsis: true,
			title: '本地医保编码',
			dataIndex: 'medicareNum',
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			width: 'S',
			ellipsis: true,
		},
		{
			width: 'XXS',
			title: '单价(元)',
			dataIndex: 'price',
			align: 'right',
			renderText: (text: number, record) => (
				<span>{text || text == 0 ? convertPriceWithDecimal(text) : '-'}</span>
			),
		},
		{
			width: 'XXS',
			title: '数量',
			dataIndex: 'quantity',
		},
		{
			width: 'XXS',
			title: '单位',
			dataIndex: 'unit',
		},
		{
			width: 'S',
			title: '是否条码管控',
			dataIndex: 'barcode',
			renderText: (text: boolean) => (text ? '条码管控' : '非条码管控'),
		},
		{
			width: 'XXS',
			title: '操作',
			dataIndex: 'option',
			fixed: 'right',
			render: (text, record) => {
				return (
					<div
						className='operation'
						style={{ display: 'flex' }}>
						<span
							className='handleLink'
							onClick={() => {
								const submitTime =
									form.getFieldsValue().time &&
									form.getFieldsValue().time.map((item: { _d: number }) => item._d);
								history.push({
									pathname: `/threeStock/charge_schedule/detail/${record.id}`,
									state: {
										params: { ...form.getFieldsValue(), submitTime },
									},
								});
							}}>
							详情
						</span>
					</div>
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
				tableInfoCode='three_stock_charge_schedule'
				api={charge_scheduleList}
				rowKey='id'
				searchKey='three_stock_charge_schedule'
				columns={columns}
				searchConfig={{
					form,
					columns: searchColumns,
				}}
				loadConfig={{
					request: false,
				}}
				dateFormat={{
					submitTime: {
						endKey: 'endTime',
						startKey: 'startTime',
					},
				}}
				setRows={(res: Record<string, any>) => {
					const { page, summary } = res.data;
					setSummary(summary);
					return page;
				}}
				tableRef={tableRef}
				headerTitle={
					<div className='flex flex-between'>
						<div className='tableTitle'>
							{summary && JSON.stringify(summary) !== '{}' && (
								<div className='tableTitle'>
									<span className='tableAlert'>
										<ExclamationCircleFilled
											style={{
												color: CONFIG_LESS['@c_starus_await'],
												marginRight: '8px',
												fontSize: '12px',
											}}
										/>
										<span className='consumeCount'>
											总数量：{' '}
											<span className='count tableNotificationTitleNum'>
												{summary.totalNum || 0}
											</span>
											，总金额：￥
											<span className='count tableNotificationTitleNum'>
												{convertPriceWithDecimal(summary.totalPrice) || 0}
											</span>
										</span>
									</span>
								</div>
							)}
						</div>
					</div>
				}
			/>
		</div>
	);
};

export default StockInquiry;
