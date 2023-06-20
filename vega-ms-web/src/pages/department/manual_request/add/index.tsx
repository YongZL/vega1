import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import GoodsInfo from '@/components/Modal/goodsInfo';
import PaginationBox from '@/components/Pagination';
import TableBox from '@/components/TableBox';
import { searchFormItem4 } from '@/constants/formLayout';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { scrollTable } from '@/utils';
import { Button, Card, Form, Input, InputNumber, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import GoodsInfoOrdinary from '../../../base_data/department/list/goodsInfo';
import {
	addRule,
	getWarehousesByUser,
	queryDetail,
	queryGoodsList,
	queryordinary,
	queryPackageBulkList,
	updateRule,
} from '../list/service';
import FormSearch from './formSearch';
import './index.less';
import { dealPackNum } from '@/utils/dataUtil';

const formparms = { ['statuses']: 'goods', ['warehouseId']: undefined };

const TableList: React.FC<{}> = (props) => {
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [nowType, setNowType] = useState('goods');
	const [goodsSelectList, setGoodsSelectList] = useState([]);
	const [goodsSelectedRowKeys, setGoodsSelectedRowKeys] = useState([]);
	const [bulksSelectList, setBulksSelectList] = useState([]);
	const [bulksSelectedRowKeys, setBulksSelectedRowKeys] = useState([]);
	const [ordinarySelectList, setordinarySelectList] = useState([]);
	const [ordinarySelectedRowKeys, setordinarySelectedRowKeys] = useState([]);
	const [total, setTotal] = useState(0);
	const [pageConfig, setPageConfig] = useState({ pageNum: 0, pageSize: 50 });
	const [tabeList, setTabeList] = useState([]);
	const [wareHousesList, setWareHousesList] = useState([]);
	const [acquiesceParameter, setAcquiesceParameter] = useState<object>(formparms);
	const [searchParams, setSearchParams] = useState({ statuses: 'goods' });
	const [goodsVisible, setGoodsVisible] = useState(false);
	const [ordinaryVisible, setOrdinaryVisible] = useState(false);
	const [goodsId, setGoodsId] = useState('');
	const [tagChecked, setTagChecked] = useState('');
	const [form] = Form.useForm();
	const [getChecked, setGetChecked] = useState(false);

	useEffect(() => {
		if (history.location.state) {
			sessionStorage.setItem('manual_request', JSON.stringify(history.location.state.params));
		}
	}, []);

	// 列表请求
	const queryGoodsLists = async (param: object) => {
		const params = {
			...pageConfig,
			...searchParams,
			isEnabled: true,
			...param,
			departmentAdd: false,
		};
		setLoading(true);
		params.departmentId = wareHousesList.find((item) => item.id == params.warehouseId).departmentId;
		let result;
		delete params.warehouseId;
		if (params.statuses == 'goods') {
			delete params.statuses;
			if (params.name) {
				params.goodsName = params.name;
			}
			delete params.name;
			if (!getChecked) {
				delete params.specification;
			}
			result = !getChecked && (await queryGoodsList(params));
		} else if (params.statuses == 'package_bulk') {
			delete params.statuses;
			result = await queryPackageBulkList(params);
		} else if (params.statuses == 'package_ordinary') {
			delete params.statuses;

			result = await queryordinary(params);
		}
		if (result.code === 0) {
			setTabeList(result.data.rows);
			setTotal(result.data.totalCount);
			setPageConfig({ pageNum: result.data.pageNum, pageSize: result.data.pageSize });
		}
		setLoading(false);
	};

	// 仓库列表请求
	useEffect(() => {
		const getWarehouses = async () => {
			const wareHouses = await getWarehousesByUser({ excludeCentralWarehouse: true });
			if (wareHouses.code == 0) {
				setWareHousesList(wareHouses.data);
			}
		};
		getWarehouses();
	}, []);
	useEffect(() => {
		if (props.match.params.warehouseId && wareHousesList.length > 0) {
			setAcquiesceParameter({ ...formparms, ['warehouseId']: props.match.params.warehouseId });
			setSearchParams({ ...searchParams, warehouseId: props.match.params.warehouseId });
		} else if (wareHousesList.length > 0) {
			if (wareHousesList[0].id) {
				setAcquiesceParameter({ ...formparms, ['warehouseId']: String(wareHousesList[0].id) });
				setSearchParams({ ...searchParams, warehouseId: wareHousesList[0].id });
			}
		}
	}, [wareHousesList]);

	// 表单改变更新列表
	useEffect(() => {
		if (searchParams.warehouseId && searchParams.statuses) {
			if ((props.match.params.id && tagChecked) || !props.match.params.id) {
				queryGoodsLists({});
			}
		}
	}, [searchParams]);

	const searchTableList = async (value: React.SetStateAction<{ statuses: string }>) => {
		if (value.warehouseId != searchParams.warehouseId) {
			setGoodsSelectList([]);
			// setGoodsSelectedRowKeys([]);
			// setBulksSelectList([]);
			// setBulksSelectedRowKeys([]);
			// setordinarySelectList([]);
			// setordinarySelectedRowKeys([]);
		}

		setNowType(value.statuses);
		setSearchParams({ ...searchParams, ...value });
	};

	// 编辑页时 请求详情并处理数据
	useEffect(() => {
		const getDetail = async (goodsRequestId: any) => {
			const details = await queryDetail({
				goodsRequestId,
			});
			if (details.code === 0) {
				let getNewData = [];
				if (Array.isArray(details.data)) {
					getNewData = details.data.map((item: { packageBulkId: any; goodsType: string }) => {
						if (item.packageBulkId) {
							item.goodsType = 'package_bulk';
						} else {
							item.goodsType = 'goods';
						}

						return item;
					});
				} else {
					getNewData = details.data.ordinaryGoods.map((item: { goodsType: string }) => {
						item.goodsType = 'package_ordinary';
						return item;
					});
				}

				const goodType = (getNewData[0] && getNewData[0].goodsType) || 'goods';

				setAcquiesceParameter({ ['statuses']: goodType });
				setSearchParams({ statuses: goodType });
				setNowType(goodType);
				setTagChecked(goodType);
				setNowType(goodType);
				setSearchParams({ statuses: goodType });

				let goodsSelectList,
					bulksSelectList,
					ordinarySelectList,
					goodsSelectedRowKeys,
					bulksSelectedRowKeys,
					ordinarySelectedRowKeys;
				goodsSelectList = getNewData
					.filter((item: { goodsType: string }) => {
						return item.goodsType == 'goods';
					})
					.map(
						(item: { goodsName: any; goodsId: any; quantity: number; conversionRate: number }) => ({
							...item,
							name: item.goodsName,
							id: item.goodsId,
							quantity: item.quantity / item.conversionRate,
							minTotal: item.quantity,
						}),
					);
				bulksSelectList = getNewData
					.filter((item: { goodsType: string }) => {
						return item.goodsType == 'package_bulk';
					})
					.map(
						(item: {
							goodsName: any;
							quantity: any;
							packageBulkGoodsQuantity: any;
							conversionUnitName: any;
							packageBulkId: any;
						}) => ({
							...item,
							name: item.goodsName,
							quantitys: item.quantity,
							quantity: item.packageBulkGoodsQuantity,
							unit: item.conversionUnitName,
							id: item.packageBulkId,
						}),
					);
				ordinarySelectList = getNewData
					.filter((item: { goodsType: string }) => {
						return item.goodsType == 'package_ordinary';
					})
					.map((item: { name: any; ordinaryId: any; requestNum: any }) => ({
						...item,
						name: item.name,
						id: item.ordinaryId,
						quantity: item.requestNum,
					}));
				goodsSelectedRowKeys = goodsSelectList.map((item: { goodsId: any }) => item.goodsId);
				bulksSelectedRowKeys = bulksSelectList.map((item: { id: any }) => item.id);
				ordinarySelectedRowKeys = ordinarySelectList.map(
					(item: { ordinaryId: any }) => item.ordinaryId,
				);
				setGoodsSelectList(goodsSelectList);
				setBulksSelectList(bulksSelectList);
				setordinarySelectList(ordinarySelectList);
				setordinarySelectedRowKeys(ordinarySelectedRowKeys);
				setGoodsSelectedRowKeys(goodsSelectedRowKeys);
				setBulksSelectedRowKeys(bulksSelectedRowKeys);
			}
			setLoading(false);
		};

		if (props.match.params.id) {
			setLoading(true);
			getDetail(props.match.params.id);
		}
	}, [props]);
	// 选择行
	const selectRow = (selectedRecord: any, selected: any) => {
		if (nowType == 'goods') {
			onGoodsRowSelectChange(selectedRecord, selected);
		} else if (nowType == 'package_bulk') {
			onBulkRowSelectChange(selectedRecord, selected);
		} else if (nowType == 'package_ordinary') {
			onSurgicalRowSelectChange(selectedRecord, selected);
		}
	};

	// 点击行
	const selectRowOfClick = (selectedRecord: object) => {
		const selectedRowKeys = [
			...bulksSelectedRowKeys,
			...goodsSelectedRowKeys,
			...ordinarySelectedRowKeys,
		];
		const index = selectedRowKeys.indexOf(selectedRecord.id);
		if (nowType == 'goods') {
			onGoodsRowSelectChange(selectedRecord, !(index >= 0));
		} else if (nowType == 'package_bulk') {
			onBulkRowSelectChange(selectedRecord, !(index >= 0));
		} else if (nowType == 'package_ordinary') {
			onSurgicalRowSelectChange(selectedRecord, !(index >= 0));
		}
	};
	// 当前为基础物资时点对击行的数据处理
	const onGoodsRowSelectChange = (selectedRecord: object, selected: boolean) => {
		if (bulksSelectedRowKeys.length > 0 || ordinarySelectedRowKeys.length > 0) {
			Modal.warning({
				title: '提示',
				content: '不允许跨耗材包装种类发起请领，请确认后重试！',
			});
			return;
		}
		const record = selectedRecord;
		const newGoodsSelectList = [...goodsSelectList],
			newGoodsSelectedRowKeys = [...goodsSelectedRowKeys];
		let rowKeyId;
		rowKeyId = selectedRecord.id;
		if (selected) {
			record.goodsType = nowType; //保存物品类型
			record.goodsId = record.id;
			record.quantity = '';
			record.minTotal = '';
			// record.minTotal = record.conversionRate;
			if (goodsSelectedRowKeys.indexOf(rowKeyId) < 0) {
				newGoodsSelectList.push(record);
				newGoodsSelectedRowKeys.push(rowKeyId);
			}
		} else {
			// 取消选中
			const index = goodsSelectedRowKeys.indexOf(rowKeyId);
			if (index >= 0) {
				newGoodsSelectedRowKeys.splice(index, 1);
				newGoodsSelectList.splice(index, 1);
			}
		}
		setGoodsSelectedRowKeys(newGoodsSelectedRowKeys);
		setGoodsSelectList(newGoodsSelectList);
	};
	// 当前为定数包时点对击行的数据处理
	const onBulkRowSelectChange = (selectedRecord: object, selected: boolean) => {
		if (goodsSelectedRowKeys.length > 0 || ordinarySelectedRowKeys.length > 0) {
			Modal.warning({
				title: '提示',
				content: '不允许跨耗材包装种类发起请领，请确认后重试！',
			});
			return;
		}
		const record = selectedRecord;
		const newBulksSelectList = [...bulksSelectList],
			newBulksSelectedRowKeys = [...bulksSelectedRowKeys];
		let rowKeyId;
		rowKeyId = selectedRecord.id;
		if (selected) {
			// 选中
			if (nowType == 'package_bulk') {
				if (ordinarySelectedRowKeys.length > 0 || goodsSelectedRowKeys.length > 0) {
					Modal.warning({
						title: '提示',
						content: '不允许跨耗材包装种类发起请领，请确认后重试！',
					});
					return;
				}
				record.packageBulkGoodsQuantity = selectedRecord.quantity;
			}
			record.goodsType = nowType; // 保存物品类型
			record.quantitys = '';
			if (bulksSelectedRowKeys.indexOf(rowKeyId) < 0) {
				newBulksSelectList.push(record);
				newBulksSelectedRowKeys.push(rowKeyId);
			}
		} else {
			// 取消选中
			const index = bulksSelectedRowKeys.indexOf(rowKeyId);
			if (index >= 0) {
				newBulksSelectedRowKeys.splice(index, 1);
				newBulksSelectList.splice(index, 1);
			}
		}
		setBulksSelectList(newBulksSelectList);
		setBulksSelectedRowKeys(newBulksSelectedRowKeys);
	};

	// 当前为医耗套包时点对击行的数据处理
	const onSurgicalRowSelectChange = (selectedRecord: object, selected: boolean) => {
		if (bulksSelectedRowKeys.length > 0 || goodsSelectedRowKeys.length > 0) {
			Modal.warning({
				title: '提示',
				content: '不允许跨耗材包装种类发起请领，请确认后重试！',
			});

			return;
		}
		const record = selectedRecord;
		const newordinarySelectList = [...ordinarySelectList],
			newordinarySelectedRowKeys = [...ordinarySelectedRowKeys];
		let rowKeyId;
		rowKeyId = selectedRecord.id;
		if (selected) {
			record.goodsType = nowType; //保存物品类型
			record.goodsId = record.id;
			record.quantity = '';
			if (ordinarySelectedRowKeys.indexOf(rowKeyId) < 0) {
				newordinarySelectList.push(record);
				newordinarySelectedRowKeys.push(rowKeyId);
			}
		} else {
			//取消选中
			const index = ordinarySelectedRowKeys.indexOf(rowKeyId);
			if (index >= 0) {
				newordinarySelectedRowKeys.splice(index, 1);
				newordinarySelectList.splice(index, 1);
			}
		}
		setordinarySelectedRowKeys(newordinarySelectedRowKeys);
		setordinarySelectList(newordinarySelectList);
	};
	// 点击全选复选框
	const onSelectAll = (selected: any, selectedRecords: any[]) => {
		if (!selected) {
			selectedRecords = tabeList;
		}
		if (nowType == 'goods') {
			if (bulksSelectedRowKeys.length > 0 || ordinarySelectedRowKeys.length > 0) {
				Modal.warning({
					title: '提示',
					content: '不允许跨耗材包装种类发起请领，请确认后重试！',
				});
				return;
			}
			let newGoodsSelectList = [...goodsSelectList],
				newGoodsSelectedRowKeys = [...goodsSelectedRowKeys];
			selectedRecords.forEach((item: { id: any }, i: any) => {
				let rowKeyId;
				rowKeyId = item.id;
				if (selected) {
					const record = item;
					record.goodsType = nowType; //保存物品类型
					record.goodsId = record.id;
					record.quantity = '';
					record.minTotal = record.conversionRate;
					if (goodsSelectedRowKeys.indexOf(rowKeyId) < 0) {
						newGoodsSelectList.push(record);
						newGoodsSelectedRowKeys.push(rowKeyId);
					}
				} else {
					newGoodsSelectedRowKeys = [];
					newGoodsSelectList = [];
				}
			});
			setGoodsSelectedRowKeys(newGoodsSelectedRowKeys);
			setGoodsSelectList(newGoodsSelectList);
		} else if (nowType == 'package_bulk') {
			if (ordinarySelectedRowKeys.length > 0 || goodsSelectedRowKeys.length > 0) {
				Modal.warning({
					title: '提示',
					content: '不允许跨耗材包装种类发起请领，请确认后重试！',
				});
				return;
			}
			let newBulksSelectList = [...bulksSelectList],
				newBulksSelectedRowKeys = [...bulksSelectedRowKeys];
			if (selected) {
				// 选中
				selectedRecords.forEach((item: { id: any; quantity: any }) => {
					const record = item;

					let rowKeyId;
					rowKeyId = item.id;
					// onBulkRowSelectChange(item, selected);
					record.packageBulkGoodsQuantity = item.quantity;
					record.goodsType = nowType; //保存物品类型
					record.quantitys = '';
					if (bulksSelectedRowKeys.indexOf(rowKeyId) < 0) {
						newBulksSelectList.push(record);
						newBulksSelectedRowKeys.push(rowKeyId);
					}
				});
			} else {
				newBulksSelectList = [];
				newBulksSelectedRowKeys = [];
			}
			setBulksSelectList(newBulksSelectList);
			setBulksSelectedRowKeys(newBulksSelectedRowKeys);
		} else if (nowType == 'package_ordinary') {
			if (bulksSelectedRowKeys.length > 0 || goodsSelectedRowKeys.length > 0) {
				Modal.warning({
					title: '提示',
					content: '不允许跨耗材包装种类发起请领，请确认后重试！',
				});
				return;
			}
			let newordinarySelectList = [...ordinarySelectList],
				newordinarySelectedRowKeys = [...ordinarySelectedRowKeys];
			selectedRecords.forEach((item: any) => {
				onSurgicalRowSelectChange(item, selected);
			});
			if (selected) {
				//选中
				selectedRecords.forEach((item: { id: any }) => {
					const record = item;

					let rowKeyId;
					rowKeyId = item.id;
					// onBulkRowSelectChange(item, selected);
					record.goodsType = nowType; //保存物品类型
					record.goodsId = record.id;
					record.quantity = '';
					if (ordinarySelectedRowKeys.indexOf(rowKeyId) < 0) {
						newordinarySelectList.push(record);
						newordinarySelectedRowKeys.push(rowKeyId);
					}
				});
			} else {
				newordinarySelectedRowKeys = [];
				newordinarySelectList = [];
			}
			setordinarySelectedRowKeys(newordinarySelectedRowKeys);
			setordinarySelectList(newordinarySelectList);
		}
	};
	// 删除行操作
	const selectDelete = (id: any, type: string) => {
		const newgoodsSelectList = [...goodsSelectList],
			newgoodsSelectedRowKeys = [...goodsSelectedRowKeys],
			newbulksSelectList = [...bulksSelectList],
			newbulksSelectedRowKeys = [...bulksSelectedRowKeys],
			newordinarySelectList = [...ordinarySelectList],
			newordinarySelectedRowKeys = [...ordinarySelectedRowKeys];
		if (type == 'goods') {
			newgoodsSelectList.forEach((item, index) => {
				if (item.id == id) {
					newgoodsSelectList.splice(index, 1);
				}
			});

			newgoodsSelectedRowKeys.splice(newgoodsSelectedRowKeys.indexOf(id), 1);
			setGoodsSelectedRowKeys(newgoodsSelectedRowKeys);
			setGoodsSelectList(newgoodsSelectList);
		} else if (type == 'package_bulk') {
			newbulksSelectList.forEach((item, index) => {
				if (item.id == id) {
					newbulksSelectList.splice(index, 1);
				}
			});
			newbulksSelectedRowKeys.splice(newbulksSelectedRowKeys.indexOf(id), 1);
			setBulksSelectList(newbulksSelectList);
			setBulksSelectedRowKeys(newbulksSelectedRowKeys);
		} else if (type == 'package_ordinary') {
			newordinarySelectList.forEach((item, index) => {
				if (item.id == id) {
					newordinarySelectList.splice(index, 1);
				}
			});
			newordinarySelectedRowKeys.splice(newordinarySelectedRowKeys.indexOf(id), 1);
			setordinarySelectList(newordinarySelectList);
			setordinarySelectedRowKeys(newordinarySelectedRowKeys);
		}
	};
	// 编辑数量操作
	const onChangeAddQuantity = (
		value: string | number | null,
		type: string,
		record: { id: any },
	) => {
		let newdata = [];
		if (type == 'goods') {
			newdata = goodsSelectList.map((item) =>
				item.id == record.id
					? { ...item, quantity: value, minTotal: value ? value * item.conversionRate : '' }
					: { ...item },
			);
			setGoodsSelectList(newdata);
		} else if (type == 'bulks') {
			newdata = bulksSelectList.map((item) =>
				item.id == record.id ? { ...item, quantitys: value } : { ...item },
			);
			setBulksSelectList(newdata);
		} else if (type == 'package_ordinary') {
			newdata = ordinarySelectList.map((item) =>
				item.id == record.id ? { ...item, quantity: value } : { ...item },
			);
			setordinarySelectList(newdata);
		}
	};

	// 提交时对数据的处理
	const getParams = (values: { statuses?: string; warehouseId?: any }) => {
		let newGoodsSelectList: any[] = [],
			newBulksSelectList: any[] = [],
			newordinarySelectList: any[] = [];

		let newGoodsList = goodsSelectList.filter((e) => e);

		for (const index in newGoodsList) {
			const i = Number(index) + 1;
			const minTotal = newGoodsList[index].minTotal;
			if (!minTotal) {
				scrollTable(i, 'tableEle', 9);
				notification.warning(`${fields.baseGoods} 选择请领项 第 ${i} 行请输入请领数量`);
				newGoodsList = [];
				return false;
			}

			newGoodsSelectList.push({
				goodsId: newGoodsList[index].id,
				quantity: minTotal,
				requestReason: newGoodsList[index].requestReason || '',
			});
		}

		for (const index in bulksSelectList) {
			const i = Number(index) + 1;
			const quantitys = bulksSelectList[index].quantitys;
			if (!quantitys) {
				notification.warning('定数包 选择请领项 第 ' + i + ' 行请输入请领数量');
				newBulksSelectList = [];
				return false;
			}
			newBulksSelectList.push({ packageBulkId: bulksSelectList[index].id, quantity: quantitys });
		}

		for (const index in ordinarySelectList) {
			const i = Number(index) + 1;
			const quantity = ordinarySelectList[index].quantity;
			if (!quantity) {
				notification.warning('医耗套包 选择请领项 第 ' + i + ' 行请输入请领数量');
				newordinarySelectList = [];
				return false;
			}
			newordinarySelectList.push({ ordinaryId: ordinarySelectList[index].id, quantity: quantity });
		}
		const params = {
			warehouseId: values.warehouseId || props.match.params.warehouseId,
			items: [...newBulksSelectList, ...newGoodsSelectList, ...newordinarySelectList],
		};
		return params;
	};
	// 新增/编辑的提交操作
	const sureSubmit = async () => {
		const allSelect = [
			...goodsSelectedRowKeys,
			...bulksSelectedRowKeys,
			...ordinarySelectedRowKeys,
		];

		if (allSelect.length <= 0) {
			notification.error(`请选择${fields.baseGoods}`);
			return;
		}

		let params: any = getParams(searchParams);
		if (!params) return;

		params = { ...params, ordinaryId: tabeList.id };

		let res;
		setSubmitLoading(true);
		if (props.match.params.id) {
			params.id = props.match.params.id;
			res = await updateRule(params);
		} else {
			res = await addRule(params);
		}
		setSubmitLoading(false);
		if (res && res.code === 0) {
			history.push({ pathname: '/department/manual_request', state: 'manual_request' });
			// notification.success('发起请领成功，等待护士长审核');
		}
	};
	const backPage = () => {
		history.push({ pathname: '/department/manual_request', state: 'manual_request' });
	};

	// 基础物资详情
	const goodsDetail = (e: any, id: string) => {
		e.stopPropagation();
		setGoodsId(id);
		setGoodsVisible(true);
	};
	// 医耗套包资详情
	const ordinaryDetail = (e: any, id: string) => {
		e.stopPropagation();
		setGoodsId(id);
		setOrdinaryVisible(true);
	};

	const onChangeReason = (val: React.ChangeEvent<HTMLInputElement>, record: { id: any }) => {
		const { value } = val.target;
		setGoodsSelectList(
			goodsSelectList.map((item) =>
				record.id === item.id
					? {
							...item,
							requestReason: value,
					  }
					: { ...item },
			),
		);
	};

	const inputNumberElement = (type: string, record: any, text: any) => {
		return (
			<div style={{ display: 'flex' }}>
				<InputNumber
					min={1}
					max={99999}
					style={{ width: '80px' }}
					key={record.id}
					// disabled={record.isDanger}
					defaultValue={text ? Number(text) : ''}
					onChange={(value) => {
						onChangeAddQuantity(value, type, record);
					}}
				/>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column-reverse',
						justifyContent: 'center',
						marginLeft: '4px',
					}}>
					{record.conversionUnitName}
				</div>
			</div>
		);
	};
	const columnsGoods = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			render: (text: any, redord: any, index: number) => <span>{index + 1}</span>,
			width: 80,
		},
		{
			title: fields.goodsName,
			dataIndex: 'name',
			width: 150,
			ellipsis: true,
		},
		{
			title: '通用名',
			dataIndex: 'commonName',
			key: 'commonName',
			width: 100,
			ellipsis: true,
		},
		{
			title: '收费编码',
			dataIndex: 'chargeCode',
			key: 'chargeCode',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: Record<string, any>) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 150,
			ellipsis: true,
		},
		{
			title: '收费项',
			dataIndex: 'chargeName',
			key: 'chargeName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 150,
			align: 'right',
			render: (price: string | number | undefined) => convertPriceWithDecimal(price),
		},
		{
			title: '请领单位',
			dataIndex: 'conversionRate',
			width: 120,
			render: (text: any, record: { minGoodsUnit: any; conversionUnitName: any }) => {
				return `${text}${record.minGoodsUnit}/${record.conversionUnitName}`;
			},
		},
		{
			title: '大/中包装',
			dataIndex: 'largeBoxNum',
			width: 120,
			render: (text: any, record: { minGoodsNum: any }) => dealPackNum(text, record.minGoodsNum),
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '可用库存',
			dataIndex: 'stocks',
			width: 100,
			ellipsis: true,
		},
		{
			title: '请领数量',
			dataIndex: 'quantity',
			width: 100,
			render: (text: any, record: any) => {
				return inputNumberElement('goods', record, text);
			},
		},
		{
			title: '小计',
			dataIndex: 'minTotal',
			width: 60,
			render: (text: any, record: { minTotal: any; minGoodsUnit: any }) => {
				return record.minTotal ? `${record.minTotal}${record.minGoodsUnit}` : '-';
			},
		},
		{
			title: '小计金额(元)',
			dataIndex: 'totalPrice',
			width: 120,
			align: 'right',
			render: (text: number, record: { minTotal: number; price: number }) => {
				// 后端字经过处理返回结果并无*10000
				return record.minTotal ? convertPriceWithDecimal(record.price * record.minTotal) : '-';
			},
		},
		{
			title: '备注',
			dataIndex: 'requestReason',
			width: 100,
			render: (text: string | number | readonly string[] | undefined, record: any) => {
				return (
					<>
						<Input
							defaultValue={text ? text : ''}
							onChange={(val) => onChangeReason(val, record)}
							placeholder='请输入备注'
							maxLength={25}
						/>
					</>
				);
			},
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 40,
			fixed: 'right',
			render: (_: any, record: { id: any }) => {
				return (
					<div
						className='operation'
						onClick={() => {
							selectDelete(record.id, 'goods');
						}}>
						<span className='handleLink'>删除</span>
					</div>
				);
			},
		},
	];
	const columnsBulks = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			render: (text: any, redord: any, index: number) => <span>{index + 1}</span>,
			width: 80,
		},
		{
			title: '定数包名称',
			dataIndex: 'packageBulkName',
			width: 150,
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '通用名',
			dataIndex: 'commonName',
			key: 'commonName',
			width: 100,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: Record<string, any>) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '包装数',
			dataIndex: 'packageBulkGoodsQuantity',
			width: 140,
			render: (text: any, record: { quantity: any; unit: any; packageBulkUnit: string }) => {
				return <span>{record.quantity + record.unit + '/' + record.packageBulkUnit}</span>;
			},
		},
		{
			title: '可用库存',
			dataIndex: 'stocks',
			width: 100,
			ellipsis: true,
		},
		{
			title: '请领数量',
			dataIndex: 'quantitys',
			width: 100,
			render: (text: any, record: any) => {
				return inputNumberElement('bulks', record, text);
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 150,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 150,
			ellipsis: true,
		},
		{
			title: '收费项',
			dataIndex: 'chargeName',
			key: 'chargeName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 150,
			align: 'right',
			render: (price: string | number | undefined) => convertPriceWithDecimal(price),
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 40,
			fixed: 'right',
			render: (_: any, record: { id: any }) => {
				return (
					<div
						className='operation'
						onClick={() => {
							selectDelete(record.id, 'package_bulk');
						}}>
						<span className='handleLink'>删除</span>
					</div>
				);
			},
		},
	];
	const columnsordinary = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			render: (text: any, redord: any, index: number) => <span>{index + 1}</span>,
			width: 80,
		},
		{
			title: '医耗套包编号',
			dataIndex: 'ordinaryCode',
			width: 150,
			ellipsis: true,
		},
		{
			title: '医耗套包名称',
			dataIndex: 'name',
			width: 150,
			ellipsis: true,
		},
		{
			title: '医耗套包说明',
			dataIndex: 'detailGoodsMessage',
			width: 150,
			ellipsis: true,
			render: (text: any, record: { description: any }) =>
				record.description ? record.description : text,
		},
		{
			title: '可用库存',
			dataIndex: 'stocks',
			width: 100,
			ellipsis: true,
		},
		{
			title: '请领数量',
			dataIndex: 'quantity',
			width: 100,
			render: (text: any, record: any) => {
				return inputNumberElement('package_ordinary', record, text);
			},
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 40,
			fixed: 'right',
			render: (_: any, record: { id: any }) => {
				return (
					<div
						className='operation'
						onClick={() => {
							selectDelete(record.id, 'package_ordinary');
						}}>
						<span
							style={{ color: CONFIG_LESS['@c_starus_warning'] }}
							className='handleLink'>
							删除
						</span>
					</div>
				);
			},
		},
	];
	const goodsColumns = [
		{
			title: fields.goodsName,
			dataIndex: 'name',
			width: 150,
			ellipsis: true,
		},
		{
			title: '通用名',
			dataIndex: 'commonName',
			key: 'commonName',
			width: 100,
			ellipsis: true,
		},
		{
			title: '收费编码',
			dataIndex: 'chargeCode',
			key: 'chargeCode',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: Record<string, any>) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 150,
			ellipsis: true,
		},
		{
			title: '收费项',
			dataIndex: 'chargeName',
			key: 'chargeName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 150,
			align: 'right',
			render: (price: string | number | undefined) => convertPriceWithDecimal(price),
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '请领单位',
			dataIndex: 'conversionRate',
			width: 120,
			render: (text: any, record: { minGoodsUnit: any; conversionUnitName: any }) => {
				return `${text}${record.minGoodsUnit}/${record.conversionUnitName}`;
			},
		},
		{
			title: '大/中包装',
			dataIndex: 'largeBoxNum',
			width: 120,
			render: (text: any, record: { minGoodsNum: any }) => dealPackNum(text, record.minGoodsNum),
		},
		{
			title: fields.goodsProperty,
			dataIndex: 'isHighValue',
			width: 110,
			renderText: (text: boolean) => (typeof text === 'boolean' ? (text ? '高值' : '低值') : '-'),
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			width: 150,
		},
		{
			title: '可用库存',
			dataIndex: 'stocks',
			width: 100,
			ellipsis: true,
		},
	];
	const bulksColumns = [
		{
			title: '定数包名称',
			dataIndex: 'packageBulkName',
			width: 160,
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			width: 160,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			render: (text: any, record: { specification: any; model: any }) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '包装数',
			dataIndex: 'quantityUnit',
			key: 'quantityUnit',
			width: 120,
			render: (text: any, record: { quantity: any; unit: any; packageBulkUnit: string }) => {
				return <span>{record.quantity + record.unit + '/' + record.packageBulkUnit}</span>;
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 150,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			key: 'chargeNum',
			width: 150,
			ellipsis: true,
		},
		{
			title: '收费项',
			dataIndex: 'chargeName',
			key: 'chargeName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 150,
			align: 'right',
			render: (price: string | number | undefined) => convertPriceWithDecimal(price),
		},
		{
			title: '可用库存',
			dataIndex: 'stocks',
			width: 100,
			ellipsis: true,
		},
	];

	const ordinaryColumns = [
		{
			title: '医耗套包编号',
			dataIndex: 'ordinaryCode',
			width: 150,
			ellipsis: true,
		},
		{
			title: '医耗套包名称',
			dataIndex: 'name',
			width: 150,
			ellipsis: true,
			render: (
				text:
					| boolean
					| React.ReactChild
					| React.ReactFragment
					| React.ReactPortal
					| null
					| undefined,
				record: { id: string },
			) => (
				<a
					href='JavaScript:'
					className='handleLink'
					onClick={(e) => ordinaryDetail(e, record.id)}>
					{text}
				</a>
			),
		},
		{
			title: '医耗套包说明',
			dataIndex: 'detailGoodsMessage',
			width: 150,
			ellipsis: true,
			render: (text: any, record: { description: any }) =>
				record.description ? record.description : text,
		},
		{
			title: '可用库存',
			dataIndex: 'stocks',
			width: 100,
			ellipsis: true,
		},
	];

	const rowSelectionGoods = {
		selectedRowKeys: goodsSelectedRowKeys,

		onSelect: selectRow,
		onSelectAll: onSelectAll,
		columnWidth: 40,
	};
	const rowSelectionBulks = {
		selectedRowKeys: bulksSelectedRowKeys,
		onSelect: selectRow,
		onSelectAll: onSelectAll,
		columnWidth: 40,
	};
	const rowSelectionordinary = {
		selectedRowKeys: ordinarySelectedRowKeys,
		onSelect: selectRow,
		onSelectAll: onSelectAll,
		columnWidth: 40,
	};
	const searchTable = {
		goods: {
			tabName: fields.baseGoods,
			key: 'goods',
			columns: goodsColumns,
			rowSelection: rowSelectionGoods,
			tableInfoId: '37',
		},
		package_bulk: {
			tabName: '定数包',
			key: 'package_bulk',
			columns: bulksColumns,
			rowSelection: rowSelectionBulks,
			tableInfoId: '38',
		},
		package_ordinary: {
			tabName: '医耗套包',
			key: 'package_ordinary',
			columns: ordinaryColumns,
			rowSelection: rowSelectionordinary,
			tableInfoId: '241',
		},
	};
	// 查询表单组件的带参
	const formSearchParms = {
		acquiesceParameter,
		wareHousesList,
		searchTableList,
	};

	const cancelSelect = () => {
		switch (nowType) {
			case 'goods':
				setGoodsSelectList([]);
				setGoodsSelectedRowKeys([]);
				break;
			case 'package_bulk':
				setBulksSelectedRowKeys([]);
				setBulksSelectList([]);
				break;
			case 'package_ordinary':
				setordinarySelectList([]);
				setordinarySelectedRowKeys([]);
				break;
			default:
				break;
		}
	};

	const tableEle = (columns: any, rowSelection: any, tableInfoId: any) => {
		return (
			<TableBox
				headerTitle=''
				tableInfoId={tableInfoId}
				options={{
					reload: () => queryGoodsLists({}),
				}}
				size='middle'
				columns={columns}
				rowKey='id'
				pagination={false}
				dataSource={tabeList}
				rowSelection={rowSelection}
				onRow={(record: object) => ({
					onClick: () => {
						selectRowOfClick(record);
					},
				})}
				scroll={{ x: '100%', y: 300 }}
				loading={loading}
				tableAlertOptionRender={
					<a
						onClick={() => {
							cancelSelect();
						}}>
						取消选择
					</a>
				}
			/>
		);
	};

	const onGetQueryData = (val: boolean | ((prevState: boolean) => boolean)) => {
		setGetChecked(val);
	};

	const onSelectedData = (val: never) => {
		if ((bulksSelectedRowKeys.length > 0 || ordinarySelectedRowKeys.length > 0) && getChecked) {
			Modal.warning({
				title: '提示',
				content: '不允许跨耗材包装种类发起请领，请确认后重试！',
			});
			return;
		}
		selectRowOfClick(val);
		setGoodsSelectList(val);
	};

	useEffect(() => {
		rowKeys();
	}, [goodsSelectList]);

	const rowKeys = () => {
		const arr = goodsSelectList.flatMap((item) => {
			return item.id;
		});
		setGoodsSelectedRowKeys(arr);
	};

	const onClearData = () => setGoodsSelectList([]);

	return (
		<div>
			<Breadcrumb
				config={[
					'',
					['', { pathname: '/department/manual_request', state: 'manual_request_list' }],
					`'}`,
				]}
			/>

			<Form
				form={form}
				{...searchFormItem4}
				labelAlign='left'>
				{/* <Card style={{marginBottom:'15px'}}>
      <Steps size="small" style={{width:'1450px',marginLeft:'24px'}}  current={4}>
        <Step title="选择仓库"  status={'finish '}/>
        <Step title="勾选物资" status={'finish '}/>
        <Step title="填写请领数量" status={'finish '} />
        <Step title="点击确认操作" status={'finish '} />
      </Steps>
    </Card> */}
				<Card bordered={false}>
					<FormSearch
						{...formSearchParms}
						type={props.match.params.id ? 'edit' : 'add'}
						goodsSelectedList={goodsSelectList}
						onClearData={onClearData}
						onSelectedData={onSelectedData}
						onGetQueryData={onGetQueryData}
						tagChecked={tagChecked}
					/>
					{nowType === 'goods' && !getChecked ? (
						<>{tableEle(goodsColumns, rowSelectionGoods, '37')}</>
					) : null}
					{nowType === 'package_bulk' && <>{tableEle(bulksColumns, rowSelectionBulks, '38')}</>}
					{nowType === 'package_ordinary' && (
						<>{tableEle(ordinaryColumns, rowSelectionordinary, '241')}</>
					)}
					{total && !getChecked ? (
						<PaginationBox
							data={{ total, ...pageConfig }}
							pageChange={(pageNum: number, pageSize: number) =>
								queryGoodsLists({ pageNum, pageSize })
							}
						/>
					) : null}
				</Card>
				<Card
					bordered={false}
					className='mt2 mb6'>
					<span className='cardTitle'>选择请领项</span>
					{nowType === 'goods' && (
						<TableBox
							headerTitle={fields.baseGoods}
							tableInfoId='109'
							size='middle'
							rowKey='id'
							pagination={false}
							columns={columnsGoods}
							dataSource={goodsSelectList}
							scroll={{ x: '100%', y: 300 }}
						/>
					)}
					{nowType === 'package_bulk' && (
						<TableBox
							headerTitle='定数包'
							tableInfoId='110'
							size='middle'
							rowKey='id'
							pagination={false}
							columns={columnsBulks}
							dataSource={bulksSelectList}
							scroll={{ x: '100%', y: 300 }}
						/>
					)}
					{nowType === 'package_ordinary' && (
						<div id='tableEle'>
							<TableBox
								headerTitle='医耗套包'
								tableInfoId='242'
								rowkey='id'
								size='middle'
								pagination={false}
								columns={columnsordinary}
								dataSource={ordinarySelectList}
								scroll={{ x: '100%', y: 300 }}
							/>
						</div>
					)}
				</Card>
				<FooterToolbar>
					<Button
						onClick={() => {
							backPage();
						}}>
						返回
					</Button>
					<Button
						onClick={() => {
							sureSubmit();
						}}
						type='primary'
						loading={submitLoading}>
						确认操作
					</Button>
				</FooterToolbar>

				{/* 基础物资详情 */}
				<GoodsInfo
					visible={goodsVisible}
					setVisible={setGoodsVisible}
					id={goodsId}
				/>
				<GoodsInfoOrdinary
					visible={ordinaryVisible}
					setVisible={setOrdinaryVisible}
					id={goodsId}
				/>
			</Form>
		</div>
	);
};

export default TableList;
