import Breadcrumb from '@/components/Breadcrumb';
import { ProColumns } from '@/components/ProTable';
import ProTable from '@/components/ResizableTable';
import type { ProTableAction } from '@/components/ProTable/typings';
import { ProFormColumns } from '@/components/SchemaForm';
import {
	createInventory,
	getDepartmentList,
	getDetail,
	getLastInventoryTime,
	getList,
	saveInventoryList,
	submitInventoryList,
} from '@/services/inventory';
import { DealDate } from '@/utils/DealDate';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Card, Form, InputNumber } from 'antd';
import _, { cloneDeep } from 'lodash';
import moment from 'moment';
import { FC, useEffect, useRef, useState } from 'react';
import { connect, history, useModel } from 'umi';
import ConfirmModal from './ConfirmModal';

type PageParams = {
	departmentId?: number;
	departmentName?: string;
	differenceAmount?: number;
	differenceQuantity?: number;
	id?: number;
	inventoryCode?: string;
	inventoryTime?: number;
	inventoryUserId?: number;
	inventoryUserName: string;
	isSubmit?: boolean;
	lastInventoryTime?: number;
	pageType?: 'check';
	currentInventoryTime?: number;
};
export interface UpdateProps {
	global: Record<string, any>;
	match: Record<string, any>;
	history: Record<string, any>;
}

