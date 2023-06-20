import SchemaForm from '@/components/SchemaForm';
import type { ProFormInstance } from '@ant-design/pro-form';
import type { FormSchema } from '@ant-design/pro-form/lib/components/SchemaForm';
import Table from '@ant-design/pro-table';
import { Card, Divider, Empty, Pagination, Spin } from 'antd';
import type { TablePaginationConfig, TableProps } from 'antd/es/table';
import type { FilterValue, SorterResult, SortOrder } from 'antd/es/table/interface';
import classNames from 'classnames';
import { isEqual, omit, pick, throttle } from 'lodash';
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
import type { ProColumns, ProTableAction, ProTableProps } from './typings';

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
	span,
	isTbaleBespread,
	defaultCollapsed = false,
	...props
}: ProTableProps<T, U>) => {
	const tableBoxKeyRef = useRef<number>(Date.now() + Math.floor(Math.random() * 10000));
	const [dataSource, setDataSource] = useState<T[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [searchParams, setSearchParams] = useState<Record<string, any>>({});
	const [prevParams, setPrevParams] = useState<Record<string, any> | undefined>();
	const [prevDateFormat, setPrevDateFormat] = useState<Record<string, any> | undefined>();
	const [scrollX, setScrollX] = useState<number | string | true>('100%');
	const [scrollY, setScrollY] = useState<number | string>();
	const [reloadStatus, setReloadStatus] = useState<number>(1);
	const [pagination, setPagination] = useState<TablePaginationConfig>(
		paginationConfig || { pageSize: 20, current: 1, showSizeChanger: true },
	);
	const [sortedInfo, setSortedInfo] = useState<SorterResult<Record<string, any>>>({});
	const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
	const [cacheSortedInfo, setCacheSortedInfo] = useState<SorterResult<Record<string, any>>>({});
	const [cacheFilteredInfo, setCacheFilteredInfo] = useState<Record<string, FilterValue | null>>(
		{},
	);
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
	const [collapsed, setCollapsed] = useState<boolean>(true);
	const [finishFailedFrequency, setFinishFailedFrequency] = useState<number>(0); // 验证失败的次数
	const isLoadedRef = useRef<boolean>(false);
	const isFirstLoad = useRef<boolean>(true);
	const resetTimerRef = useRef<NodeJS.Timeout>();
	const formRef = useRef<ProFormInstance>();
	const paramsRef = useRef<Record<string, any> | undefined>({});
	const dataLenRef = useRef<number>(0);
	const { formRef: customFormRef } = searchConfig || {};
	const currentFormRef = useMemo(() => {
		return customFormRef ? customFormRef : formRef;
	}, [formRef, customFormRef]);
	const baseColumsWidth = useMemo(() => {
		return typeof columnsWidth === 'number'
			? columnsWidth < 60
				? 60
				: columnsWidth
			: (columnsWidth && widthMap[columnsWidth]) || 80;
	}, [columnsWidth]);

	const finalDataSource = useMemo(() => {
		const data = typeof api === 'function' ? dataSource || [] : initDataSource || [];
		dataLenRef.current = data.length;
		if (typeof renderSummary === 'function') {
			const summaryItem = renderSummary(data as T[], pager);
			if (summaryItem && typeof summaryItem === 'object') {
				return [...data, summaryItem];
			}
		}
		return [...data];
	}, [dataSource, initDataSource, renderSummary, api, pager]);

	const columns: ProColumns<T>[] = useMemo(() => {
		let calcScrollX = 0;

		const newCols = (cols || []).map((col) => {
			const key = (col.key || col.dataIndex) as string;
			if (typeof col.width === 'number') {
				if (col.width <= 0) {
					col.width = baseColumsWidth;
				}
				calcScrollX += col.width as number;
			} else if (typeof col.width === 'string' && widthMap[col.width]) {
				calcScrollX += widthMap[col.width];
				col.width = widthMap[col.width];
			} else if (!col.width) {
				col.width = baseColumsWidth;
				calcScrollX += widthMap[col.width as string];
			}
			const filterOptions =
				col.filters || col.valueEnum
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
		setScrollX(calcScrollX);
		return newCols;
	}, [
		cols,
		cacheSortedInfo,
		cacheFilteredInfo,
		baseColumsWidth,
		dataSource,
		initDataSource,
		dataLenRef.current,
	]);

	const handleChange: TableProps<T>['onChange'] = (
		currentPagination,
		filters,
		sorter,
		{ action, ...attr },
		...rest
	) => {
		setPager({
			pageNum: (currentPagination.current || 0) - 1,
			pageSize: currentPagination.pageSize || 0,
			totalCount: currentPagination.total,
		});
		if (typeof onChange === 'function') {
			onChange(currentPagination, filters, sorter, { action, ...attr }, ...rest);
		}
		if (action === 'sort') {
			if (sortOnload) {
				if (searchKey) {
					paramsRef.current = {
						...paramsRef.current,
						sortedInfo: { ...sorter, column: pick(sorter, ['order', 'columnKey']) },
					};
					sessionStorage.setItem(
						'searchParams',
						JSON.stringify({ [searchKey]: paramsRef.current }),
					);
				}

				setPagination({ ...pagination, current: 1 });
				setSortedInfo(sorter as SorterResult<Record<string, any>>);
			}
			setCacheSortedInfo(sorter as SorterResult<Record<string, any>>);
		} else if (action === 'filter') {
			if (filterOnload) {
				if (searchKey) {
					paramsRef.current = { ...paramsRef.current, filteredInfo: sorter };
					sessionStorage.setItem(
						'searchParams',
						JSON.stringify({ [searchKey]: paramsRef.current }),
					);
				}

				setFilteredInfo(filters);
				setPagination({ ...pagination, current: 1 });
			}
			setCacheFilteredInfo(filters);
		} else if (action === 'paginate') {
			if (pagination.pageSize !== currentPagination.pageSize) {
				currentPagination.current = 1;
			}
			if (searchKey) {
				paramsRef.current = {
					...paramsRef.current,
					pagination: { ...pick(currentPagination, ['pageSize', 'current']), searchKey },
				};
				sessionStorage.setItem('searchParams', JSON.stringify({ [searchKey]: paramsRef.current }));
			}

			setPagination(currentPagination);
		}
	};

	const onPaginationChange = (current: number, pageSize: number) => {
		handleChange(
			{ ...pagination, current, pageSize },
			{},
			{},
			{
				action: 'paginate',
				currentDataSource: [],
			},
		);
	};

	const handleFinish: FormSchema['onFinish'] = async (values) => {
		if (!sortOnload || resetOnload === false) {
			setSortedInfo(cacheSortedInfo);
			paramsRef.current = { ...paramsRef.current, sortedInfo };
		}

		if (!filterOnload || resetOnload === false) {
			paramsRef.current = { ...paramsRef.current, filteredInfo };
			setFilteredInfo(cacheFilteredInfo);
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

			if (searchKey) {
				paramsRef.current = {
					...paramsRef.current,
					pagination: { ...pick(p, ['pageSize', 'current']) },
				};
				sessionStorage.setItem('searchParams', JSON.stringify({ [searchKey]: paramsRef.current }));
			}
			return { ...p };
		});

		setSearchParams(values);
		setReloadStatus(reloadStatus + 1);
	};

	const handleReset = async () => {
		setDataSource([]);
		setPager({ pageNum: 0, pageSize: 10, totalCount: 0 });
		await currentFormRef.current?.resetFields();
		if (typeof beforeOnReset === 'function') {
			await beforeOnReset(currentFormRef.current);
		}
		isFirstLoad.current = false;
		setCacheSortedInfo({});
		setCacheFilteredInfo({});
		if (resetOnload !== false) {
			setSortedInfo({});
			setFilteredInfo({});
			// 兼顾有initialValue的情况
			const values = currentFormRef.current?.getFieldsValue();

			setPagination((p) => {
				if (searchKey) {
					paramsRef.current = {
						...paramsRef.current,
						pagination: { ...pick({ ...p, current: 1 }, ['pageSize', 'current']), searchKey },
					};
					sessionStorage.setItem(
						'searchParams',
						JSON.stringify({ [searchKey]: paramsRef.current }),
					);
				}
				return { ...p, current: 1 };
			});
			setSearchParams(values);
			setReloadStatus(reloadStatus + 1);

			if (searchKey) {
				paramsRef.current = { ...paramsRef.current, form: { ...values } };
				sessionStorage.setItem('searchParams', JSON.stringify({ [searchKey]: paramsRef.current }));
			}
		}
		if (typeof onReset === 'function') {
			onReset();
		}
	};

	// 处理缓存数据
	useEffect(() => {
		let searchParams: any = sessionStorage.getItem('searchParams');

		if (searchKey && searchParams && searchParams !== '{}') {
			searchParams = { ...JSON.parse(searchParams || '{}') };
			if (!searchParams[searchKey]) {
				return;
			}
			const formValues = searchParams[searchKey].form || {};
			const cPagination = searchParams[searchKey].pagination;
			const cSortedInfo = searchParams[searchKey].sortedInfo;
			const cFilteredInfo = searchParams[searchKey].filteredInfo;

			paramsRef.current = { ...searchParams[searchKey] };
			setPagination((p) => ({ ...p, ...cPagination }));
			setSortedInfo((s) => ({ ...s, ...cSortedInfo }));
			setCacheSortedInfo((s) => ({ ...s, ...cSortedInfo }));
			setFilteredInfo((f) => ({ ...f, cFilteredInfo }));
			setCacheFilteredInfo((f) => ({ ...f, cFilteredInfo }));

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
					currentFormRef.current?.setFieldsValue({ ...formValues });
					currentFormRef.current?.submit();
				}, 0);
			}, 0);
		}
	}, []);

	useEffect(() => {
		if (!isEqual(prevParams, nextParams)) {
			setPrevParams(nextParams);
		}
	}, [prevParams, nextParams]);

	useEffect(() => {
		if (!isEqual(prevDateFormat, nextDateFormat)) {
			setPrevDateFormat(nextDateFormat);
		}
	}, [prevDateFormat, nextDateFormat]);

	// 获取参数
	useEffect(() => {
		let currentParams: Record<string, any> = {
			...searchParams,
			...(prevParams || {}),
		};
		if (paginationConfig !== false) {
			const { current, pageSize = 20 } = pagination;
			currentParams.pageNum = (current || 1) - 1;
			currentParams.pageSize = pageSize;
		}
		if (nextParamsToString) {
			nextParamsToString.map((key) => {
				const params = currentParams[key];
				if (params) {
					currentParams[key] = params.toString();
				}
			});
		}
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
		if (sortedInfo.columnKey && sortedInfo.order) {
			currentParams.sortList = [
				{
					sortName: sortedInfo.columnKey,
					desc: sortedInfo.order === 'descend',
				},
			];
		}
		Object.keys(filteredInfo).forEach((key) => {
			if (Array.isArray(filteredInfo[key]) && (filteredInfo[key] as any)?.length > 0) {
				currentParams[key] = filteredInfo[key] as any;
			}
		});
		if (typeof beforeSearch === 'function') {
			currentParams = beforeSearch(currentParams);
		}
		if (!isEqual(currentParams, finalParams)) {
			setFinalParams(currentParams);
		}
	}, [
		prevParams,
		filteredInfo,
		pagination,
		prevDateFormat,
		searchParams,
		sortedInfo,
		beforeSearch,
		finalParams,
		nextParamsToString,
	]);

	const getList = useMemo(() => {
		return async (params: Record<string, any>) => {
			if (typeof api !== 'function') {
				return;
			}
			if (typeof beforeFetch === 'function') {
				const r = await beforeFetch(params);
				if (!r) {
					return;
				}
			}
			let res: any;
			setLoading(true);
			try {
				res = await api(params as Pager & Record<string, any>);
			} catch (e) {
				res = e;
			} finally {
				if (res && res.code !== 0) {
					setPager({
						...pager,
						pageNum: 0,
						totalCount: 0,
					});
					setDataSource([]);
					if (typeof requestCompleted === 'function') {
						requestCompleted([], params, {});
					}
				}
				setLoading(false);
			}
			if (res.code === 0) {
				const result = typeof setRows === 'function' ? setRows(res) : res.data;
				if (!result) {
					setDataSource([]);
					return;
				}
				const { rows, ...data } = result;

				if (result && result.length) {
					setDataSource(result);
				} else {
					setDataSource([]);
					setDataSource(rows);
				}
				setPager(data);
				if (typeof requestCompleted === 'function') {
					requestCompleted(rows, params, result);
				}
			}
		};
	}, [api]);

	useEffect(() => {
		if (resetTimerRef.current) {
			clearTimeout(resetTimerRef.current);
		}
		resetTimerRef.current = setTimeout(() => {
			// 默认首次加载，如果requestOnload为false则不首次加载
			if (requestOnload === false && !isLoadedRef.current) {
				isLoadedRef.current = true;
				return;
			}
			isFirstLoad.current = false;
			getList(finalParams);
		}, 10);
	}, [getList, reloadStatus, finalParams, requestOnload]);

	// 暴露方法
	useImperativeHandle(tableRef, () => ({
		reload: () => {
			setReloadStatus(reloadStatus + 1);
		},
		getDataSource: () => dataSource,
		getParams: () => finalParams,
		onReset: () => {
			handleReset();
		},
		setDataSource,
		submit: async () => {
			const values = await currentFormRef.current?.getFieldsValue();
			handleFinish(values);
		},
	}));

	useEffect(() => {
		if (extraHeight !== extraScrollHeight) {
			setExtraHeight(extraScrollHeight);
		}
	}, [extraScrollHeight, extraHeight]);
	// 获取指定父元素
	const getfatherElement = useCallback(
		(sonelement: HTMLElement | null | undefined, className: string) => {
			var fathertag = sonelement;
			for (var i = 0; i < 100; i++) {
				var fathertag = fathertag?.parentElement; //1级父节点
				if (fathertag?.className == className) {
					return fathertag;
				}
			}
			return null;
		},
		[],
	);
	const resetHeight = useCallback(() => {
		const { innerHeight } = window;
		const layoutEl = document.querySelector('.ant-layout-symbol-cls');
		const layoutHeaderEl = document.querySelector('header.ant-layout-header'); // layou顶部
		const layoutFooterEl = layoutEl?.querySelector('.ant-footer-symbol-cls'); // layou底部
		const tableBox = document.querySelector(`#antTableBox-${tableBoxKeyRef.current}`); // 整体proTable
		const pageTab = getfatherElement(tableBox as HTMLElement, 'main-page')?.querySelector(
			'.ant-tabs-nav',
		); // 头部Tab
		const searchForm = tableBox?.querySelector('.custom-table-query-box'); // 表单
		const tableBody =
			tableBox?.querySelector(`.ant-table-body`) || tableBox?.querySelector(`.ant-table-tbody`); //表格
		const tableAlert = tableBox?.querySelector('.ant-pro-table-alert'); // 表格发生勾选，多出的取消勾选栏
		const tableThead = tableBox?.querySelector('.ant-table-thead'); // 表格头部
		const tableToolbar = tableBox?.querySelector('.ant-pro-table-list-toolbar'); // 表格与表单之间的标题栏
		const tablePagination = tableBox?.querySelector('.ant-table-pagination'); // 表格分页器
		const layoutHeaderHeight = layoutHeaderEl?.clientHeight || 0;
		const layoutFooterHeight = layoutFooterEl?.clientHeight || 0;
		const pageTabHeight = pageTab?.clientHeight ? pageTab?.clientHeight + 3 : 0;
		const searchFormHeight = searchForm?.clientHeight ? searchForm?.clientHeight + 2 : 0;
		const tableAlertHeight = tableAlert?.clientHeight ? tableAlert?.clientHeight + 5 : 0;
		const tableTheadHeight = tableThead?.clientHeight || 0;
		const tableToolbarHeight = tableToolbar?.clientHeight || 0;
		const tablePaginationHeight = tablePagination?.clientHeight || 0;
		// 页面内容实际高度
		const contentHeight = innerHeight - layoutHeaderHeight - layoutFooterHeight - 22 - 40; // 这里的22是底部版本内容高度、40是面包屑高度
		// 最大滚动高度
		let scrollHeight =
			contentHeight -
			pageTabHeight -
			searchFormHeight -
			tableToolbarHeight -
			tableAlertHeight -
			tableTheadHeight -
			tablePaginationHeight -
			extraHeight -
			8; // 修正8px
		// 这里代码用于开启列表铺满
		if (!(scroll && scroll.y) && !isTbaleBespread && tableBody) {
			//@ts-ignore
			tableBody.style.height = scrollHeight + 'px';
			if (dataLenRef.current === 0 && !renderSummary) {
				//@ts-ignore
				tableBody.style.display = 'flex';
			} else {
				//@ts-ignore
				tableBody.style.display = 'block';
			}
		}
		setScrollY(scrollHeight <= 300 ? 300 : scrollHeight);
	}, [
		extraHeight,
		document.querySelector(`#antTableBox-${tableBoxKeyRef.current}`),
		isTbaleBespread,
		dataLenRef.current,
		renderSummary,
		scroll,
		collapsed,
		finishFailedFrequency,
	]);
	useEffect(() => {
		resetHeight();
	}, [resetHeight]);

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
						span={span || 8}
						// @ts-ignore
						defaultCollapsed={defaultCollapsed}
						onCollapse={(value: boolean) => {
							setCollapsed(value);
						}}
						hasRequired={hasRequired}
						{...omit(searchConfig, 'bordered')}
						formRef={currentFormRef}
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
						onFieldsChange={(changedValues) => {
							if (changedValues[0]?.errors?.length && changedValues[0].errors?.length > 0) {
								setTimeout(() => {
									setFinishFailedFrequency(finishFailedFrequency + 1);
								}, 300);
							}
						}}
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
					dataSource={finalDataSource as T[]} // 只有api不为函数的情况下才使用initDataSource
					loading={false}
					pagination={
						paginationConfig === false || (typeof renderSummary === 'function' && indexKey)
							? false
							: {
									showSizeChanger: true, // 默认为true
									...omit(pagination || {}, 'searchKey'),
									total: pager.totalCount,
									current: (pager.pageNum || 0) + 1,
									style: {
										margin: 0,
										padding: '16px 0',
										...(pagination || {}).style,
									},
									showQuickJumper: true,
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
								{...omit(pagination || {}, 'searchKey')}
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
