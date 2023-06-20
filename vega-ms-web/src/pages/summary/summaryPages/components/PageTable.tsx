import type { ProTableAction } from '@/components//ProTable/typings';
import ExportFile from '@/components/ExportFile';
import Print from '@/components/print';
import Target from '@/components/print/autoTemplate';
import collectTarget from '@/components/print/collectPrint';
import type { ProColumns } from '@/components/ProTable';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { exportUrl, getStatistic, queryList } from '@/services/statistic';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Form, Spin, TablePaginationConfig } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { history, useAccess } from 'umi';
import { searchColumnsMap, tableColumnsMap } from '../utils/columnsMap';

const PrintTarget = Print(Target);
const PrintCollectTarget = Print(collectTarget);
const PageTable: React.FC<{
	match: { path: string };
	code: string;
	id: number;
	exportCode: string;
	printCode: string;
	printType: string;
	moduleName: string;
}> = ({ match, code, id: templateId, exportCode, id, printCode, printType, moduleName }) => {
	const [summarytitle, setSummarytitle] = useState<string>();
	const [summary, setSummary] = useState<string>();
	const [columnName, setColumnName] = useState<string>();
	const [columNum, setColumNum] = useState<string>();
	const tableRef = useRef<ProTableAction>();
	const access = useAccess();
	const [searchColumns, setSearchColumns] = useState<ProFormColumns>([]);
	const [tableColumns, setTableColumns] = useState<ProColumns<Record<string, any>>[]>([]);
	const [timeKey, setTimeKey] = useState<string>('');
	const [isExportFile, setIsExportFile] = useState(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [resultData, setResultData] = useState([]);
	const [resultDatasum, setResultDatasum] = useState([]);
	const [saveTableColumns, setSaveTableColumns] = useState<Record<string, any>>([]);
	const [form] = Form.useForm();
	const printTimeRef = useRef<Record<string, any> | undefined>([]);
	const isFirstLoad = useRef(true);
	let printTypes = sessionStorage?.printType;
	const [pagination, setPagination] = useState<false | TablePaginationConfig | undefined>(
		undefined,
	);

	useEffect(() => {
		const allStatistic = async () => {
			setLoading(true);
			try {
				const statisticRes = await getStatistic(templateId);

				if (statisticRes.code === 0) {
					let printShowData: any = [];

					// 判断是否需要分页
					setPagination(statisticRes.data.paging ? { pageSize: 100 } : false);

					setSearchColumns(
						searchColumnsMap(statisticRes.data.conditionList, form, statisticRes.data.id),
					);
					statisticRes.data.conditionList.forEach((item) => {
						if (item.type === 'date_range') {
							setTimeKey(item.field);
						}
						// 打印需要展示的查询条件
						if (item.needPrint) {
							printShowData.push(item);
						}
					});
					setSaveTableColumns(statisticRes.data);
					statisticRes.data.resultList.forEach((item) => {
						if (item.type !== 'text') {
							setTableColumns(tableColumnsMap(item.columns, tableRef, isExportFile));
						}
					});
					printTimeRef.current = printShowData;
				}
			} finally {
				setLoading(false);
			}
		};
		allStatistic();
		setSummary(undefined);
	}, [match.path.split('/').pop(), code, templateId, exportCode]);

	const getSearchDate = () => {
		return { params: { ...tableRef.current?.getParams()!.params }, templateId };
	};
	const getData = () => {
		(saveTableColumns?.resultList || []).forEach(
			(item: { type: string; columns: StatisticController.ResultListColumns[] }) => {
				if (item.type !== 'text') {
					setTableColumns(tableColumnsMap(item.columns, tableRef, isExportFile));
				}
			},
		);
		setSearchColumns(
			searchColumnsMap(
				saveTableColumns?.conditionList,
				form,
				saveTableColumns.id,
				isFirstLoad.current,
			),
		);
		(saveTableColumns?.conditionList || []).forEach(
			(item: { type: string; field: React.SetStateAction<string> }) => {
				if (item.type === 'date_range') {
					setTimeKey(item.field);
				}
			},
		);
	};

	useEffect(() => {
		isFirstLoad.current = true;
		getData();
	}, [history.location.state]);

	useEffect(() => {
		getData();
	}, [isExportFile, saveTableColumns]);
	return (
		<Spin spinning={loading}>
			{searchColumns.length > 0 && tableColumns.length > 0 && (
				<ProTable<Record<string, any>>
					tableInfoCode={code}
					rowKey='id'
					api={queryList}
					searchConfig={{
						columns: searchColumns,
						form,
					}}
					loadConfig={{
						reset: false,
						request: false,
					}}
					columns={tableColumns}
					dateFormat={{
						[timeKey]: {
							startKey: 'startTime',
							endKey: 'endTime',
						},
					}}
					onReset={() => {
						tableRef.current?.setDataSource([]);
						setIsExportFile(false);
						setSummary('');
						setSummarytitle('');
					}}
					requestCompleted={(rows, params, result) => {
						setIsExportFile((rows || result).length > 0);
						if (isFirstLoad.current) {
							isFirstLoad.current = false;
						}
					}}
					beforeSearch={(value) => {
						let data;
						const newParams = { ...value };
						const { antiEpidemic } = newParams;
						if (antiEpidemic) {
							data = antiEpidemic.split(',').length == 2 ? '' : antiEpidemic;
						}
						const { pageNum, pageSize, sortList } = newParams;
						if (newParams.startTime || newParams.endTime) {
							newParams[timeKey] = [newParams.startTime, newParams.endTime];
							delete newParams.startTime;
							delete newParams.endTime;
						}
						delete newParams.pageNum;
						delete newParams.pageSize;
						delete newParams.sortList;
						for (let key in newParams) {
							if (Array.isArray(newParams[key])) {
								newParams[key] = `${moment(newParams[key][0]).startOf('day').valueOf()},${moment(
									newParams[key][1],
								)
									.endOf('day')
									.valueOf()}`;
							}
							newParams[key.split('&')[1]] = newParams[key];
							delete newParams[key];
						}

						const params = {
							...newParams,
							antiEpidemic: data ? data : undefined,
						};
						const printTimeData = (printTimeRef.current || []).map((item: Record<string, any>) => ({
							...item,
							value: newParams && newParams[item.field],
						}));
						printTimeRef.current = printTimeData;
						return { pageNum, pageSize, params, templateId, sortList };
					}}
					setRows={(res) => {
						let result: StatisticController.PaginationResult = {};
						let singleResult: StatisticController.singleResult[] = [];
						let singleResultcopy: StatisticController.singleResult[] = [];
						let summarycopy: string;

						res.data.forEach((item: StatisticController.QueryListRecord) => {
							if (item.paginationResult) {
								result = item.paginationResult;
							}
							if (item.textResult) {
								if (item.textResult[0].split(';').length === 1) {
									let titlearr = item.textResult[0].split('￥');

									setSummarytitle(titlearr[0]);
									setSummary(titlearr[1]);
									summarycopy = titlearr[1];
								} else {
									let titlearryi = item.textResult[0].split(';')[0].split(':');
									setColumnName(titlearryi[0]);
									setColumNum(titlearryi[1]);

									let titlearr = item.textResult[0].split(';')[1].split('￥');
									setSummarytitle(titlearr[0]);
									setSummary(titlearr[1]);
									summarycopy = titlearr[1];
								}
								if (item.textResult[0].search(';') < 0) {
									setSummary(item.textResult[0]);
									setSummarytitle('');
									summarycopy = item.textResult[0];
								}
							}
							if (
								code === 'inbound_summary' ||
								code === 'invoicedSummary' ||
								code === 'unpaidSummarySummary'
							) {
								let type = tableColumns[1].dataIndex;
								let typetwo = tableColumns[2].dataIndex;
								singleResultcopy.push({
									[type]: '合计金额',
									[typetwo]: summarycopy && summarycopy.split('￥')[1],
								});
								const list: any =
									singleResultcopy && singleResultcopy.length ? singleResultcopy : result.rows;
								setResultDatasum(list);
							}
							if (item.singleResult && item.singleResult.length) {
								singleResult = item.singleResult;
								singleResultcopy = [...item.singleResult];
							}
						});
						if (result?.rows?.length === 0) {
							setSummary(undefined);
						}
						const data: any = singleResult && singleResult.length ? singleResult : result.rows;
						setResultData(data);
						return singleResult && singleResult.length ? singleResult : result;
					}}
					headerTitle={
						<div className='flex flex-between'>
							<div className='tableTitle'>
								{summary && (
									<div className='tableTitle'>
										<span className='tableAlert'>
											{summary && !summarytitle ? (
												<div>{summary}</div>
											) : (
												<>
													<ExclamationCircleFilled
														style={{
															color: CONFIG_LESS['@c_starus_await'],
															marginRight: '8px',
															fontSize: '12px',
														}}
													/>

													<span className='consumeCount'>
														{columnName && columnName + ':'}{' '}
														{columNum && <span className='titlecollect'>{columNum},</span>}{' '}
														{summarytitle}￥ <span className='titlecollect'>{summary}</span>
													</span>
												</>
											)}
										</span>
									</div>
								)}
							</div>
						</div>
					}
					toolBarRender={() => [
						printTypes && printTypes === 'triple_printing' && printCode && access[printCode] && (
							<PrintCollectTarget
								btnName='三联打印'
								headDataList={printTimeRef.current || []}
								moduleName={moduleName} // 模块名称
								isVertical={false} // 是否纵向打印
								isBillsInThreeParts={true} // 是否三联打印
								printType // 按钮类型
								printTypeDisabled={!isExportFile} // 打印按钮是否禁用
								columns={tableColumns.slice(1)} // 打印列
								resultData={resultDatasum.length ? resultDatasum : resultData} // 打印数据
							/>
						),
						printTypes && printTypes === 'a4_print' && printCode && access[printCode] && (
							<PrintTarget
								headDataList={printTimeRef.current || []}
								moduleName={moduleName} // 模块名称
								isVertical={!(printType === 'transverse')} // 是否纵向打印
								printType // 按钮类型
								printTypeDisabled={!isExportFile} // 打印按钮是否禁用
								columns={tableColumns} // 打印列
								resultData={resultData} // 打印数据
							/>
						),
						exportCode && access[exportCode] && (
							<ExportFile
								data={{
									filters: { ...getSearchDate() },
									link: exportUrl,
									getForm: getSearchDate,
									method: 'post',
								}}
								disabled={!isExportFile}
							/>
						),
					]}
					tableRef={tableRef}
					pagination={pagination}
				/>
			)}
		</Spin>
	);
};
export default PageTable;
