import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import Print from '@/components/print';
import Target from '@/components/print/autoTemplate';
import collectTarget from '@/components/print/collectPrint';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { summary, summaryExport } from '@/services/settlement';
import { getAllMainDepartments } from '@/services/department';
import { convertPriceWithDecimal } from '@/utils/format';
import { Form } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useAccess } from 'umi';

export interface UpdateProps {
	pageType?: string;
	global: Record<string, any>;
	match: Record<string, any>;
}

const PrintTarget = Print(Target);
const PrintCollectTarget = Print(collectTarget);
const inventoryDeliverySummary: React.FC<UpdateProps> = ({ global }) => {
	const access = useAccess();
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const [isExportFile, setIsExportFile] = useState(false);
	const [resultData, setResultData] = useState([]);
	const printTimeRef = useRef<Record<string, any> | undefined>([]);
	const [department, setDepartment] = useState<DepartmentController.getAllMainDepartments[]>([]);
	const [amount, setamount] = useState<Number>();
	let printTypes = sessionStorage?.printType;
	// 获取一级科室
	const getDepartment = async () => {
		const res = await getAllMainDepartments();
		if (res && res.code === 0) {
			setDepartment(res.data);
		}
	};

	useEffect(() => {
		getDepartment();
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

	const searchColumns: ProFormColumns = [
		{
			title: '日期范围',
			dataIndex: 'timeCreated',
			valueType: 'dateRange',
			formItemProps: {
				...rule('请选择日期范围'),
			},
		},
		{
			title: '科室类型',
			dataIndex: 'departmentId',
			valueType: 'select',
			fieldProps: {
				allowClear: true,
				showSearch: true,
				options: department.map((item) => ({
					label: item.departmentName,
					value: item.departmentId,
				})),
				filterOption: (input: string, option: { label: string }) => {
					return option['data-item'].key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
	];
	const columns: ProColumns<SettlementController.IncomeExpenditureSummaryParams>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 'XXS',
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			width: 'S',
			title: '领用科室或部门',
			dataIndex: 'departmentName',
			align: 'left',
			renderText: (text, record: Record<string, any>) => {
				return !record.mainDepartment ? <span>&emsp;{text}</span> : text;
			},
		},
		{
			width: 'S',
			title: '金额(元)',
			dataIndex: 'amount',
			align: 'right',
			renderText: (text, record) => convertPriceWithDecimal(Number(text)),
		},
	];

	const printColumns: Record<string, any>[] = [
		{
			title: '序号',
			dataIndex: 'dataIndex',
			width: 80,
			align: 'center',
			render: (text: number, record: Record<string, any>, index: number) =>
				record.dataIndex || index,
		},
		{
			width: 120,
			title: '领用科室或部门',
			dataIndex: 'departmentName',
			align: 'left',
			render: (text: string, record: Record<string, any>) => {
				return !record.mainDepartment ? <span>&emsp;{text}</span> : text;
			},
		},
		{
			width: 120,
			title: '金额(元)',
			align: 'right',
			dataIndex: 'amount',
			render: (text: string) => convertPriceWithDecimal(text || 0),
		},
	];

	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb config={['', '']} />
			</div>
			<ProTable<SettlementController.IncomeExpenditureSummaryParams>
				loadConfig={{
					request: false,
					reset: false,
				}}
				pagination={false}
				api={summary}
				rowKey='id'
				columns={columns}
				table
				searchConfig={{
					columns: searchColumns,
					form: form,
				}}
				dateFormat={{
					timeCreated: {
						endKey: 'timeEnd',
						startKey: 'timeStart',
					},
				}}
				tableInfoCode='income_expenditure_summary'
				headerTitle={
					amount && (
						<div className='flex flex-between'>
							<div className='tableTitle'>
								<div className='tableAlert'>
									合计金额：￥{convertPriceWithDecimal(Number(amount) || 0)}
								</div>
							</div>
						</div>
					)
				}
				beforeSearch={(value: Record<string, any>) => {
					printTimeRef.current = [
						{
							label: '日期范围',
							needPrint: true,
							type: 'date_range',
							value: value.timeStart + ',' + value.timeEnd,
						},
					];
					return { ...value };
				}}
				onReset={() => {
					tableRef.current?.setDataSource([]);
					setIsExportFile(false);
					setamount(0);
					setResultData([]);
				}}
				setRows={(res) => {
					const data = res.data || [];
					const { summaryList } = data;
					if (summaryList.length) {
						setResultData(
							summaryList.concat([
								{
									departmentName: '合计',
									amount: Number(data.amount || 0),
									dataIndex: '-',
									mainDepartment: true,
								},
							]),
						);
					}

					setamount(data.amount);
					return data.summaryList;
				}}
				requestCompleted={(rows, params, result) => {
					setIsExportFile((rows || result).length > 0);
				}}
				toolBarRender={() => [
					printTypes &&
						printTypes === 'triple_printing' &&
						access['print_report_repository_outbound'] && (
							<PrintCollectTarget
								headDataList={printTimeRef.current || []}
								moduleName='出库汇总'
								isVertical={false}
								btnName='三联打印'
								isBillsInThreeParts={true} // 是否三联打印
								printType // 按钮类型
								printTypeDisabled={!isExportFile} // 打印按钮是否禁用
								columns={printColumns.slice(1)} // 打印列
								resultData={resultData || []} // 打印数据
							/>
						),
					printTypes && printTypes === 'a4_print' && access['print_report_repository_outbound'] && (
						<PrintTarget
							headDataList={printTimeRef.current || []}
							moduleName='出库汇总'
							isVertical={false}
							printType // 按钮类型
							printTypeDisabled={!isExportFile} // 打印按钮是否禁用
							columns={printColumns} // 打印列
							resultData={resultData || []} // 打印数据
						/>
					),
					access['export_report_repository_outbound'] && (
						<ExportFile
							data={{
								link: summaryExport,
								filters: {
									...tableRef.current?.getParams(),
								},
							}}
							disabled={!isExportFile}
						/>
					),
				]}
				tableRef={tableRef}
				indexKey='index'
				renderSummary={
					resultData.length
						? (data, pager) => {
								return {
									amount: convertPriceWithDecimal(Number(amount)) || 0,
									departmentName: '合计',
									id: -1,
								};
						  }
						: undefined
				}
			/>
		</div>
	);
};

export default inventoryDeliverySummary;
