import type { FormSchema } from '@ant-design/pro-form/lib/components/SchemaForm';
import type { TablePaginationConfig, TableProps } from 'antd/es/table';
import type { FilterValue, SorterResult, SortOrder } from 'antd/es/table/interface';
import type { ProColumns, ProTableAction, ProTableProps } from './typings';

import SchemaForm from '@/components/SchemaForm';
import Table from '@ant-design/pro-table';
import { Card, Divider, Empty, Pagination, Spin, Form } from 'antd';
import classNames from 'classnames';
import { isEqual, omit, throttle, pick } from 'lodash';
import moment from 'moment';
import React, {
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';

import './proTable.less';

export type { ProTableProps, ProColumns, ProTableAction };

export const widthMap = {
	XXXS: 60,
	XXS: 80,
	XS: 100,
	S: 120,
	M: 140,
	L: 160,
	XL: 180,
	XXL: 200,
	XXXL: 220,
};

const ProTable = <
	T extends Record<string, any>,
	U extends Record<string, any> = Record<string, any>,
>({
	noPadding,
	customStyle,
	striped,
	beforeSearch,
	params: nextParams,
	dataSource: initDataSource,
	pagination: paginationConfig,
	columns: cols,
	api,
	request: _request,
	search: _search,
	searchConfig,
	dateFormat: nextDateFormat,
	paramsToString: nextParamsToString,
	tableRef,
	scroll,
	options,
	columnsWidth,
	requestCompleted,
	beforeFetch,
	loadConfig,
	onReset,
	onFinish,
	setRows,
	beforeOnReset,
	hasRequired,
	searchKey,
	extraHeight: extraScrollHeight = 0,
	onChange,
	indexKey,
	renderSummary,
	columnEmptyText,
	...props
}: ProTableProps<T, U>) => {
	const tableBoxKeyRef = useRef<number>(Date.now());
	const [dataSource, setDataSource] = useState<T[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const searchParamsRef = useRef<Record<string, any>>({});
	const prevParamsRef = useRef<Record<string, any> | undefined>();
	const [prevDateFormat, setPrevDateFormat] = useState<Record<string, any> | undefined>();
	const [scrollY, setScrollY] = useState<number | string>();
	const [pagination, setPagination] = useState<TablePaginationConfig>(
		paginationConfig || { pageSize: 20, current: 1, showSizeChanger: true },
	);
	const paginationRef = useRef<TablePaginationConfig>(
		paginationConfig || { pageSize: 20, current: 1, showSizeChanger: true },
	);
	// 用于排序提交缓存
	const sortedInfoRef = useRef<SorterResult<Record<string, any>>>({});
	// 用于在排序后不提交请求时缓存
	const cacheSortedInfoRef = useRef<SorterResult<Record<string, any>>>({});
	// 用户触发排序更新回显
	const [cacheSortedInfo, setCacheSortedInfo] = useState<SorterResult<Record<string, any>>>({});
	// 用于过滤提交缓存
	const filteredInfoRef = useRef<Record<string, FilterValue | null>>({});
	// 用于在过滤后不提交请求时缓存
	const cacheFilteredInfoRef = useRef<Record<string, FilterValue | null>>({});
	// 用户触发过滤更新回显
	const [cacheFilteredInfo, setCacheFilteredInfo] = useState<SorterResult<Record<string, any>>>({});
	const [pager, setPager] = useState<Pager>({
		pageNum: 0,
		pageSize: 10,
		totalCount: 0,
	});
	const [finalParams, setFinalParams] = useState<Record<string, any>>({});
	const [requestOnload] = useState<boolean | undefined>((loadConfig || {}).request !== false);
	const [sortOnload] = useState<boolean | undefined>((loadConfig || {}).sort !== false);
	const [filterOnload] = useState<boolean | undefined>((loadConfig || {}).filter !== false);
	const [resetOnload] = useState<boolean | undefined>((loadConfig || {}).reset !== false);
	const [extraHeight, setExtraHeight] = useState<number>(0);
	const isLoadedRef = useRef<boolean>(false);
	const isFirstLoad = useRef<boolean>(true);
	const fetchTimerRef = useRef<NodeJS.Timeout>();
	const paramsRef = useRef<Record<string, any>>({});
	const dataLenRef = useRef<number>(0);
	const initRequestRef = useRef<NodeJS.Timeout | null>();

	// 获取form
	const [innerForm] = Form.useForm();
	const { form: outerForm } = searchConfig || {};
	const currentForm = useMemo(() => {
		return outerForm || innerForm;
	}, [innerForm, outerForm]);

	// 获取默认列宽度
	const baseColumsWidth = useMemo(() => {
		return typeof columnsWidth === 'number'
			? columnsWidth < 60
				? 60
				: columnsWidth
			: (columnsWidth && widthMap[columnsWidth]) || 80;
	}, [columnsWidth]);

	// 处理参数
	const transformParams = useCallback(() => {
		const currentParams: Record<string, any> = {
			...searchParamsRef.current,
			...(prevParamsRef.current || {}),
		};

		// 分页处理
		if (paginationConfig !== false) {
			const { current, pageSize = 20 } = paginationRef.current;
			currentParams.pageNum = (current || 1) - 1;
			currentParams.pageSize = pageSize;
		}

		// 需要转化成字符串的字段处理
		if (nextParamsToString) {
			nextParamsToString.map((key) => {
				const params = currentParams[key];
				if (params !== undefined && params !== null && !isNaN(params)) {
					currentParams[key] = params.toString();
				}
			});
		}

		// 日期date-picker-range处理
		if (prevDateFormat) {
			Object.keys(currentParams).forEach((key) => {
				const formatItem = prevDateFormat[key];
				const date = currentParams[key];
				if (formatItem && date && date.length > 0) {
					const {
						startKey,
						endKey,
						formatFn,
						type = 'number',
						format = 'yyyy-MM-dd HH:mm:ss',
					} = formatItem;
					const [startDate, endDate] = date;
					// 如果有格式化日期函数则优先处理
					if (typeof formatFn === 'function') {
						currentParams[startKey] = formatFn(startKey, startDate);
						currentParams[endKey] = formatFn(endKey, endDate);
					} else {
						currentParams[startKey] =
							type === 'number' ? moment(startDate).valueOf() : moment(startDate).format(format);
						currentParams[endKey] =
							type === 'number'
								? moment(endDate).endOf('day').valueOf()
								: moment(endDate).endOf('day').format(format);
					}
					delete currentParams[key];
				}
			});
		}

		// 排序处理
		// 如果需要支持多列排序处理请参考官方案例 https://ant.design/components/table-cn/#components-table-demo-multiple-sorter
		if (sortedInfoRef.current.columnKey && sortedInfoRef.current.order) {
			currentParams.sortList = [
				{
					sortName: sortedInfoRef.current.columnKey,
					desc: sortedInfoRef.current.order === 'descend',
				},
			];
		}

		// 过滤处理
		const filteredData = filteredInfoRef.current;
		Object.keys(filteredData).forEach((key) => {
			if (Array.isArray(filteredData[key]) && (filteredData[key] || []).length > 0) {
				currentParams[key] = filteredData[key];
			}
		});

		return currentParams;
	}, [prevDateFormat, nextParamsToString]);

	// 请求逻辑处理
	const fetchList = useCallback(() => {
		if (typeof api !== 'function') {
			return;
		}

		if (fetchTimerRef.current) {
			clearTimeout(fetchTimerRef.current);
		}

		fetchTimerRef.current ===
			setTimeout(async () => {
				let params: Record<string, any> = transformParams();

				// 过滤参数函数
				if (typeof beforeSearch === 'function') {
					params = beforeSearch(params);
				}

				// 请求拦截，如果校验失败的话可以拦截掉
				if (typeof beforeFetch === 'function') {
					const r = await beforeFetch(params);
					if (!r) {
						return;
					}
				}

				setLoading(true);
				setFinalParams(params);

				try {
					const res = await api(params as Pager & Record<string, any>);
					setLoading(false);

					if (res) {
						if (res.code === 0) {
							const result = typeof setRows === 'function' ? setRows(res) : res.data;
							const { rows, ...data } = result;

							setDataSource([]);
							setDataSource(rows);
							setPager(data);

							if (typeof requestCompleted === 'function') {
								requestCompleted(rows, params, result);
							}
						} else {
							setPager((p) => ({
								...p,
								pageNum: 0,
								totalCount: 0,
							}));
							setDataSource([]);

							if (typeof requestCompleted === 'function') {
								requestCompleted([], params, {});
							}
						}
					}
				} catch (e) {
					setLoading(false);
				}
			}, 10);
	}, [api, beforeSearch, beforeFetch, transformParams, setRows, requestCompleted]);

	// 设置传入的参数，通过记录上一次的参数与props.params对比，防止不停的触发更新
	useEffect(() => {
		if (initRequestRef.current) {
			clearTimeout(initRequestRef.current);
			initRequestRef.current = null;
		}
		initRequestRef.current = setTimeout(() => {
			if (
				((requestOnload === false && isLoadedRef.current) || requestOnload) &&
				!isEqual(prevParamsRef.current, nextParams)
			) {
				prevParamsRef.current = nextParams;
				fetchList();
			}
		}, 0);
	}, [requestOnload, nextParams]);

	// 默认首次加载，如果requestOnload为false则不首次加载
	useEffect(() => {
		if (initRequestRef.current) {
			clearTimeout(initRequestRef.current);
			initRequestRef.current = null;
		}

		if (!isEqual(prevParamsRef.current, nextParams)) {
			prevParamsRef.current = nextParams;
		}

		initRequestRef.current = setTimeout(() => {
			if (requestOnload === false && !isLoadedRef.current) {
				isLoadedRef.current = true;
				return;
			}
			isFirstLoad.current = false;
			fetchList();
		}, 0);
	}, [requestOnload]);

	// 原理同上
	useEffect(() => {
		if (!isEqual(prevDateFormat, nextDateFormat)) {
			setPrevDateFormat(nextDateFormat);
		}
	}, [prevDateFormat, nextDateFormat]);

	// 分页、排序、过滤改变回调
	const handleChange: TableProps<T>['onChange'] = useCallback(
		(currentPagination, filters, sorter, extra) => {
			const { action } = extra || {};
			if (typeof onChange === 'function') {
				onChange(currentPagination, filters, sorter, extra);
			}
			if (action === 'sort') {
				if (sortOnload) {
					if (searchKey) {
						paramsRef.current = { ...paramsRef.current, sortedInfo: { ...sorter } };
						sessionStorage.setItem(
							'searchParams',
							JSON.stringify({ [searchKey]: paramsRef.current }),
						);
					}

					paginationRef.current = { ...pagination, current: 1 };
					setPagination({ ...paginationRef.current });
					sortedInfoRef.current = sorter;
					fetchList();
				}
				cacheSortedInfoRef.current = { ...sorter };
				setCacheSortedInfo({ ...sorter });
			} else if (action === 'filter') {
				if (filterOnload) {
					if (searchKey) {
						paramsRef.current = { ...paramsRef.current, filteredInfo: { ...filters } };
						sessionStorage.setItem(
							'searchParams',
							JSON.stringify({ [searchKey]: paramsRef.current }),
						);
					}

					filteredInfoRef.current = { ...filters };
					paginationRef.current = { ...pagination, current: 1 };
					setPagination({ ...paginationRef.current });
					fetchList();
				}
				cacheFilteredInfoRef.current = { ...filters };
				setCacheFilteredInfo({ ...filters });
			} else if (action === 'paginate') {
				if (pagination.pageSize !== currentPagination.pageSize) {
					currentPagination.current = 1;
				}
				if (searchKey) {
					paramsRef.current = {
						...paramsRef.current,
						pagination: { ...pick(currentPagination, ['pageSize', 'current']), searchKey },
					};
					sessionStorage.setItem(
						'searchParams',
						JSON.stringify({ [searchKey]: paramsRef.current }),
					);
				}
				paginationRef.current = { ...currentPagination };
				setPagination({ ...currentPagination });
				fetchList();
			}
		},
		[sortOnload, pagination, filterOnload, onChange, fetchList],
	);

	// 有统计行的时候点击分页回调
	const onPaginationChange = useCallback(
		(current: number, pageSize: number) => {
			handleChange(
				{ ...pagination, current, pageSize },
				{},
				{},
				{
					action: 'paginate',
					currentDataSource: [],
				},
			);
		},
		[pagination, handleChange],
	);

	// 点击查询处理
	const handleFinish: FormSchema['onFinish'] = useCallback(
		async (values) => {
			if (!sortOnload || resetOnload === false) {
				sortedInfoRef.current = { ...cacheSortedInfoRef.current };
				paramsRef.current = { ...paramsRef.current, sortedInfo: { ...sortedInfoRef.current } };
			}

			if (!filterOnload || resetOnload === false) {
				paramsRef.current = { ...paramsRef.current, filteredInfo: { ...filteredInfoRef.current } };
				filteredInfoRef.current = { ...cacheFilteredInfoRef.current };
			}

			if (searchKey) {
				paramsRef.current = { ...paramsRef.current, form: { ...values } };
				sessionStorage.setItem('searchParams', JSON.stringify({ [searchKey]: paramsRef.current }));
			}

			isFirstLoad.current = false;

			if (typeof onFinish === 'function') {
				onFinish();
			}

			setPagination((p) => {
				if (!(p as any).searchKey) {
					p.current = 1;
				} else {
					delete (p as any).searchKey;
				}
				paginationRef.current = { ...p };
				if (searchKey) {
					paramsRef.current = {
						...paramsRef.current,
						pagination: { ...pick(paginationRef.current, ['pageSize', 'current']) },
					};
					sessionStorage.setItem(
						'searchParams',
						JSON.stringify({ [searchKey]: paramsRef.current }),
					);
				}
				return { ...p };
			});
			searchParamsRef.current = { ...values };
			fetchList();
		},
		[sortOnload, resetOnload, filterOnload, fetchList],
	);

	// 点击重置处理
	const handleReset = useCallback(async () => {
		setDataSource([]);
		setPager({ pageNum: 0, pageSize: 10, totalCount: 0 });
		await currentForm?.resetFields();
		if (typeof beforeOnReset === 'function') {
			await beforeOnReset(currentForm);
		}
		isFirstLoad.current = false;
		cacheSortedInfoRef.current = {};
		setCacheSortedInfo({});
		cacheFilteredInfoRef.current = {};
		setCacheFilteredInfo({});
		if (resetOnload !== false) {
			sortedInfoRef.current = {};
			filteredInfoRef.current = {};
			// 兼顾有initialValue的情况
			const values = currentForm.getFieldsValue();
			setPagination((p) => {
				paginationRef.current = { ...p, current: 1 };
				if (searchKey) {
					paramsRef.current = {
						...paramsRef.current,
						pagination: { ...pick(paginationRef.current, ['pageSize', 'current']) },
					};
					sessionStorage.setItem(
						'searchParams',
						JSON.stringify({ [searchKey]: paramsRef.current }),
					);
				}
				return { ...p, current: 1 };
			});
			searchParamsRef.current = { ...values };
			fetchList();

			if (searchKey) {
				paramsRef.current = { ...paramsRef.current, form: { ...values } };
				sessionStorage.setItem('searchParams', JSON.stringify({ [searchKey]: paramsRef.current }));
			}
		}
		if (typeof onReset === 'function') {
			onReset();
		}
	}, [beforeOnReset, onReset, resetOnload]);

	// 处理缓存数据
	useEffect(() => {
		let searchParamsCache: any = sessionStorage.getItem('searchParams');

		if (searchKey && searchParamsCache && searchParamsCache !== '{}') {
			searchParamsCache = { ...JSON.parse(searchParamsCache || '{}') };
			if (!searchParamsCache[searchKey]) {
				return;
			}
			const formValues = searchParamsCache[searchKey].form || {};
			const cPagination = searchParamsCache[searchKey].pagination;
			const cSortedInfo = searchParamsCache[searchKey].sortedInfo;
			const cFilteredInfo = searchParamsCache[searchKey].filteredInfo;

			searchParamsRef.current = { ...formValues };
			setPagination((p) => {
				paginationRef.current = { ...p, ...cPagination };
				return { ...p, ...cPagination };
			});
			sortedInfoRef.current = { ...sortedInfoRef.current, ...cSortedInfo };
			cacheSortedInfoRef.current = { ...sortedInfoRef.current };
			setCacheSortedInfo({ ...sortedInfoRef.current });
			filteredInfoRef.current = { ...filteredInfoRef.current, ...cFilteredInfo };
			cacheFilteredInfoRef.current = { ...filteredInfoRef.current };
			setCacheFilteredInfo({ ...filteredInfoRef.current });

			setTimeout(() => {
				searchConfig?.columns.forEach((item: Record<string, any>) => {
					if (
						item.fieldProps &&
						typeof item.fieldProps.onChange === 'function' &&
						formValues[item.dataIndex]
					) {
						item.fieldProps.onChange(formValues[item.dataIndex]);
					}
					if (item.valueType === 'dateRangeWithTag' && formValues[item.dataIndex]) {
						formValues[item.dataIndex] = formValues[item.dataIndex].map((item: string) =>
							moment(item),
						);
					}
				});
				setTimeout(() => {
					currentForm.setFieldsValue({ ...formValues });
					currentForm.submit();
				}, 0);
			}, 0);
		}
	}, []);

	// 暴露方法
	useImperativeHandle(tableRef, () => ({
		reload: fetchList,
		getDataSource: () => dataSource,
		getParams: () => finalParams,
		onReset: handleReset,
		setDataSource,
		submit: async () => {
			const values = await currentForm.getFieldsValue();
			handleFinish(values);
		},
	}));

	useEffect(() => {
		if (extraHeight !== extraScrollHeight) {
			setExtraHeight(extraScrollHeight);
		}
	}, [extraScrollHeight, extraHeight]);

	const resetHeight = useCallback(() => {
		const { innerHeight } = window;
		const layoutEl = document.querySelector('.ant-layout-symbol-cls');
		const layoutHeaderEl = document.querySelector('header.ant-layout-header');
		const tableBox = document.querySelector(`#antTableBox-${tableBoxKeyRef.current}`);
		const tableBody =
			tableBox?.querySelector(`.ant-table-body`) || tableBox?.querySelector(`.ant-table-tbody`);
		const layoutFooterEl = layoutEl?.querySelector('.ant-footer-symbol-cls');
		const layoutContentEl = layoutEl?.querySelector('.ant-layout-custom-content-cls');
		const layoutHeaderHeight = layoutHeaderEl?.clientHeight || 64;
		const layoutFooterHeight = layoutFooterEl?.clientHeight || 0;
		// 页面内容实际高度（不包括layout-header和layout-footer）
		const layoutContentHeight = layoutContentEl?.clientHeight || 0;
		const tableBodyHeight = tableBody?.clientHeight || 0;
		const otherHeight = layoutContentHeight - tableBodyHeight;
		const scrollHeight =
			innerHeight - otherHeight - extraHeight - layoutFooterHeight - layoutHeaderHeight;
		setScrollY(scrollHeight <= 300 ? 300 : scrollHeight);
	}, [extraHeight]);

	useEffect(() => {
		const scrollBox: HTMLDivElement = document.querySelector(
			`#tableScrollBox-${tableBoxKeyRef.current}`,
		) as HTMLDivElement;
		const handleScroll = throttle(resetHeight, 100);
		if (!scroll || !scroll.y) {
			scrollBox?.scrollTo(0, scrollBox?.scrollHeight - scrollBox?.offsetHeight);
			scrollBox?.addEventListener('scroll', handleScroll);
		}
		return () => scrollBox?.removeEventListener('scroll', handleScroll);
	}, [scroll, dataSource, resetHeight]);

	useEffect(() => {
		const handleResize = throttle(resetHeight, 100);
		if (!scroll || !scroll.y) {
			window.addEventListener('resize', handleResize);
		}
		return () => window.removeEventListener('resize', handleResize);
	}, [scroll, dataSource, resetHeight]);

	const columns: ProColumns<T>[] = useMemo(() => {
		const newCols = (cols || []).map((col) => {
			const key = (col.key || col.dataIndex) as string;
			if (typeof col.width === 'number') {
				if (col.width <= 0) {
					col.width = baseColumsWidth;
				}
			} else if (typeof col.width === 'string' && widthMap[col.width]) {
				col.width = widthMap[col.width];
			} else if (!col.width) {
				col.width = baseColumsWidth;
			}
			const filterOptions = col.filters
				? {
						key,
						filters: col.filters !== undefined ? col.filters : !!col.valueEnum,
						filteredValue: cacheFilteredInfo[key] || null,
				  }
				: {};
			const sorterOptions =
				col.sorter || col.sortOrder
					? {
							key,
							sortOrder: (col.sorter
								? cacheSortedInfo.columnKey === key && cacheSortedInfo.order
								: false) as SortOrder,
					  }
					: {};
			if (typeof renderSummary === 'function' && indexKey) {
				const rt = col.renderText;
				const rr = col.render;
				if (indexKey === key) {
					if (typeof rt === 'function') {
						col.renderText = (text, record, index, action) => {
							if (index === dataLenRef.current) {
								return '-';
							}
							return rt(text, record, index, action);
						};
					} else if (typeof rr === 'function') {
						col.render = (text, record, index, action, schema) => {
							if (index === dataLenRef.current) {
								return '-';
							}
							return rr(text, record, index, action, schema);
						};
					} else {
						col.renderText = (text, _record, index) => {
							if (index === dataLenRef.current) {
								return '-';
							}
							return text || ' ';
						};
					}
				} else {
					if (typeof rt === 'function') {
						col.renderText = (text, record, index, action) => {
							if (index === dataLenRef.current) {
								return text || ' ';
							}
							return rt(text, record, index, action);
						};
					} else if (typeof rr === 'function') {
						col.render = (text, record, index, action, schema) => {
							const t: React.ReactElement = text as React.ReactElement;
							if (index === dataLenRef.current) {
								return typeof t === 'string'
									? t !== '-'
										? t
										: ' '
									: t && t.props && t.props.chidren && t.props.chidren !== '-'
									? text
									: ' ';
							}
							return rr(text, record, index, action, schema);
						};
					} else {
						col.renderText = (text, _record, index) => {
							if (index === dataLenRef.current) {
								return text || ' ';
							}
							return text !== undefined && text !== null ? text : columnEmptyText || ' ';
						};
					}
				}
			}
			return {
				...col,
				...sorterOptions,
				...filterOptions,
			};
		});
		return newCols;
	}, [cols, cacheSortedInfo, cacheFilteredInfo, baseColumsWidth, dataSource, initDataSource]);

	// 根据columns计算scroll.x，可以通过props.sroll.x覆盖
	const scrollX = useMemo(() => {
		return columns.reduce((sum, col) => {
			return (
				sum +
				(widthMap[col.width as string]
					? widthMap[col.width as string]
					: typeof col.width === 'number'
					? col.width
					: 60)
			);
		}, 0);
	}, [columns]);

	const finalDataSource = useMemo(() => {
		const data = typeof api === 'function' ? dataSource : initDataSource || [];
		dataLenRef.current = data.length;
		if (typeof renderSummary === 'function') {
			const summaryItem = renderSummary(data as T[], pager);
			if (summaryItem && typeof summaryItem === 'object') {
				return [...data, summaryItem];
			}
		}
		return [...data];
	}, [dataSource, initDataSource, renderSummary, api, pager]);

	return (
		<div
			className='custom-pro-table-container'
			style={{ position: 'relative' }}
			id={`antTableBox-${tableBoxKeyRef.current}`}>
			<div
				id={`tableScrollBox-${tableBoxKeyRef.current}`}
				className='custom-table-scroll-box'
				style={{
					position: 'absolute',
					zIndex: -10000,
					height: '100%',
					width: '20px',
					backgroundColor: 'transparent',
					overflowY: 'scroll',
				}}>
				<div
					className='scroll-box-content'
					style={{ height: '150%' }}
				/>
			</div>
			{searchConfig && (
				<Card
					bordered={searchConfig.bordered === true}
					bodyStyle={
						noPadding !== false && customStyle !== false && searchConfig.submitter !== false
							? { padding: '8px 180px 40px 5px' }
							: { padding: 8 }
					}
					className={classNames(
						customStyle !== false && 'custom-table-query-box',
						hasRequired && 'has-required',
						customStyle === false || (searchConfig.submitter === false && 'no-search-btn'),
					)}>
					<SchemaForm<U>
						span={8}
						// @ts-ignore
						defaultCollapsed={false}
						hasRequired={hasRequired}
						{...omit(searchConfig, 'bordered')}
						form={currentForm}
						submitter={
							searchConfig.submitter === false
								? false
								: {
										onReset: handleReset,
										...((searchConfig.submitter || {}) as Record<string, any>),
										render: (submitterProps: any, dom: any) => {
											const { render } = searchConfig.submitter || {};

											return typeof render === 'function'
												? render(submitterProps as any, [...dom.reverse()])
												: [...dom.reverse()];
										},
										submitButtonProps: {
											...((searchConfig.submitter || {}).submitButtonProps || {}),
											loading,
										},
								  }
						}
						onFinish={handleFinish}
						layoutType='QueryFilter'
					/>
				</Card>
			)}
			<Spin spinning={props.loading || loading}>
				<Table<T, U>
					rowClassName={
						striped !== false
							? (_, index) => ['table-odd-row', 'table-even-row'][index % 2]
							: undefined
					}
					locale={{
						emptyText: (
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={
									isFirstLoad.current ? (loadConfig || {}).loadText || '请点击查询按钮' : '暂无数据'
								}
							/>
						),
					}}
					tableLayout='fixed'
					{...props}
					className={classNames(
						'proTable',
						customStyle !== false && searchConfig?.columns && 'custom-table-box',
						noPadding !== false && 'no-padding-table',
						typeof renderSummary === 'function' && indexKey ? 'render-summary-table' : '',
						props.className,
					)}
					options={{
						reload: false,
						...(options || {}),
					}}
					scroll={{
						x: scrollX,
						y: scrollY,
						...(scroll || {}),
					}}
					search={false}
					onChange={handleChange}
					columns={columns}
					dataSource={finalDataSource as T[]}
					loading={false}
					pagination={
						paginationConfig === false || (typeof renderSummary === 'function' && indexKey)
							? false
							: {
									showSizeChanger: true, // 默认为true
									...pagination,
									total: pager.totalCount,
									current: (pager.pageNum || 0) + 1,
									style: {
										margin: 0,
										padding: '16px 0',
										...(pagination || {}).style,
									},
							  }
					}
					tableAlertOptionRender={() => {
						return props.tableAlertOptionRender ? props.tableAlertOptionRender : false;
					}}
					tableAlertRender={({ selectedRowKeys }) => {
						return props.tableAlertOptionRender ? (
							<span>已选 {selectedRowKeys.length} 项</span>
						) : (
							false
						);
					}}
					columnEmptyText={columnEmptyText}
				/>
				{paginationConfig !== false &&
					typeof renderSummary === 'function' &&
					indexKey &&
					finalDataSource.length > 1 && (
						<>
							<Pagination
								size='small'
								showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`}
								showSizeChanger
								{...pagination}
								style={{
									margin: 0,
									padding: '16px 0',
									...(pagination || {}).style,
								}}
								className='ant-table-pagination ant-table-pagination-right'
								total={pager.totalCount}
								onChange={onPaginationChange}
							/>
							<Divider style={{ margin: 0, borderTopColor: CONFIG_LESS['@bd_D9D9D9'] }} />
						</>
					)}
			</Spin>
		</div>
	);
};

export default ProTable;
