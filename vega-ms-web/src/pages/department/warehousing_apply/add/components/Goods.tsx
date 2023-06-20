import PopTipConfirm from '@/components/PopTipConfirm';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { goodsItemStatusTextMap } from '@/constants/dictionary';
import { getGoodsByDepartment } from '@/services/goodsTypes';
import { searchGoods } from '@/services/stock';
import { judgeBarCodeOrUDI, transformSBCtoDBC } from '@/utils';
import { dealPackNum } from '@/utils/dataUtil';
import { convertPriceWithDecimal, formatPackageQuantity, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Form, Input, InputNumber, message } from 'antd';
import { cloneDeep, debounce } from 'lodash';
// import { number } from 'prop-types';
import type { ProFormInstance, FormInstance } from '@ant-design/pro-form';
import { ChangeEvent, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useModel } from 'umi';
import { PropsType } from '../data';
import style from './style.less';
const FormItem = Form.Item;
type ReallocationRecord = GoodsTypesController.ReallocationRecord;
type GoodsByDepartmentRecord = GoodsTypesController.GoodsByDepartmentRecord;

const Goods: React.FC<PropsType> = ({ ...props }) => {
	const [form] = Form.useForm();
	const formRef = useRef<FormInstance & ProFormInstance>();
	const { fields } = useModel('fieldsMapping');
	const tableRef = useRef<ProTableAction>();
	const isDepartment = useRef<boolean>(false);
	const [isAllocation, setIsAllocation] = useState(false);
	const [departmentId, setDepartmentId] = useState<number>();
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const [selectList, setSelectList] = useState<GoodsByDepartmentRecord[]>([]);
	const { comRef, selectValidation, sourceWarehouseData, goodsList, check } = props;
	const { targetWarehouseData, sourceWarehouseId, warehouseObj, pageId } = props;
	const [reallocationList, setReallocationList] = useState<ReallocationRecord[]>([]);
	const [targetWarehouseId, setTargetWarehouseId] = useState(props.targetWarehouseId);
	const [isAutoFocus, setIsAutoFocus] = useState<boolean>(false);
	// 暴露方法
	useImperativeHandle(comRef, () => ({
		selectList: () => {
			return selectList.length ? selectList : reallocationList;
		},
		getSearchWarehouse: () => {
			return form.getFieldsValue(['sourceWarehouseId', 'targetWarehouseId']);
		},
		isAllocation: isAllocation,
	}));
	useEffect(() => {
		if (
			(check && selectList.length) ||
			(!selectList.length &&
				form.getFieldValue('sourceWarehouseId') &&
				form.getFieldValue('targetWarehouseId'))
		) {
			setTimeout(() => {
				tableRef.current?.submit();
			}, 260);
		}
	}, [check]);
	useEffect(() => {
		let rowKeyArr = [],
			selectListArr: GoodsByDepartmentRecord[] = [],
			len = goodsList?.length;
		if (len && goodsList) {
			for (let i = 0; i < len; i++) {
				let item = goodsList[i];
				rowKeyArr.push(item.goodsId);
				selectListArr.push({ ...item, minTotal: item.quantity });
			}
			setSelectList([...selectListArr]);
			setSelectedRowKeys([...rowKeyArr]);
		}
	}, [goodsList]);

	useEffect(() => {
		setTimeout(() => {
			form.setFieldsValue({ sourceWarehouseId });
		}, 200);
	}, [sourceWarehouseId]);

	useEffect(() => {
		form.setFieldsValue({ targetWarehouseId });
		setTimeout(() => {
			if (targetWarehouseId) {
				setDepartmentId(warehouseObj[targetWarehouseId]);
				isDepartment.current = true;
			}
		}, 210);
	}, [targetWarehouseId]);
	useEffect(() => {
		if (targetWarehouseData.length === 1) {
			setTargetWarehouseId(targetWarehouseData[0].value);
		}
	}, [targetWarehouseData]);

	// 编辑数量操作
	const onChangeAddQuantity = (value: number, record: { id: number }) => {
		document.querySelector(`#erro${record.id}`).style.border = '';
		const newValue = value ? Math.floor(value) : value;
		const newData = selectList.map(
			(item: GoodsByDepartmentRecord) =>
				item.id !== record.id
					? { ...item }
					: {
							...item,
							quantity: newValue,
							minTotal: newValue || '',
					  }, //有公共方法写这里
		) as GoodsByDepartmentRecord[];
		setSelectList(newData);
	};

	const inputNumberElement = (record: GoodsByDepartmentRecord) => {
		const { quantity } = record;
		return (
			<FormItem
				style={{ margin: 0 }}
				name={`quantity${record.id}`}
				initialValue={quantity ? Number(quantity) : undefined}
				rules={[
					{ required: true, message: '请输入' },
					{
						validator: (_rule, value: string) => {
							if (!value) {
								return Promise.resolve();
							} else {
								if (Number(value) % record.conversionRate !== 0) {
									return Promise.reject(`请输入 ${record.conversionRate} 的倍数`);
								}
								return Promise.resolve();
							}
						},
					},
				]}>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<InputNumber
						min={1}
						max={9999999}
						style={{ flex: 1 }}
						key={record.id}
						onChange={(value) => onChangeAddQuantity(value, record)}
						value={quantity ? Number(quantity) : undefined}
						id={'erro' + record.id}
						autoFocus={isAutoFocus}
					/>
					<div
						style={{
							marginLeft: '4px',
						}}>
						{record.minGoodsUnit}
					</div>
				</div>
			</FormItem>
		);
	};

	const onChangeReason = (val: ChangeEvent<HTMLInputElement>, record: GoodsByDepartmentRecord) => {
		const { value } = val.target;
		setSelectList(
			selectList.map((item: { id: number }) =>
				record.id === item.id
					? {
							...item,
							requestReason: value,
					  }
					: { ...item },
			) as GoodsByDepartmentRecord[],
		);
	};

	//删除
	const selectDelete = (id: number) => {
		const newSelectList = [...selectList],
			newSelectedRowKeys = [...selectedRowKeys];
		newSelectList.forEach((item, index) => {
			if (item.id === id) {
				newSelectList.splice(index, 1);
			}
		});

		let index = newSelectedRowKeys.indexOf(id);
		if (index > -1) {
			newSelectedRowKeys.splice(index, 1);
		}
		setSelectList(newSelectList);
		setSelectedRowKeys(newSelectedRowKeys);
	};

	// 扫码
	const scanSubmit = async (scanValue: string) => {
		const operatorBarcode = transformSBCtoDBC(scanValue);
		try {
			const res = await searchGoods({
				operatorBarcode: operatorBarcode,
				warehouseId: form.getFieldValue('sourceWarehouseId'),
			});

			if (res && res.code === 0) {
				let status = res.data?.status;
				if (status && status !== 'put_on_shelf') {
					const statusN = goodsItemStatusTextMap[status];
					notification.error(`该${fields.goods}状态为${statusN}，不可调拨`);
					return;
				}
				if (!reallocationList.find((item) => item.id === res.data.id)) {
					let list = cloneDeep(reallocationList);
					const goodsData: any = res.data;
					list.push({
						...goodsData,
						quantity: goodsData.allotNum || 1,
						allotNum: goodsData.allotNum || 1,
					});
					setReallocationList(list);
				} else {
					notification.error(`该${fields.goods}已添加`);
				}
			}
		} finally {
			form.setFieldsValue({ scanValue: '' });
		}
	};

	//点击供货仓库和到货仓库
	const clickTip = () => {
		if (selectList.length) {
			message.warn(`当前选择供货&到货仓库已有${fields.goods}勾选，请取消勾选后尝试更换仓库！`);
			return;
		}
		if (reallocationList.length) {
			message.warn(`当前选择供货&到货仓库已有${fields.goods}，请删除列表数据后尝试更换仓库！`);
			return;
		}
	};

	const renderStocks = (value: number) => {
		let stocks = Number(value || 0);
		return stocks && stocks > 0 ? (
			stocks
		) : (
			<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>0</span>
		);
	};

	const getColumn = (type: boolean, isSupportDialog?: boolean) => {
		const columns: ProColumns<GoodsByDepartmentRecord>[] = [
			{
				title: '序号',
				dataIndex: 'index',
				key: 'index',
				align: 'center',
				render: (text, record, index) => index + 1,
				width: 80,
			},
			{
				title: fields.goodsName,
				dataIndex: 'name',
				width: 150,
				ellipsis: true,
				render: (text, record) => {
					const { imgUrlList, name, goodsName } = record;
					return imgUrlList ? (
						<div style={{ display: 'flex' }}>
							{name || goodsName}
							{imgUrlList.map((imgUrl) => (
								<PopTipConfirm
									imgUrl={imgUrl}
									isSupportDialog={isSupportDialog}
								/>
							))}
						</div>
					) : (
						name || goodsName
					);
				},
			},
			{
				title: '请领数量基数',
				dataIndex: 'conversionRate',
				width: 120,
				render: (text, record) => {
					return `${text} ${record.minGoodsUnit}`;
				},
			},
			{
				title: '大/中包装',
				dataIndex: 'largeBoxNum',
				width: 120,
				render: (text, record) => dealPackNum(record.largeBoxNum, record.minGoodsNum),
			},
			{
				title: '可用库存',
				dataIndex: 'stocks',
				width: 100,
				ellipsis: true,
				render: (text, record) => renderStocks(record.stocks),
			},
			{
				title: '通用名称',
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
				renderText: (text, record) => {
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
				title: '单价(元)',
				dataIndex: 'price',
				key: 'price',
				width: 150,
				align: 'right',
				render: (text, record) => convertPriceWithDecimal(record.price),
			},
			{
				title: '本地医保编码',
				dataIndex: 'chargeNum',
				key: 'chargeNum',
				width: 150,
				ellipsis: true,
				hideInTable: !type,
			},
			{
				width: 150,
				title: '国家医保编码',
				dataIndex: 'nationalNo',
				key: 'nationalNo',
				ellipsis: true,
				hideInTable: !type,
			},
			{
				title: '收费编码',
				dataIndex: 'chargeCode',
				key: 'chargeCode',
				width: 150,
				ellipsis: true,
				hideInTable: !type,
			},
			{
				title: '收费项',
				dataIndex: 'chargeName',
				key: 'chargeName',
				width: 150,
				ellipsis: true,
				hideInTable: !type,
			},
		];

		const arr: ProColumns<GoodsByDepartmentRecord>[] = [
			{
				title: '序号',
				dataIndex: 'index',
				key: 'index',
				align: 'center',
				render: (text, record, index) => index + 1,
				width: 80,
			},
			{
				title: fields.goodsName,
				dataIndex: 'name',
				width: 150,
				ellipsis: true,
				render: (text, record) => {
					const { imgUrlList, name, goodsName } = record;
					return imgUrlList ? (
						<div style={{ display: 'flex' }}>
							{name || goodsName}
							{imgUrlList.map((imgUrl) => (
								<PopTipConfirm
									imgUrl={imgUrl}
									isSupportDialog={isSupportDialog}
								/>
							))}
						</div>
					) : (
						name || goodsName
					);
				},
			},
			{
				title: '请领数量基数',
				dataIndex: 'conversionRate',
				width: 120,
				render: (text, record) => {
					return `${text}${record.minGoodsUnit}`;
				},
			},
			{
				title: '请领数量',
				dataIndex: 'quantity',
				width: 180,
				render: (text, record) => inputNumberElement(record),
			},
			{
				title: '小计数量',
				dataIndex: 'minTotal',
				width: 100,
				render: (text, record) => {
					return record.minTotal ? `${record.minTotal}${record.minGoodsUnit}` : '-';
				},
			},
			{
				title: '大/中包装',
				dataIndex: 'largeBoxNum',
				width: 120,
				render: (text, record) => dealPackNum(record.largeBoxNum, record.minGoodsNum),
			},
			{
				title: '大/中/散',
				dataIndex: 'packaging',
				ellipsis: true,
				width: 80,
				render: (text, record) =>
					record.quantity
						? formatPackageQuantity({
								goods: record,
								quantity: 'minTotal',
						  })
						: '0/0/0',
			},
			{
				title: '可用库存',
				dataIndex: 'stocks',
				width: 100,
				ellipsis: true,
				render: (text, record) => renderStocks(record.stocks),
			},
			{
				title: '备注',
				dataIndex: 'requestReason',
				width: 100,
				render: (_text, record) => {
					return (
						<>
							<Input
								defaultValue={record.requestReason || ''}
								onChange={(value) => onChangeReason(value, record)}
								placeholder='请输入备注'
								maxLength={25}
							/>
						</>
					);
				},
			},
			{
				title: '通用名称',
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
				renderText: (text, record) => {
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
				title: '单价(元)',
				dataIndex: 'price',
				key: 'price',
				width: 150,
				align: 'right',
				render: (text, record) => convertPriceWithDecimal(record.price),
			},
			{
				title: '小计金额(元)',
				dataIndex: 'totalPrice',
				width: 120,
				align: 'right',
				render: (text, record) => {
					const { minTotal, price }: Record<string, any> = record;
					return minTotal ? convertPriceWithDecimal(price * minTotal) : '-';
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
				width: 'M',
				title: '国家医保编码',
				dataIndex: 'nationalNo',
				key: 'nationalNo',
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
				title: '收费项',
				dataIndex: 'chargeName',
				key: 'chargeName',
				width: 150,
				ellipsis: true,
			},
			{
				title: '操作',
				dataIndex: 'option',
				key: 'option',
				width: 60,
				fixed: 'right',
				render: (_, record) => {
					return (
						<span
							className='handleLink'
							onClick={() => selectDelete(record.id)}>
							删除
						</span>
					);
				},
			},
		];
		return type ? columns : arr;
	};

	const searchColumn: ProFormColumns = [
		{
			title: '供货仓库',
			dataIndex: 'sourceWarehouseId',
			valueType: 'select',
			fieldProps: {
				showSearch: true,
				allowClear: false,
				onChange: (value: number) => {
					setIsAllocation(value !== sourceWarehouseId);
				},
				disabled: pageId || selectList.length || reallocationList.length,
				options: sourceWarehouseData,
				filterOption: (input, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
				onClick: () => clickTip(),
			},
			formItemProps: {
				rules: [{ required: true, message: '请选择供货仓库' }],
			},
		},
		{
			title: '到货仓库',
			dataIndex: 'targetWarehouseId',
			valueType: 'select',
			fieldProps: {
				showSearch: true,
				allowClear: false,
				onChange: (value: number) => {
					setTargetWarehouseId(value);
					setDepartmentId(warehouseObj[value]);
					isDepartment.current = true;
					setTimeout(() => {
						form.submit();
					}, 200);
				},
				options: targetWarehouseData,
				disabled: pageId || selectList.length || reallocationList.length,
				filterOption: (input, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
				onClick: () => clickTip(),
			},
			formItemProps: {
				rules: [{ required: true, message: '请选择到货仓库' }],
			},
		},
		{
			title: `${fields.goodsCode}/名称`,
			valueType: 'selectTable',
			dataIndex: 'goodsId',
			hideInForm: isAllocation || check,
			fieldProps: {
				showArrow: false,
				disabled: !targetWarehouseId,
				selectRowKeys: selectedRowKeys,
				api: getGoodsByDepartment,
				searchKey: 'goodsNameAndmaterialCode',
				labelKey: 'name',
				valueKey: 'id',
				filterData: (res: ResponseList<NewGoodsTypesController.GoodsRecord[]>) => {
					// 入库配置项（避免自动采购）前端过滤为0的物资
					// const isFilter = global?.config?.non_automatic_purchase == 'true';
					// if (isFilter) {
					//   const data = (res.data.rows || []).filter(
					//     (item: Record<string, any>) => item.stocks && item.stocks > 0,
					//   );
					//   return data;
					// }
					if (!isAutoFocus) {
						setIsAutoFocus(true);
					}

					return res.data.rows;
				},
				onChange: (value: number, option: GoodsByDepartmentRecord) => {
					if (value && !selectedRowKeys.includes(value)) {
						selectedRowKeys.push(value);
						selectList.push(option);
						setSelectedRowKeys([...selectedRowKeys]);
						setSelectList([...selectList]);
					}
				},
				params: {
					pageNum: 0,
					pageSize: 50,
					departmentId,
					targetWarehouseId,
					// ...(form && form.getFieldsValue()),
				},
				tableProps: {
					rowKey: 'id',
					columns: getColumn(true, false),
				},
			},
		},
		{
			title: `${fields.goods}条码/UDI`,
			dataIndex: 'scanValue',
			valueType: 'scanInputWithSpace',
			hideInForm: !isAllocation,
			fieldProps: {
				onSubmit: debounce((value) => scanSubmit(value), 600),
				placeholder: '点击此处扫码',
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			hideInForm: isAllocation || !check,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			hideInForm: isAllocation || !check,
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			hideInForm: isAllocation || !check,
		},
		{
			title: '国家医保编码',
			dataIndex: 'nationalNo',
			hideInForm: isAllocation || !check,
		},
		// {
		//   title: '收费编码',
		//   dataIndex: 'chargeCode',
		//   hideInForm: isAllocation,
		// },
		// {
		//   title: '通用名称',
		//   dataIndex: 'commonName',
		//   hideInForm: isAllocation,
		// },
	];

	const selectRow = (selectedRecord: GoodsByDepartmentRecord, selected: boolean) => {
		if (selected && !selectValidation('goods')) {
			return;
		}
		const record = selectedRecord;
		const newSelectList = [...selectList],
			newSelectedRowKeys = [...selectedRowKeys];
		let rowKeyId: number = selectedRecord.id;
		if (selected) {
			record.quantity = '';
			record.minTotal = '';
			// record.goodsId = record.id;
			if (selectedRowKeys.indexOf(rowKeyId) < 0) {
				newSelectList.push(record);
				newSelectedRowKeys.push(rowKeyId);
			}
		} else {
			// 取消选中
			const index = selectedRowKeys.indexOf(rowKeyId);
			if (index >= 0) {
				newSelectedRowKeys.splice(index, 1);
				newSelectList.splice(index, 1);
			}
		}
		setSelectedRowKeys(newSelectedRowKeys);
		setSelectList(newSelectList);
	};

	//全选
	const onSelectAll = (
		selected: boolean,
		selectedRecords: GoodsByDepartmentRecord[],
		changeRows: GoodsByDepartmentRecord[],
	) => {
		if (selected && !selectValidation('goods')) {
			return;
		}
		let newSelectList = [...selectList],
			newSelectedRowKeys = [...selectedRowKeys];
		changeRows.forEach((item: GoodsByDepartmentRecord, i: number) => {
			if (selected) {
				let rowKeyId;
				rowKeyId = item.id;
				const record = item;
				record.quantity = '';
				record.minTotal = '';
				if (selectedRowKeys.indexOf(rowKeyId) < 0) {
					newSelectList.push(record);
					newSelectedRowKeys.push(rowKeyId);
				}
			} else {
				newSelectedRowKeys = newSelectedRowKeys.filter((val) => val !== item.id);
				newSelectList = newSelectList.filter((val) => val.id !== item.id);
			}
		});
		setSelectedRowKeys(newSelectedRowKeys);
		setSelectList(newSelectList);
	};

	const rowSelection = {
		selectedRowKeys,
		onSelect: selectRow,
		onSelectAll: onSelectAll,
		columnWidth: 40,
	};

	// 科室调拨
	const reallocationGoodsColumns: ProColumns<ReallocationRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 70,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 120,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 120,
			ellipsis: true,
		},
		{
			title: `${fields.goods}条码/UDI`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 180,
			ellipsis: true,
			renderText: (text, record) => judgeBarCodeOrUDI(record),
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			renderText: (text, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产商',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 160,
			ellipsis: true,
		},
		{
			title: '调拨数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
			render: (text, record) => {
				return (
					<InputNumber
						disabled={!(record.allotNum > 1)}
						min={1}
						max={record.allotNum || 1}
						style={{ width: '100px' }}
						key={record.id}
						onChange={(value) => handleChange(record, value, 'quantity')}
						value={record.quantity ? Number(record.quantity) : undefined}
					/>
				);
			},
		},
		{
			title: '调拨事由',
			dataIndex: 'remarks',
			key: 'remarks',
			width: 200,
			render: (_text, record) => {
				return (
					<FormItem
						style={{ margin: 0 }}
						name={`remarks${record.operatorBarcode}`}
						rules={[{ required: true, message: '' }]}>
						<Input
							maxLength={100}
							onChange={(e) => handleChange(record, e.target.value, 'remarks')}
						/>
					</FormItem>
				);
			},
		},
		{
			title: '操作',
			dataIndex: 'operator',
			key: 'operator',
			fixed: 'right',
			width: 80,
			render: (text, record) => {
				return (
					<span
						className='handleDanger'
						onClick={() => onConfirmDelete(record)}>
						删除
					</span>
				);
			},
		},
	];

	const handleChange = (record: ReallocationRecord, value: string | number, key: string) => {
		const submitList = reallocationList.map((item) => {
			if (item.operatorBarcode === record.operatorBarcode) {
				item[key] = value;
				return item;
			}
			return item;
		});
		setReallocationList(submitList);
	};

	// 删除
	const onConfirmDelete = (record: ReallocationRecord) => {
		const list = reallocationList.filter((item) => item.operatorBarcode !== record.operatorBarcode);
		setReallocationList(list);
	};

	return (
		<>
			{!isAllocation && (
				<>
					{check && (
						<>
							<div className={style.goodsProTable}>
								<ProTable<GoodsByDepartmentRecord>
									columns={getColumn(true)}
									tableInfoCode='department_warehousing_apply_add_goods_list'
									isTbaleBespread={true}
									rowKey='id'
									loadConfig={{
										request: false,
									}}
									searchConfig={{
										form,
										columns: searchColumn,
									}}
									scroll={{ x: '100%', y: 182 }}
									rowSelection={rowSelection}
									tableRef={tableRef}
									api={getGoodsByDepartment}
									beforeFetch={() => {
										return isDepartment.current;
									}}
									onReset={() => {
										form.setFieldsValue({ sourceWarehouseId, targetWarehouseId });
									}}
									onRow={(record) => ({
										onClick: (e) => {
											let ele: Record<string, any> = e.target;
											if (ele && ele?.nodeName.toLowerCase() === 'img') {
												return;
											}
											const index = selectedRowKeys.indexOf(record.id);
											selectRow(record, !(index >= 0));
										},
									})}
									params={{
										// isEnabled: true,
										departmentAdd: false,
										departmentId,
									}}
								/>
							</div>

							<div
								style={{ marginTop: 25 }}
								id='goodsTable'>
								<span className='cardTitle'>选择请领项</span>
								<ProTable<GoodsByDepartmentRecord>
									columns={getColumn(false)}
									isTbaleBespread={true}
									rowKey='id'
									tableInfoCode='department_warehousing_apply_add_goods_down_list'
									loadConfig={{
										loadText: '暂无数据',
										request: false,
									}}
									dataSource={selectList}
									headerTitle={fields.baseGoods}
									searchConfig={undefined}
								/>
							</div>
						</>
					)}
					{!check && (
						<div id='goodsTable'>
							<ProTable<GoodsByDepartmentRecord>
								tableInfoCode='department_warehousing_apply_add_goods_down_list'
								extraHeight={70} // 因为底部提交栏，所以需要修正高度
								span={9}
								rowKey='id'
								api={undefined}
								loadConfig={{
									loadText: '暂无数据',
									request: false,
								}}
								searchConfig={{
									form,
									submitter: false,
									columns: searchColumn,
								}}
								headerTitle={fields.baseGoods}
								dataSource={selectList}
								columns={getColumn(false)}
								toolBarRender={() => [
									<Button
										type='primary'
										onClick={() => {
											setSelectList([]);
											setSelectedRowKeys([]);
										}}
										className='iconButton'>
										全部删除
									</Button>,
								]}
							/>
						</div>
					)}
				</>
			)}
			{/* 科室调拨 */}
			{isAllocation && (
				<ProTable<ReallocationRecord>
					tableInfoCode='department_allot_goods_list'
					rowKey='id'
					headerTitle={fields.baseGoods}
					loadConfig={{
						loadText: `请扫描${fields.goods}`,
						request: false,
					}}
					searchConfig={{
						form,
						submitter: false,
						columns: searchColumn,
					}}
					dataSource={reallocationList}
					columns={reallocationGoodsColumns}
				/>
			)}
		</>
	);
};

export default Goods;
