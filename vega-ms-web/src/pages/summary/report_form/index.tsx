/* eslint-disable no-unused-expressions */

import ExportFile from '@/components/ExportFile';
import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import api from '@/constants/api';
import { getDay, getUrlParam } from '@/utils';
import { DownOutlined, ExclamationCircleFilled, UpOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Card, Form, Menu, Row } from 'antd';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import { connect } from 'umi';
import {
	BackendSearchSelect,
	DateRange,
	DateRangePicker,
	EnumSelect,
	SearchInput,
	SearchRedio,
	SearchSelect,
	SingleSelect,
} from './fornItem';
import style from './index.less';
import { getList, getMenu, getSearch } from './service';

const TableList: React.FC<{}> = ({ global, ...props }) => {
	const docWidth = document.documentElement.clientWidth;
	const [list, setList] = useState([]);
	const [sortList, setSortList] = useState([]);
	const [total, setTotal] = useState(0);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [loading, setLoading] = useState<boolean>(false);
	const [showMore, setShowMore] = useState<boolean>(true);

	const [menuList, setMenuList] = useState([]);
	const [menuChildList, setMenuChildList] = useState([]);
	const [menuKey, setMenuKey] = useState('');
	const [menuName, setMenuName] = useState('');
	const [menuChildKey, setMenuChildKey] = useState('');
	const [menuChildName, setMenuChildName] = useState('');
	const [totalInfo, setTotalInfo] = useState('');
	const [searchStatus, setSearchStatus] = useState('');
	const [exportCheckboxField, setExportCheckboxField] = useState(null || '');
	const [exportCheckboxParam, setExportCheckboxParam] = useState(null || '');
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);

	const [searchList, setSearchList] = useState([]);
	const [columns, setColumns] = useState([]);
	const [sortedInfo, setSortedInfo] = useState({});
	const [tableInfoId, setTableInfoId] = useState<string>();
	const [form] = Form.useForm();

	const getSearchForm = () => {
		let formDate = form.getFieldsValue();
		for (let key in formDate) {
			searchList.forEach((item) => {
				// 时间范围 day
				if (item.field == key && ['date_range', 'date'].includes(item.type)) {
					if (formDate[key] && formDate[key].length > 0) {
						const start = getDay(formDate[key][0]);
						const end = getDay(formDate[key][1], 'end');
						formDate[key] = start + ',' + end;
					} else {
						formDate[key] = undefined;
					}
				}
				if (item.field == key && item.type == 'select') {
					if (Array.isArray(formDate[key])) {
						formDate[key] = formDate[key].join(',');
					}
				}
			});
			if (Array.isArray(formDate[key])) {
				formDate[key] = formDate[key].join(',');
			}
		}
		const params = {
			params: formDate,
		};
		return params;
	};

	const tableInfoIds = {
		statistic_department_material_goods: '88', // 科室物资-基础物资
		statistic_department_material_package: '89', // 科室物资-定数包
		statistic_department_material_surgical: '90', // 科室物资-手术套包
		statistic_put_on_shelf_detail: '91', // 上架明细
		statistic_smart_cabinet_repository_goods: '92', // 智能柜-物资
		statistic_smart_cabinet_repository_package: '93', // 智能柜-定数包
		statistic_smart_cabinet_repository_surgical: '94', // 智能柜-手术套包
		department_needs_material_state: '95', // 科室需求物资状态查询
		department_consume: '96', // 科室消耗明细报表
		repository_inbound: '97', // 入库明细报表
		repository_outbound: '98', // 科室入库明细报表
		statistic_goods_warehouse_stock: '99', // 物资库存导出
		purchase_plan_export: '100', // 采购计划单导出
		goods_supplier_query: '101', // 物资与配送商业关联查询
	};

	// 获取查询条件和表头
	const getSearchDate = async (id: string) => {
		const res = await getSearch(id);
		if (res && res.code === 0) {
			setSearchList(res.data.conditionList);
			setExportCheckboxParam(res.data.exportCheckboxParam);
			setExportCheckboxField(res.data.exportCheckboxField);
			setSelectedRowKeys([]);

			await res.data.resultList.map((item) => {
				if (item.type === 'pagination_table') {
					let col = cloneDeep(item.columns);
					col.unshift({
						title: '序号',
						dataIndex: 'index',
						key: 'index',
						align: 'center',
						render: (text, redord, index) => <span>{index + 1}</span>,
						width: 80,
					});
					const newCol = col.map((item) =>
						item.sorter
							? { ...item, sortOrder: sortedInfo.columnKey == item.key && sortedInfo.order }
							: { ...item },
					);
					setColumns(newCol);
					setTableInfoId(tableInfoIds[res.data.code]);
				}
			});
			getFormList({ pageNum: 0, templateId: id });
		} else {
			setTableInfoId('');
		}
	};

	// 获取面包屑数据
	const getMenuDate = async (code = '') => {
		const res = await getMenu();
		if (res && res.code === 0) {
			if (code) {
				// 指定面包屑
				let selectItem = res.data.filter((item) => item.code === code);
				selectItem = selectItem ? selectItem[0] : null;
				setMenuKey(String(selectItem.id));
				setMenuName(selectItem.name);
				if (selectItem.children) {
					await getSearchDate(selectItem.children[0].id);
					setMenuChildList(selectItem.children);
					setMenuChildName(selectItem.children[0].name);
					setMenuChildKey(String(selectItem.children[0].id));
				} else {
					await getSearchDate(selectItem.id);
				}
			} else {
				// 默认第一项
				setMenuKey(res.data[0] ? String(res.data[0].id) : '');
				setMenuName(res.data[0] ? res.data[0].name : '');

				// 如果有子集
				if (res.data[0] && res.data[0].children) {
					await getSearchDate(res.data[0].children[0].id);
					setMenuChildList(res.data[0].children);
					setMenuChildName(res.data[0].children[0].name);
					setMenuChildKey(String(res.data[0].children[0].id));
				} else {
					if (res.data[0]) {
						await getSearchDate(res.data[0].id);
					}
				}
			}
			setMenuList(res.data);
		}
	};

	// 列表
	const getFormList = async (param: any) => {
		if (loading) {
			return;
		}
		const params = {
			sortList,
			templateId: menuChildList.length > 0 ? menuChildKey : menuKey,
			...pageConfig,
			...getSearchForm(),
			...param,
		};
		setLoading(true);
		const res = await getList(params);
		if (res && res.code === 0) {
			const data = res.data;
			data.forEach((item) => {
				if (item.paginationResult) {
					setList(item.paginationResult.rows);
					setTotal(item.paginationResult.totalCount);
					setPageConfig({
						pageNum: item.paginationResult.pageNum,
						pageSize: item.paginationResult.pageSize,
					});
				}
				if (item.textResult) {
					setTotalInfo(item.textResult[0] || '');
				}
			});
		}
		setLoading(false);
	};

	// 查询
	const searchSubmit = () => {
		getFormList({ pageNum: 0 });
	};

	// 重置
	const resetSerach = () => {
		form.resetFields();
		setSortList([]);
		setSortedInfo({});
		let newCol = columns.map((item) => (item.sorter ? { ...item, sortOrder: false } : { ...item }));
		setColumns(newCol);
		getFormList({ pageNum: 0, sortList: [] });
	};

	// 排序
	const handleChangeTable = (pagination: any, filter: any, sorter: any) => {
		let newCol = columns.map((item) =>
			item.sorter
				? { ...item, sortOrder: sorter.columnKey == item.key && sorter.order }
				: { ...item },
		);
		setColumns(newCol);
		setSortedInfo(sorter);
		const sorters =
			sorter.order == null
				? []
				: [{ desc: sorter.order === 'descend', sortName: sorter.columnKey }];
		setSortList(sorters);
		getFormList({ sortList: sorters, pageNum: 0 });
	};

	// 面包屑选择
	const menuClick = (e: object) => {
		if (loading) {
			return;
		}
		setSearchStatus('');
		form.resetFields();
		const select = menuList.filter((item) => item.id == e.key)[0];
		setMenuKey(e.key);
		setMenuName(select.name);
		if (select.children) {
			setMenuChildList(select.children);
			setMenuChildName(select.children[0].name);
			setMenuChildKey(String(select.children[0].id));
			getSearchDate(select.children[0].id);
		} else {
			setMenuChildList([]);
			getSearchDate(e.key);
		}
		setSearchList([]);
		setList([]);
		setColumns([]);
		setTotalInfo('');
		setSortList([]);
	};

	// 子集选择
	const menuChildClick = (e: object) => {
		if (loading) {
			return;
		}
		setSearchStatus('');
		form.resetFields();
		setMenuChildKey(e.key);
		setMenuChildName(e.item.props.children);
		setSearchList([]);
		setList([]);
		setColumns([]);
		setTotalInfo('');
		getSearchDate(e.key);
		setSortList([]);
	};

	// 渲染筛选条件
	const renderFilter = (list: any) => {
		if (list.some((item) => (item.type == 'select' && item.plain) || item.type == 'date_range')) {
			return (
				<div className='searchForm'>
					<Row gutter={24}>
						{list.map((item: any, index: number) => {
							if (index === 0) {
								if (item.type === 'select') {
									console.log(293, item.type);
									return (
										<SingleSelect
											props={item}
											key={index}
											searchStatus={searchStatus}
										/>
									);
								}
								if (item.type === 'date_range') {
									return (
										<DateRange
											props={item}
											key={index}
										/>
									);
								}
							}
						})}
					</Row>
					<Row
						className={showMore ? '' : 'dis-n'}
						gutter={24}>
						{list.map((item: any, index: number) => {
							if (index !== 0) {
								if (item.type === 'select') {
									if (item.plain) {
										console.log(307, item.type);
										return (
											<SingleSelect
												props={item}
												key={index}
											/>
										);
									}
									return (
										<EnumSelect
											props={item}
											key={index}
										/>
									);
								}
								if (item.type === 'date_range') {
									return (
										<DateRange
											props={item}
											key={index}
										/>
									);
								}
								if (item.type === 'date') {
									return (
										<DateRangePicker
											props={item}
											key={index}
										/>
									);
								}
								if (item.type === 'input') {
									return (
										<SearchInput
											props={item}
											key={index}
										/>
									);
								}
								if (item.type === 'redio') {
									return (
										<SearchRedio
											props={item}
											key={index}
										/>
									);
								}
								if (item.type === 'search_select') {
									if (item.backendSearch) {
										return (
											<BackendSearchSelect
												props={item}
												key={index}
												form={form}
											/>
										);
									}
									return (
										<SearchSelect
											props={item}
											key={index}
											form={form}
										/>
									);
								}
							}
						})}
					</Row>
				</div>
			);
			// eslint-disable-next-line no-else-return
		} else {
			return (
				<div className='searchForm'>
					<Row gutter={24}>
						{list.map((item: any, index: number) => {
							const name =
								index == 0
									? ''
									: index == 1
									? docWidth < 992
										? showMore
											? ''
											: 'dis-n'
										: ''
									: index == 2
									? docWidth < 1600
										? showMore
											? ''
											: 'dis-n'
										: ''
									: showMore
									? ''
									: 'dis-n';
							if (item.type === 'select') {
								return (
									<EnumSelect
										props={item}
										key={index}
										className={name}
									/>
								);
							}

							if (item.type === 'input') {
								return (
									<SearchInput
										props={item}
										key={index}
										className={name}
									/>
								);
							}
							if (item.type === 'redio') {
								return (
									<SearchRedio
										props={item}
										key={index}
										className={name}
									/>
								);
							}
							if (item.type === 'search_select') {
								if (item.backendSearch) {
									return (
										<BackendSearchSelect
											props={item}
											key={index}
											form={form}
											className={name}
										/>
									);
								}
								return (
									<SearchSelect
										props={item}
										key={index}
										className={name}
										form={form}
									/>
								);
							}
						})}
					</Row>
				</div>
			);
		}
	};

	// 选择
	const selectRow = (selectData: any, status: boolean) => {
		let select = cloneDeep(selectedRowKeys);
		if (status) {
			select.push(selectData[exportCheckboxField]);
		} else {
			select = select.filter((item) => item !== selectData[exportCheckboxField]);
		}
		setSelectedRowKeys(select);
	};

	// 全选
	const selectAll = (selected: boolean, selectedRecords: any, changeRecords: any) => {
		let select = cloneDeep(selectedRowKeys);
		if (selected) {
			const changeKeys = changeRecords.map((el) => el[exportCheckboxField]);
			select = select.concat(changeKeys);
		} else {
			changeRecords.forEach((item) => {
				select = select.filter((el) => el !== item[exportCheckboxField]);
			});
		}
		setSelectedRowKeys(select);
	};

	// 单行点击选中
	const selectRowOfClick = (record: any) => {
		if (selectedRowKeys.indexOf(record[exportCheckboxField]) >= 0) {
			selectRow(record, false);
		} else {
			selectRow(record, true);
		}
	};

	const rowSelection = {
		selectedRowKeys,
		onSelect: selectRow,
		onSelectAll: selectAll,
		width: 50,
	};

	useEffect(() => {
		const search = props.location.search;
		const code = getUrlParam(search, 'page');

		let searchStatus = getUrlParam(search, 'status');
		if (searchStatus) {
			setSearchStatus(searchStatus);
		}

		if (props?.location?.state) {
			const { key, status } = props?.location?.state;
			getMenuDate(key);
			status && form.setFieldsValue({ status: [status] });
		} else {
			getMenuDate(code);
		}
	}, []);

	// useEffect(() => {
	//   if (columns.length > 0) {
	//     setTimeout(() => {
	//       searchSubmit();
	//     }, 500);
	//   }
	// }, [columns]);

	const menu = (
		<Menu
			selectedKeys={[menuKey]}
			onClick={menuClick}>
			{menuList.map((item) => {
				return <Menu.Item key={item.id}>{item.name}</Menu.Item>;
			})}
		</Menu>
	);
	const menuChild = (
		<Menu
			selectedKeys={[menuChildKey]}
			onClick={menuChildClick}>
			{menuChildList.map((item) => {
				return <Menu.Item key={item.id}>{item.name}</Menu.Item>;
			})}
		</Menu>
	);
	return (
		<div className='main-page'>
			<div className={style.reportForm}>
				<div className='page-bread-crumb'>
					<Breadcrumb>
						<Breadcrumb.Item>报表业务</Breadcrumb.Item>
						<Breadcrumb.Item>报表汇总</Breadcrumb.Item>
						<Breadcrumb.Item
							overlay={menu}
							className={style.pointer}>
							{menuName}
						</Breadcrumb.Item>
						{menuChildList.length > 0 && (
							<Breadcrumb.Item
								overlay={menuChild}
								className={style.pointer}>
								{menuChildName}
							</Breadcrumb.Item>
						)}
					</Breadcrumb>
				</div>
				<Card bordered={false}>
					<Form
						form={form}
						onFinish={searchSubmit}
						labelAlign='left'
						className='custom-table-query-box'>
						<div className='searchWrap'>
							{renderFilter(searchList)}
							<div className='searchBtn'>
								<Button
									type='primary'
									htmlType='submit'>
									查询
								</Button>
								<Button onClick={resetSerach}>重置</Button>
								<a onClick={() => setShowMore(!showMore)}>
									{showMore ? (
										<>
											收起 <UpOutlined />
										</>
									) : (
										<>
											展开 <DownOutlined />
										</>
									)}
								</a>
							</div>
						</div>
						{(menuChildKey || menuKey) && (
							<TableBox
								headerTitle={null}
								title={() => (
									<div className='flex flex-between'>
										<div className='tableTitle'>
											{totalInfo && (
												<div className='tableAlert'>
													<ExclamationCircleFilled
														style={{ color: CONFIG_LESS['@c_starus_await'], marginRight: '8px' }}
													/>
													{totalInfo}
												</div>
											)}
										</div>
									</div>
								)}
								toolBarRender={() => [
									<ExportFile
										data={{
											filters:
												exportCheckboxParam && exportCheckboxField
													? {
															exportParams: {
																[`${exportCheckboxParam}`]: selectedRowKeys.join(','),
															},
															templateId: menuChildList.length > 0 ? menuChildKey : menuKey,
															sortList,
													  }
													: {
															...getSearchForm(),
															templateId: menuChildList.length > 0 ? menuChildKey : menuKey,
													  },
											link: api.summary_report_form.export,
											method: 'POST',
											type: exportCheckboxParam && exportCheckboxField ? 'checkBox' : null,
											keys: exportCheckboxParam && exportCheckboxField ? selectedRowKeys : [],
											getForm: getSearchForm,
										}}
										disabled={
											exportCheckboxParam && exportCheckboxField && selectedRowKeys.length <= 0
												? true
												: false
										}
									/>,
								]}
								columns={columns}
								dataSource={list}
								tableInfoId={tableInfoId || ''}
								options={{
									reload: () => getFormList({}),
								}}
								scroll={{
									x: '100%',
									y: global.scrollY - 30,
								}}
								rowSelection={exportCheckboxParam && exportCheckboxField ? rowSelection : false}
								rowKey={`${exportCheckboxField}` || 'index'}
								loading={loading}
								onChange={handleChangeTable}
								onRow={(record) => ({
									onClick: () => {
										selectRowOfClick(record);
									},
								})}
								tableAlertOptionRender={
									<a
										onClick={() => {
											setSelectedRowKeys([]);
										}}>
										取消选择
									</a>
								}
							/>
						)}
					</Form>
					{total > 0 && (
						<PaginationBox
							data={{ total, ...pageConfig }}
							pageChange={(pageNum: number, pageSize: number) => getFormList({ pageNum, pageSize })}
						/>
					)}
				</Card>
			</div>
		</div>
	);
};

export default connect(({ global }) => ({ global }))(TableList);