const inventoryList: FC<UpdateProps> = ({ global }) => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [pageState, setPageState] = useState<PageParams>();
	const [list, setList] = useState<Record<string, any>>([]);
	const [changeList, setChangeList] = useState<any>([]);
	const [inventoryId, setInventoryId] = useState();
	const [changeObj, setChangeObj] = useState({});
	const [departmentList, setDepartmentList] = useState<Record<string, any>>([]);
	const [departmentName, setDepartmentName] = useState<string>('');
	const [lastInventoryTime, setLastInventoryTime] = useState<string | number>('');
	const [modalData, setModalData] = useState('');
	const [stockTimes, setStockTimes] = useState<number>();
	const tableRef = useRef<ProTableAction>();

	let state: any = history.location?.state;
	let pageType = state && state?.pageType;
	let keyData = pageType + history.location.key;
	let listLoad = {
		add: createInventory,
		detail: getDetail,
		check: getDetail,
	};
	useEffect(() => {
		if (state) {
			setPageState(state);
		}
	}, [history.location.state]);

	//修改数量
	const onChangeQuantity = (value: any, record: Record<string, any>) => {
		let changeListArr = [],
			newList = [];
		// let value=values.replace(/\s*/g, '');
		// if (min < 0 && v.startsWith('-')) {
		//   v = `-${v.replace(inputReg, '')}`;
		// } else {
		//   v = v.replace(inputReg, '');
		// }
		if (String(value).indexOf('.') !== -1) {
			value = String(value).replace('.', '');
		}
		let obj = {
			id: record.id,
			goodsId: record.goodsId,
			oldQuantity:
				record.logicalQuantity || record.logicalQuantity == 0
					? Number(record.logicalQuantity)
					: undefined,
			newQuantity: value || value == 0 ? Number(value) : undefined,
			price: record.price || undefined,
		};
		if ((value == '' && value !== 0) || value == null || value == undefined) {
			if (changeList.length > 0) {
				changeListArr = changeList.filter((item: { id: string | number }) => item.id != record.id);
				delete changeObj[record?.id];
			}
		} else {
			if (changeList.length == 0) {
				changeListArr = [obj];
			} else {
				if (changeObj[record.id]) {
					changeListArr = (changeList || []).map((item: { id: string | number }) =>
						item.id === record.id ? { ...obj } : { ...item },
					);
				} else {
					changeListArr = changeList.concat([obj]);
				}
			}
			changeObj[record?.id] = obj;
		}
		newList = (list || []).map((item: Record<string, any>) =>
			item.id === record.id ? { ...item, newQuantity: value } : { ...item },
		);
		setList(newList);
		tableRef.current?.setDataSource(cloneDeep(newList));

		setChangeObj(changeObj);
		setChangeList(changeListArr);
	};

	const saveData = () => {
		let pageData = {
			departmentId: pageState?.departmentId,
			currentInventoryTime: pageState?.inventoryTime,
			lastInventoryTime: pageState?.lastInventoryTime,
			departmentName: pageState?.departmentName,
		};
		sessionStorage.setItem('pageData', JSON.stringify(pageData));
	};
	//保存 或提交盘库信息
	const postListData = async (type: string) => {
		let params = {
			inventoryId: pageType == 'add' ? inventoryId : pageState?.id,
			inventoryDto: {
				departmentId: pageState?.departmentId,
				currentInventoryTime: pageState?.inventoryTime,
				lastInventoryTime: pageState?.lastInventoryTime,
				goodsList: changeList,
			},
		};
		const res =
			type == 'post' ? await submitInventoryList(params) : await saveInventoryList(params);
		if (res && res.code === 0) {
			saveData();
			notification.success('操作成功');
			history.goBack();
		}
	};

	const columns: ProColumns<InventoryController.FindInventoryRecord>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 'XXXS',
			align: 'center',
			renderText: (text: string, record: object, index: number) => index + 1,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 'L',
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 'S',
			ellipsis: true,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 'S',
		},
		{
			title: '盘库数量',
			dataIndex: 'actualQuantity',
			key: 'actualQuantity',
			width: 'S',
			render: (text, record) => {
				let location = history.location;
				return location &&
					(location.pathname.includes('check') || location.pathname.includes('add')) ? (
					<InputNumber
						onChange={(value: number) => {
							onChangeQuantity(value, record);
						}}
						value={
							record.newQuantity || record.newQuantity == 0
								? record.newQuantity
								: record.actualQuantity || 0
						}
						min={-999999}
						max={999999}
						style={{ width: '100px' }}
					/>
				) : (
					record.actualQuantity
				);
			},
		},
		{
			title: '单位',
			dataIndex: 'unitName',
			key: 'unitName',
			width: 120,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 180,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 120,
			align: 'right',
			render: (text, record) => {
				return <span>{text ? convertPriceWithDecimal(record.price) : '-'}</span>;
			},
		},
		{
			title: '条码管控',
			dataIndex: 'isBarcodeControlled',
			key: 'isBarcodeControlled',
			width: 120,
			renderText: (text: boolean) => (text == true ? '条码管控' : '非条码管控'),
		},
	];

	const addBreadCrumbArr = (value: string) => {
		return ['三级库管理', ['三级库盘点', '/threeStock/inventory', saveData], value];
	};
	let BreadCrumbType = {
		add: addBreadCrumbArr('新增盘库单'),
		detail: addBreadCrumbArr('详情'),
		check: addBreadCrumbArr('盘点'),
	};

	//获取上次盘库时间
	const getLastInventoryTimes = async (params: number) => {
		const res = await getLastInventoryTime({ departmentId: params });
		if (res && res.code === 0) {
			let result = res.data;
			const time: string = result
				? moment(Number(lastInventoryTime)).format('YYYY/MM/DD HH:mm:ss')
				: '';
			setLastInventoryTime(time);
		}
	};

	useEffect(() => {
		getDepartmentLists();
		notification.success('新增成功');
	}, []);

	const getDepartmentLists = async () => {
		let state: any = history.location.state;
		let res = await getDepartmentList();
		if (res && res.code === 0) {
			const depList = res.data.map((item) => {
				const { departmentName, departmentId, nameAcronym } = item;
				return {
					value: departmentId,
					label: departmentName,
					key: (nameAcronym || '') + '' + departmentName,
				};
			});
			setDepartmentList(depList);
		}
		let pageData = sessionStorage.pageData;
		// if (state) {
		//   let id = state && state.departmentId;
		//   let isId = (res.data || []).filter((item: any) => item.departmentId == id);
		// }

		if (!state && pageData) {
			let id = JSON.parse(pageData).departmentId;
			let departmentName = JSON.parse(pageData).departmentName;
			form.setFieldsValue({ departmentId: id });
			getLastInventoryTimes(id);
			if (departmentName) {
				setDepartmentName(departmentName);
			}
			sessionStorage.removeItem('pageData');
		}
	};

	// 获取科室
	useEffect(() => {
		let state = pageState;
		if (state) {
			setStockTimes(state.inventoryTime || state.currentInventoryTime);
			setDepartmentName(state?.departmentName as string);
			form.setFieldsValue({
				stockTimes: moment(state.inventoryTime || state.currentInventoryTime),
			});
			setLastInventoryTime(state?.lastInventoryTime as number);
		}
	}, [pageState]);

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
			title: '科室',
			dataIndex: 'departmentId',
			valueType: 'select',
			fieldProps: {
				allowClear: true,
				showSearch: true,
				options: departmentList,
				disabled: pageState,
				placeholder: pageState ? ' ' : '请选择科室',
				onChange: (value: any, params: any) => {
					getLastInventoryTimes(value);
					setDepartmentName(params.children);
				},
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
			initialValue: state.departmentId,

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
			title: '盘库时间',
			dataIndex: 'stockTimes',
			valueType: 'datePicker',
			fieldProps: {
				disabled: true,
				format: 'YYYY/MM/DD HH:mm:ss',
			},
			initialValue: stockTimes,
		},
		{
			title: '该科室上次盘库时间',
			dataIndex: 'remarks',
			valueType: 'remarks',
			fieldProps: {
				disabled: pageState,
				className: 'lastInventoryTime',
				remarks: [DealDate(Number(lastInventoryTime), 1, '-')],
			},
		},
	];

	//取消
	const onCancel = () => {
		saveData();
		history.goBack();
	};

	//保存库存单
	const handleOk = async (type: any) => {
		setModalData('');
		postListData(type);
	};

	return (
		<div
			className='main-page'
			key={keyData}>
			<div className='page-bread-crumb'>
				<Breadcrumb
					config={pageType ? ['', ['', '/threeStock/inventory', saveData], ''] : ['', '']}
				/>
			</div>
			<Card>
				<ProTable
					tableInfoCode={pageType === 'add' ? 'three_stock_add' : 'three_stock_detail'}
					searchConfig={{
						form,
						columns: searchColumns,
						submitter: {
							render: () => {
								return (
									<div className='searchWrap'>
										<div
											className='searchBtn'
											style={{ width: 270, marginTop: '20px' }}>
											{pageState && (
												<>
													{(pageState.pageType == 'check' || pageState.pageType == 'add') && (
														<>
															<Button
																type='primary'
																onClick={() => setModalData('save')}>
																保存
															</Button>
															<Button
																type='primary'
																onClick={() => setModalData('post')}>
																提交
															</Button>
														</>
													)}
													<Button onClick={onCancel}>返回</Button>
												</>
											)}
										</div>
									</div>
								);
							},
						},
					}}
					api={pageType ? listLoad[pageType] : getList}
					columns={columns}
					rowKey='id'
					tableRef={tableRef}
					params={
						pageType === 'add'
							? state
							: {
									inventoryId: state.id,
									departmentId: state.departmentId,
									currentInventoryTime: state.inventoryTime,
									lastInventoryTime: state.lastInventoryTime,
							  }
					}
					setRows={(res: Record<string, any>) => {
						if (res && res.code === 0) {
							let result = res.data;
							if (result.rows && pageType == 'add') {
								setInventoryId(result.inventoryId);
							}
							if (JSON.stringify(changeObj) !== '{}') {
								result.rows.forEach((item: { id: string | number }, index: string | number) => {
									if (changeObj[item.id]) {
										result.rows[index].newQuantity = changeObj[item.id].newQuantity;
									}
								});
							}
							setList(_.cloneDeep(result.rows));
						}
						return res.data;
					}}
				/>
			</Card>
			{modalData && (
				<ConfirmModal
					modalData={modalData}
					setModalData={setModalData}
					handleOk={handleOk}
					departmentName={departmentName}
					stockTimes={stockTimes}
				/>
			)}
		</div>
	);
};

export default connect(({ global }: { global: Record<string, any> }) => ({ global }))(
	inventoryList,
);
