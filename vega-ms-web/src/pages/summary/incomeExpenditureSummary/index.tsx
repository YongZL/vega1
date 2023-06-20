import configLess from '@/../config/configLess';
import type { ProColumns, ProTableAction } from '@/components//ProTable/typings';
import Breadcrumb from '@/components/Breadcrumb';
import ExportFile from '@/components/ExportFile';
import Print from '@/components/print';
import Target from '@/components/print/autoTemplate';
import collectTarget from '@/components/print/collectPrint';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { exportFile, getList, getIncomeExpenditureSummaryDate } from '@/services/settlement';
import { convertPriceWithDecimal } from '@/utils/format';
import { Form } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useAccess } from 'umi';

export interface UpdateProps {
	pageType?: string;
	global: Record<string, any>;
	match: Record<string, any>;
}

const PrintTarget = Print(Target);
const PrintCollectTarget = Print(collectTarget);
const incomeExpenditureSummary: React.FC<UpdateProps> = ({ global, ...props }) => {
	const access = useAccess();
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const [time, setTime] = useState<SettlementController.SelectRecord[]>([]);
	const [isExportFile, setIsExportFile] = useState(false);
	const [resultData, setResultData] = useState([]);
	const [totalAmount, setTotalAmount] = useState<Number>();
	const printTimeRef = useRef<Record<string, any> | undefined>([]);
	let printTypes = sessionStorage?.printType;
	// 获取结算周期
	const getTime = async () => {
		const res = await getIncomeExpenditureSummaryDate();
		if (res && res.code === 0) {
			const result = res.data.map((item) => {
				const { timeFrom, timeTo } = item;
				return {
					label:
						(timeFrom ? moment(timeFrom).format('YYYY/MM/DD') + '~' : '') +
						(timeTo ? moment(timeTo).format('YYYY/MM/DD') : ''),
					value: timeFrom + '|' + timeTo,
				};
			});
			setTime(result);
		}
	};

	useEffect(() => {
		getTime();
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
			title: '结算周期',
			dataIndex: 'settlementTime',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择结算周期',
				options: time,
				showSearch: true,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
			formItemProps: {
				...rule('请选择结算周期'),
			},
		},
	];

	const deal = (someText: string[], text: string) => {
		return someText.includes(text);
	};

	const dealText = (record: { projectName: string; amount?: number }, text: string | number) => {
		const result = deal(['本期出库', '本期报损'], record.projectName);
		const result2 = deal(['本期结存'], record.projectName);
		return (
			<span
				style={{
					color: result ? configLess['@c_starus_warning'] : undefined,
					fontWeight: result2 ? 'bold' : undefined,
				}}>
				{text}
			</span>
		);
	};

	const columns: ProColumns<SettlementController.IncomeExpenditureSummaryParams>[] = [
		{
			width: 'S',
			title: '项目名称',
			dataIndex: 'projectName',
			align: 'center',
			renderText: (text, record) => {
				return dealText(record, text);
			},
		},
		{
			width: 'S',
			title: '金额(元)',
			align: 'right',
			dataIndex: 'amount',
			renderText: (text, record) => dealText(record, convertPriceWithDecimal(text || 0)),
		},
	];

	const printColumns: Record<string, any>[] = [
		{
			width: 120,
			title: '项目名称',
			dataIndex: 'projectName',
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
				api={getList}
				rowKey='id'
				columns={columns}
				table
				searchConfig={{
					columns: searchColumns,
					form: form,
				}}
				dateFormat={{
					timeCreated: {
						endKey: 'timeTo',
						startKey: 'timeFrom',
					},
				}}
				tableInfoCode='income_expenditure_summary'
				beforeSearch={(value: Record<string, any>) => {
					const newData = value.settlementTime?.split('|');
					printTimeRef.current = [
						{
							label: '结算周期',
							needPrint: true,
							type: 'date_range',
							value: newData && newData.join(','),
						},
					];
					if (newData && newData.length) {
						value.timeFrom = newData[0];
						value.timeTo = newData[1];
						delete value.settlementTime;
					}
					return { ...value };
				}}
				onReset={() => {
					tableRef.current?.setDataSource([]);
					setIsExportFile(false);
					setTotalAmount(0);
					setResultData([]);
				}}
				setRows={(res) => {
					const data = res.data || [];
					setResultData(data.summaryList);
					setTotalAmount(data.amount);
					return data.summaryList;
				}}
				requestCompleted={(rows, params, result) => {
					setIsExportFile((rows || result).length > 0);
				}}
				toolBarRender={() => [
					printTypes &&
						printTypes === 'triple_printing' &&
						access['income_expenditure_summary_export'] && (
							<PrintCollectTarget
								headDataList={printTimeRef.current || []}
								moduleName='收支汇总'
								isVertical={false}
								btnName='三联打印'
								isBillsInThreeParts={true} // 是否三联打印
								printType // 按钮类型
								printTypeDisabled={!isExportFile} // 打印按钮是否禁用
								columns={printColumns} // 打印列
								resultData={resultData || []} // 打印数据
							/>
						),
					printTypes && printTypes === 'a4_print' && access['income_expenditure_summary_export'] && (
						<PrintTarget
							headDataList={printTimeRef.current || []}
							moduleName='收支汇总'
							isVertical={false}
							printType // 按钮类型
							printTypeDisabled={!isExportFile} // 打印按钮是否禁用
							columns={printColumns} // 打印列
							resultData={resultData || []} // 打印数据
						/>
					),
					access['income_expenditure_summary_export'] && (
						<ExportFile
							data={{
								link: exportFile,
								filters: {
									...tableRef.current?.getParams(),
								},
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

export default incomeExpenditureSummary;
