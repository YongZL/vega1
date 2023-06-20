import type { ProFormColumns } from '@/components/SchemaForm/typings';
import {
	enabledStatus,
	enabledStatusValueEnum,
	goodsTicketStatus,
	goodsTicketStatusTextMap,
} from '@/constants/dictionary';
import { batchBindDepartmentGoods, getTreeListData } from '@/services/department';
import { getGoodsData } from '@/services/goodsTypes';
import { transformSBCtoDBC } from '@/utils';
import { notification } from '@/utils/ui';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, Form, Input, Modal, Row, Spin, Table, Tooltip } from 'antd';
import { cloneDeep, flatten } from 'lodash';
import { useModel } from 'umi';
import { FC, ReactNode, useEffect, useState, useRef } from 'react';
import style from '../index.less';
import ProTable, { ProColumns, ProTableAction } from '@/components/ProTable';
import { formatStrConnect } from '@/utils/format';
const CheckboxGroup = Checkbox.Group;

interface Props {
	isOpen?: boolean;
	setIsOpen?: any;
	getFormList?: () => void;
	activeTab?: string;
}
type DepartmentRecord = DepartmentController.DepartmentTreeList;

const BatchAddModal: FC<Props> = ({
	isOpen,
	setIsOpen,
	getFormList = () => {},
	activeTab = '',
}) => {
	const treeObj = {
		goods: 'goodsIds',
		package_bulk: 'packageBulkIds',
		package_ordinary: 'packageOrdinaryIds',
	};

	const { fields } = useModel('fieldsMapping');
	const [treeGroupRow, setTreeGroupRow] = useState<DepartmentRecord[]>([]);
	const [treeGroupData, setTreeGroupData] = useState({});
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const [checkedGroupList, setCheckedGroupList] = useState({});
	const [activeIndex, setActiveIndex] = useState<number | string>(0);
	const [search, setSearch] = useState(null);
	const [dataMap, setDataMap] = useState(new Map());
	const [firstLvDepartmentIndexMap, setFirstLvDepartmentIndexMap] = useState(new Map());
	// const [allUnBindList, setAllUnBindList] = useState([]);
	const [form] = Form.useForm();
	const [rowkey, setRowkey] = useState<number[]>([]);
	const [isNextStep, setIsNextStep] = useState(false);
	const [selectName, setSelectName] = useState('');
	const [goodsId, setGoodsId] = useState<number[]>([]);
	const [defaultRow, setdefalutRow] = useState<number[]>([]);
	const [defaultChildArr, setdefaultChildArr] = useState<number[]>([]);
	const [loading, setLoading] = useState(false);
	const allChecked = useRef<boolean>(false);
	// const [allChecked, setAllChecked] = useState<boolean>(false);
	const [postLoading, setPostLoading] = useState(false);
	const tableRef = useRef<ProTableAction>();
	const listData = useRef<GoodsTypesController.BatchList[]>([]);
	let clickIndex: string | number = 0;
	const columnsDepartmentGroup = [
		{
			title: '全部',
			dataIndex: 'name',
			key: 'name',
			width: '60',
			render: (_: any, record: any) => {
				return <div>{record.name}</div>;
			},
		},
		{
			title: '>',
			dataIndex: 'icon',
			key: 'icon',
			width: '40',
			render: () => {
				return <div>{'>'}</div>;
			},
		},
	];

	const searchObj = {
		goods: {
			name: fields.goodsName,
			codeLabel: fields.goods,
			title: fields.baseGoods,
			id: 'id',
			selectName: 'name',
			tableInfoId: '230',
		},
		package_bulk: {
			name: '定数包名称',
			codeLabel: fields.goods,
			title: '定数包',
			id: 'packageBulkId',
			selectName: 'packageBulkName',
			tableInfoId: '269',
		},
		package_ordinary: {
			name: '医耗套包名称',
			codeLabel: '医耗套包',
			title: '医耗套包',
			id: 'packageOrdinaryId',
			selectName: 'packageOrdinaryName',
			tableInfoId: '270',
		},
	};

	let getNowPageObj = searchObj[activeTab];

	useEffect(() => {
		if (isNextStep) {
			getDepartmentsTreeData(goodsId);
		}
	}, [isNextStep]);
	// 获取科室树形结构数据
	const getDepartmentsTreeData = async (goodsId: Array<number>) => {
		setLoading(true);
		let params = {};
		if (!allChecked.current) {
			params[treeObj[activeTab]] = goodsId.toString();
		}

		try {
			const res = await getTreeListData({ ...params });
			if (res && res.code === 0) {
				const list = res.data.filter((item: any) => item.children.length > 0);
				let generateTreeGroupRow = getTreeGroupRow(cloneDeep(list), goodsId);
				let generateTreeGroupData = getTreeGroupData(cloneDeep(list));
				setPlainArrayMap(list);
				setFirstLvDepartmentIndex(list);
				setTreeGroupRow(generateTreeGroupRow);
				setTreeGroupData(generateTreeGroupData);
			}
		} finally {
			setLoading(false);
		}
	};

	// 全选
	const onCheckAllChange = (checked?: boolean) => {
		let allIndex = [];
		for (let value of firstLvDepartmentIndexMap.values()) {
			allIndex.push(value);
		}
		if (checked) {
			treeGroupRow.map((item: any) => {
				item.indeterminate = false;
				return item;
			});
		} else {
			treeGroupRow.map((item: any) => {
				if (item.isAllBind == false) {
					item.indeterminate = true;
				}
				return item;
			});
		}
		allIndex.forEach((targetIndex) => {
			onSelectRowUpdateByIndex(targetIndex, checked);
		});
	};

	// table
	const getChangedRowIndex = (idArray: any) => {
		let rtnIndexArray: Array<number> = [];
		idArray.forEach((id: Array<number>) => {
			rtnIndexArray.push(firstLvDepartmentIndexMap.get(id));
		});

		return rtnIndexArray;
	};

	const changeRow = (selectedKeys: number[]) => {
		let changedIndexArray = getChangedRowIndex(selectedKeys);
		changedIndexArray.forEach((targetIndex) => {
			checkedGroupList[targetIndex] = treeGroupData[targetIndex];
		});
		setSelectedRowKeys(selectedKeys.concat(defaultRow));
		setCheckedGroupList(checkedGroupList);
	};

	// 点击复选框选中
	const selectRow = (record: { index: number }, selected: boolean) => {
		let index = record.index;
		onSelectRowUpdateByIndex(index, selected);
		setActiveIndex(index);
		if (selected) {
			treeGroupRow[index]['indeterminate'] = false;
		} else {
			let len = bindArr(treeGroupData[index]).length;
			if (len > 0) {
				treeGroupRow[index]['indeterminate'] = true;
			}
		}
		setTreeGroupRow([...treeGroupRow]);
	};

	// 单行点击选中
	const selectRowOfClick = (index = '') => {
		setActiveIndex(index);
	};

	// 批量绑定
	const handleBatchBindSubmit = async () => {
		let selectedDepartmentIds = getSelectedDepartmentIds();
		if (selectedDepartmentIds.length == 0 && defaultChildArr.length == 0) {
			notification.error('请选择科室');
			return;
		}
		let params: any = {
			departmentIds: selectedDepartmentIds.length > 0 ? selectedDepartmentIds : defaultChildArr,
			isAllGoods: allChecked.current,
		};

		if (!allChecked.current) {
			params[treeObj[activeTab]] = goodsId;
		}

		setPostLoading(true);
		try {
			const res = await batchBindDepartmentGoods(params);
			if (res && res.code === 0) {
				notification.success('操作成功！');
				allChecked.current = false;
				setCheckedGroupList({});
				setSelectedRowKeys([]);
				setSearch(null);
				setIsOpen(false);
				getFormList();
			}
			setPostLoading(false);
		} finally {
			setPostLoading(false);
		}
	};

	// 取消
	const handleCancel = () => {
		clearSelectData();
		setSearch(null);
		setIsOpen(false);
	};

	const clearSelectData = () => {
		setdefalutRow([]);
		setdefaultChildArr([]);
		setTreeGroupRow([]);
		setTreeGroupData({});
		setSelectedRowKeys([]);
		setCheckedGroupList({});
		setActiveIndex(0);
		setDataMap(new Map());
	};

	const searchSubmit = (value: string) => {
		setSearch(value ? transformSBCtoDBC(value) : null);
	};

	// 选择checkgroup单个
	const onCheckChange = (selectedArray: any) => {
		let selectedItemArray = getItemByIdArray(selectedArray);
		const parentKeyMaps = Object.assign(
			{},
			treeGroupRow.map((item) => item.id),
		); // 父类科室id和index的map
		let selectedParent: any[] = []; // 全部勾选的父类上级科室

		Object.keys(parentKeyMaps).forEach((key) => {
			if (activeIndex !== 'all') {
				checkedGroupList[activeIndex] = selectedItemArray;
			} else {
				checkedGroupList[key] = selectedItemArray.filter(
					(item: any) => item.parentId === parentKeyMaps[key],
				);
			}
		});

		let index = activeIndex;
		if (activeIndex == 'all') {
			index = clickIndex;
		} else {
			index = activeIndex;
		}

		if (checkedGroupList[index].length == 0) {
			treeGroupRow[index].indeterminate = false;
		} else {
			treeGroupRow[index].indeterminate = true;
		}

		Object.keys(checkedGroupList).map((item: any) => {
			if (treeGroupData[item].length === checkedGroupList[item].length) {
				selectedParent.push(treeGroupRow[item].id);
				treeGroupRow[item]['indeterminate'] = false;
			}
		});
		setSelectedRowKeys([...selectedParent?.concat(defaultRow)]);
		setCheckedGroupList({ ...checkedGroupList });
		setTreeGroupRow([...treeGroupRow]);
	};

	const getItemByIdArray = (idArray: any[]) => {
		let rtnArray: number[] = [];
		idArray.forEach((id: any) => {
			rtnArray.push(dataMap.get(id));
		});
		return rtnArray;
	};

	const getTreeGroupRow = (data: any[]) => {
		return data.map((item, index) => {
			item.children = null;
			item.index = index;
			return item;
		});
	};

	const getTreeGroupData = (data: DepartmentRecord[]) => {
		let rtnData = {};
		data.forEach((item: any, index: number) => {
			let childeren = item.children;
			if (childeren && childeren.length) {
				item.children = childeren.map((data: any) => {
					return { ...data, index: index };
				});
			}
			rtnData[index] = item.children;
		});
		return rtnData;
	};

	// 数据容器
	const setPlainArrayMap = (data: DepartmentController.DepartmentTreeList[]) => {
		let rtnData: DepartmentController.DepartmentTreeList[] = [];
		data.forEach((item: any) => {
			rtnData = rtnData.concat(item.children);
		});
		rtnData.forEach((item: any) => {
			dataMap.set(item.id, item);
		});
		setDataMap(dataMap);
	};

	// 大部门
	const setFirstLvDepartmentIndex = (data: DepartmentRecord[]) => {
		data.forEach((item: any, index) => {
			firstLvDepartmentIndexMap.set(item.id, index);
		});
		setFirstLvDepartmentIndexMap(firstLvDepartmentIndexMap);
	};

	const getSelectedDepartmentIds = () => {
		let dataList: any[] = [];
		Object.values(checkedGroupList).forEach((itemArr: any) => {
			dataList = dataList.concat(itemArr.map((item: any) => item.id));
		});
		return dataList;
	};

	const onSelectRowUpdateByIndex = (index: number, selected?: boolean) => {
		let defaultArr = treeGroupData[index].filter((item: any) => item.isBind == true);
		checkedGroupList[index] = selected ? treeGroupData[index] : defaultArr;
		setCheckedGroupList({ ...checkedGroupList });
	};

	const getLinedData = (totalList: DepartmentRecord[]) => {
		let newArr = [];
		let list = totalList.concat([]);
		list.map((item: any) => {
			if (item.name.indexOf(search) > -1) {
				item.checked = true;
			} else {
				item.checked = false;
			}
		});
		for (var i = 0; i < list.length; i += 5) {
			newArr.push(totalList.slice(i, i + 5));
		}
		return newArr;
	};

	const footerContent = [
		<Button onClick={handleCancel}>取消</Button>,
		<Button
			type='primary'
			onClick={() => {
				if (selectName || allChecked.current) {
					setGoodsId(rowkey);
					setIsNextStep(true);
				} else {
					notification.warning('请选择' + getNowPageObj.title);
				}
			}}>
			下一步
		</Button>,
	];
	const nextStepFooterContent = [
		<Button
			onClick={() => {
				setIsNextStep(false);
				clearSelectData();
			}}>
			上一步
		</Button>,
		<Button
			type='primary'
			loading={postLoading}
			onClick={handleBatchBindSubmit}>
			提交
		</Button>,
	];

	const batchAddModal = {
		visible: isOpen,
		title: '批量绑定：' + (isNextStep ? '2、选择科室' : '1、' + getNowPageObj.title),
		width: '75%',
		onCancel: handleCancel,
		maskClosable: false,
		destroyOnClose: true,
		footer: isNextStep ? nextStepFooterContent : footerContent,
	};
	const rowSelection: any = {
		selectedRowKeys: selectedRowKeys.length > 0 ? selectedRowKeys : defaultRow,
		onChange: changeRow,
		onSelect: selectRow,
		onSelectAll: onCheckAllChange,
		hideSelectAll: defaultRow.length == Object.keys(treeGroupRow).length ? true : false,
		getCheckboxProps(record: any) {
			return {
				// disabled: record.isAllBind && record.isAllBind == true ? true : false,
				indeterminate: record.indeterminate,
			};
		},
	};

	let rowItemDataList =
		activeIndex === 'all'
			? flatten(Object.values(treeGroupData))
			: treeGroupData[activeIndex]
			? treeGroupData[activeIndex]
			: []; // 当前激活行的全量数据
	let targetSelectedList =
		activeIndex === 'all'
			? flatten(Object.values(checkedGroupList))
			: checkedGroupList[activeIndex]
			? checkedGroupList[activeIndex]
			: []; // 当前激活表中被激活的数据

	let targetDataList = getLinedData(rowItemDataList); // 格式化后的数据

	const columns: ProColumns<GoodsTypesController.BatchList>[] = [
		{
			title: fields.goodsName,
			width: 130,
			dataIndex: 'name',
			key: 'name',
			ellipsis: true,
		},
		{
			title: '定数包名称',
			width: 130,
			dataIndex: 'packageBulkName',
			key: 'packageBulkName',
			ellipsis: true,
			hideInTable: activeTab == 'package_bulk' ? false : true,
		},
		{
			title: fields.goodsCode,
			width: 180,
			dataIndex: 'materialCode',
			key: 'materialCode',
			ellipsis: true,
			hideInTable: activeTab == 'package_bulk' ? true : false,
		},
		{
			title: fields.goodsCode,
			width: 180,
			dataIndex: 'packageBulkCode',
			key: 'packageBulkCode',
			ellipsis: true,
			hideInTable: activeTab == 'package_bulk' ? false : true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			width: 150,
			ellipsis: true,
			render: (_text: ReactNode, record: GoodsTypesController.BatchList) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 120,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 120,
			ellipsis: true,
		},
		{
			title: '是否绑定',
			dataIndex: 'bind',
			key: 'bind',
			width: 80,
			ellipsis: true,
			renderText: (text: string, record: any) => goodsTicketStatusTextMap[record.bind],
		},
		{
			title: '状态',
			dataIndex: 'menabled',
			key: 'menabled',
			width: 90,
			filters: false,
			valueEnum: enabledStatusValueEnum,
		},
	];

	let ordinaryColumns: ProColumns<GoodsTypesController.BatchList>[] = [
		{
			title: '医耗套包编号',
			dataIndex: 'ordinaryCode',
			key: 'ordinaryCode',
			width: 150,
		},
		{
			title: '医耗套包名称',
			dataIndex: 'packageOrdinaryName',
			key: 'packageOrdinaryName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '医耗套包说明',
			dataIndex: 'detailGoodsMessage',
			width: 150,
			render: (text: ReactNode, record: GoodsTypesController.BatchList) => {
				const { detailGoodsMessage, description } = record;
				return (
					<div
						className='detailGoodsMessage'
						title={description || detailGoodsMessage}>
						{description || detailGoodsMessage}
					</div>
				);
			},
		},
		{
			title: '是否绑定',
			dataIndex: 'bind',
			key: 'bind',
			width: 80,
			ellipsis: true,
			render: (text: any, record: any) => <span>{goodsTicketStatusTextMap[record.bind]}</span>,
		},
		{
			title: '状态',
			dataIndex: 'menabled',
			key: 'menabled',
			width: 90,
			filters: false,
			valueEnum: enabledStatusValueEnum,
		},
	];

	const goodsrowSelection: any = {
		selectedRowKeys: rowkey,
		preserveSelectedRowKeys: true,
		onChange: (selectedRowKeys: [], selectRow: any) => {
			let nameData = (selectRow || []).map((item: any) => item[getNowPageObj.selectName]);
			setSelectName(nameData.toString().replace(/,/g, ' 、'));
			setRowkey(selectedRowKeys);
		},
		getCheckboxProps: () => ({
			disabled: allChecked.current,
		}),
	};

	const bindArr = (data: any) => {
		let arr = [];
		for (let i in data) {
			if (data[i].isBind) {
				arr.push(data[i].id);
			}
		}
		return arr;
	};

	const searchColumns: ProFormColumns = [
		{
			title: getNowPageObj.title,
			dataIndex: 'goodsName',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: getNowPageObj.codeLabel + '编号',
			dataIndex: 'materialCode',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			fieldProps: {
				placeholder: '请输入',
			},
		},
		{
			title: '是否绑定',
			dataIndex: 'bind',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择',
				options: goodsTicketStatus,
			},
		},
		{
			title: '状态',
			dataIndex: 'enabled',
			valueType: 'select',
			fieldProps: {
				placeholder: '请选择',
				options: enabledStatus,
			},
		},
	];

	const CheckboxChange = (e: { target: { checked: boolean } }) => {
		let val = e.target.checked;
		if (val) {
			handleRowKey();
		} else {
			setSelectName('');
			setRowkey([]);
		}
		allChecked.current = val;
	};

	const handleRowKey = () => {
		let list = listData.current;
		let arr = rowkey;
		for (let i = 0, len = list.length; i < len; i++) {
			const { id } = list[i];
			if (id && !arr.includes(id)) {
				arr.push(id);
			}
		}
		setRowkey([...arr]);
	};

	return (
		<Modal
			{...batchAddModal}
			className={style.departmentWrap}>
			<div style={{ display: !isNextStep ? 'block' : 'none' }}>
				<div className='main-page'>
					<div style={{ paddingBottom: 10 }}>
						{selectName && (
							<div className={style.selectContentElement}>
								<Tooltip
									placement='topLeft'
									overlayStyle={{ minWidth: selectName.length > 500 ? 900 : '' }}
									title={selectName}>
									所选{getNowPageObj.title}: {selectName}
								</Tooltip>
							</div>
						)}

						<ProTable<GoodsTypesController.BatchList>
							search={false}
							headerTitle={
								<Checkbox
									style={{ paddingLeft: 6 }}
									checked={allChecked.current}
									onChange={CheckboxChange}>
									绑定全部{getNowPageObj && getNowPageObj.codeLabel}
								</Checkbox>
							}
							tableRef={tableRef}
							columns={activeTab == 'package_ordinary' ? ordinaryColumns : columns}
							rowKey={getNowPageObj.id}
							searchConfig={{
								columns: searchColumns,
							}}
							params={{
								goodsTypeEnum: activeTab,
							}}
							requestCompleted={(list) => {
								listData.current = list;
								if (allChecked.current) {
									handleRowKey();
								}
							}}
							api={getGoodsData}
							tableAlertRender={false}
							scroll={{ x: '100%', y: 300 }}
							rowSelection={goodsrowSelection}
							options={{ density: false, fullScreen: false, setting: false }}
						/>
					</div>
				</div>
			</div>

			{/* 批量绑定 */}
			{isNextStep && (
				<Spin spinning={loading}>
					<Form form={form}>
						<Row gutter={5}>
							<Col sm={24}>
								{selectName && (
									<div
										className={style.selectContentElement}
										style={{ marginBottom: 15 }}>
										<Tooltip
											placement='topLeft'
											overlayStyle={{ minWidth: selectName.length > 500 ? 900 : '' }}
											title={selectName}>
											{getNowPageObj.name}: {selectName}
										</Tooltip>
									</div>
								)}
							</Col>
						</Row>
						<Row gutter={5}>
							<Col
								sm={24}
								md={6}>
								<div>
									<Table
										className={activeIndex === 'all' ? style.treeTableCheck : style.treeTable}
										columns={columnsDepartmentGroup}
										rowKey='id'
										dataSource={treeGroupRow}
										rowSelection={rowSelection}
										pagination={false}
										size='small'
										scroll={{ y: 300 }}
										bordered={false}
										rowClassName={(record: any) =>
											record.index === activeIndex ? style.select : ''
										}
										onRow={(record: any) => ({
											onClick: () => {
												selectRowOfClick(record.index);
											},
										})}
										onHeaderRow={() => {
											return {
												onClick: () => {
													selectRowOfClick('all');
												}, // 点击表头行
											};
										}}
									/>
								</div>
							</Col>
							<Col
								sm={24}
								md={18}>
								<div>
									<Input
										className={style.searchInput}
										onPressEnter={(e) => searchSubmit((e.target as HTMLInputElement).value)}
										onChange={(e) => searchSubmit(e.target.value)}
										prefix={<SearchOutlined />}
										allowClear
										placeholder='查找科室'
									/>
								</div>
								<div className={style.warehouse}>
									<CheckboxGroup
										onChange={onCheckChange}
										value={targetSelectedList.map((item: { id: number }) => {
											return item.id;
										})}>
										<table
											className={style.table}
											style={{ height: document.body.clientHeight * 0.6, borderWidth: 1 }}>
											<tbody>
												{targetDataList.map((itemArr, index) => {
													// 行
													return (
														<tr key={index}>
															{(itemArr || []).map((item: any) => {
																// 单元格 设置key需要注意使用id，使用下标容易导致key不一样使得checkedlist不同
																return (
																	<td key={item.id}>
																		<Checkbox
																			value={item.id}
																			// disabled={item.bind}
																			checked={item.isBind}
																			onClick={() => {
																				if (activeIndex == 'all') {
																					clickIndex = String(item.index);
																				}
																			}}>
																			<span className={item.checked ? style.checked : ''}>
																				{item.name}
																			</span>
																		</Checkbox>
																	</td>
																);
															})}
														</tr>
													);
												})}
											</tbody>
										</table>
									</CheckboxGroup>
								</div>
							</Col>
						</Row>
					</Form>
				</Spin>
			)}
		</Modal>
	);
};
export default BatchAddModal;
