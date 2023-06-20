import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import ProTable from '@/components/ResizableTable';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { ordinaryList } from '@/services/ordinary';
import { Form, Input, InputNumber, message } from 'antd';
import { ChangeEvent, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { PropsType } from '../data';
import style from './style.less';
type OrdinaryQuery = OrdinaryController.OrdinaryQuer;

const Ordinary: React.FC<PropsType> = ({ ...props }) => {
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const isDepartment = useRef<boolean>(false);
	const [departmentId, setDepartmentId] = useState<number>();
	const [selectList, setSelectList] = useState<OrdinaryQuery[]>([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const { comRef, selectValidation, centerWarehouseData, ordinaryListData } = props;
	const { global, targetWarehouseData, sourceWarehouseId, pageId, warehouseObj } = props;
	const [isCenterWarehouse, setIsCenterWarehouse] = useState(true);
	const [targetWarehouseId, setTargetWarehouseId] = useState(props.targetWarehouseId);

	// 暴露方法
	useImperativeHandle(comRef, () => ({
		selectList: () => selectList,
		getSearchWarehouse: () => {
			return form.getFieldsValue(['sourceWarehouseId', 'targetWarehouseId']);
		},
	}));

	useEffect(() => {
		let arr: OrdinaryQuery[] = [],
			rowKeyArr = [],
			len = ordinaryListData?.length;

		if (len && ordinaryListData) {
			for (let i = 0; i < len; i++) {
				let item = ordinaryListData[i];
				rowKeyArr.push(item.ordinaryId);
				arr.push({ ...item, quantity: item.requestNum, id: item?.ordinaryId });
			}
			setSelectList([...arr]);
			setSelectedRowKeys([...rowKeyArr]);
		}
	}, [ordinaryListData]);

	useEffect(() => {
		setTimeout(() => {
			form.setFieldsValue({ sourceWarehouseId });
		}, 200);
	}, [sourceWarehouseId]);

	useEffect(() => {
		setTimeout(() => {
			form.setFieldsValue({ targetWarehouseId });
			if (targetWarehouseId) {
				setDepartmentId(warehouseObj[targetWarehouseId]);
				isDepartment.current = true;
				tableRef.current?.submit();
			}
		}, 300);
	}, [targetWarehouseId]);

	const onChangeAddQuantity = (value: string | number, record: { id: number }) => {
		document.querySelector(`#erro${record.id}`).style.border = '';
		const newData = selectList.map((item) =>
			item.id == record.id ? { ...item, quantity: value } : { ...item },
		);
		setSelectList(newData);
	};

	const onChangeReason = (val: ChangeEvent<HTMLInputElement>, record: OrdinaryQuery) => {
		const { value } = val.target;
		setSelectList(
			selectList.map((item: { id: number }) =>
				record.id === item.id
					? {
							...item,
							requestReason: value,
					  }
					: { ...item },
			) as OrdinaryQuery[],
		);
	};

	const inputNumberElement = (record: OrdinaryQuery) => {
		const { quantity } = record;
		return (
			<div style={{ display: 'flex' }}>
				<InputNumber
					min={1}
					max={99999}
					style={{ width: '80px' }}
					key={record.id}
					defaultValue={quantity ? Number(quantity) : ''}
					onChange={(value) => onChangeAddQuantity(value, record)}
					id={'erro' + record.id}
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

	// 删除行操作
	const selectDelete = (id: number | string) => {
		const newSelectList = [...selectList];
		const newSelectedRowKeys = [...selectedRowKeys];
		newSelectList.forEach((item, index) => {
			if (item.id == id) {
				newSelectList.splice(index, 1);
			}
		});
		let index = newSelectedRowKeys.indexOf(id as number);
		if (index > -1) {
			newSelectedRowKeys.splice(index, 1);
		}
		setSelectList(newSelectList);
		setSelectedRowKeys(newSelectedRowKeys);
	};

	//点击供货仓库和到货仓库
	const clickTip = () => {
		if (selectList.length) {
			message.warn('当前选择供货&到货仓库已有医耗套包勾选，请取消勾选后尝试更换仓库！');
			return;
		}
	};
	const searchColumn: ProFormColumns = [
		{
			title: '供货仓库',
			dataIndex: 'sourceWarehouseId',
			valueType: 'select',
			fieldProps: {
				showSearch: true,
				allowClear: false,
				options: centerWarehouseData,
				onChange: (value: number) => {
					setIsCenterWarehouse(value == sourceWarehouseId);
				},
				disabled: pageId || selectList.length,
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
				disabled: pageId || selectList.length,
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
			title: '套包编号/名称',
			dataIndex: 'keyword',
			hideInForm: !isCenterWarehouse,
		},
	];
	const renderStocks = (value: number | string) => {
		let stocks = Number(value || 0);
		return stocks && stocks > 0 ? (
			stocks
		) : (
			<span style={{ color: CONFIG_LESS['@c_starus_warning'] }}>0</span>
		);
	};
	const getColumn = (type: boolean) => {
		const columns: ProColumns<OrdinaryQuery>[] = [
			{
				title: '序号',
				dataIndex: 'index',
				key: 'index',
				align: 'center',
				render: (text, record, index) => <span>{index + 1}</span>,
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
				render: (text, record) => record.description || text,
			},
			{
				title: '可用库存',
				dataIndex: 'stocks',
				width: 100,
				ellipsis: true,
				render: (text, record) => renderStocks(record.stocks),
			},
			{
				title: '请领数量',
				dataIndex: 'quantity',
				width: 100,
				hideInTable: type,
				render: (text, record) => {
					return inputNumberElement(record);
				},
			},
			{
				title: '备注',
				hideInTable: type,
				dataIndex: 'requestReason',
				width: 100,
				render: (_text, record) => {
					return (
						<>
							<Input
								defaultValue={record.requestReason || ''}
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
				hideInTable: type,
				render: (_, record) => {
					return (
						<span
							className='handleLink'
							onClick={() => {
								selectDelete(record?.id);
							}}>
							删除
						</span>
					);
				},
			},
		];
		return columns;
	};
	// 选择行
	const selectRow = (selectedRecord: OrdinaryQuery, selected: boolean) => {
		if (selected && !selectValidation('ordinary')) {
			return;
		}
		const record = selectedRecord;
		const newSelectList = [...selectList];
		const newSelectedRowKeys = [...selectedRowKeys];
		let rowKeyId: number = selectedRecord?.id;
		if (selected) {
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

		setSelectList(newSelectList);
		setSelectedRowKeys(newSelectedRowKeys);
	};

	// 点击全选复选框
	const onSelectAll = (
		selected: boolean,
		selectedRecords: OrdinaryQuery[],
		changeRows: OrdinaryQuery[],
	) => {
		if (selected && !selectValidation('ordinary')) {
			return;
		}
		let newSelectList = [...selectList],
			newSelectedRowKeys = [...selectedRowKeys];
		changeRows.forEach((item: OrdinaryQuery, i: number) => {
			if (selected) {
				const record = item;
				let rowKeyId: number = item.id;
				record.quantity = '';
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
	return (
		<div>
			<div className={style.ordinaryProTable}>
				<ProTable<OrdinaryQuery>
					rowKey='id'
					tableInfoCode='department_warehousing_apply_add_ordinary_list'
					isTbaleBespread={true}
					columns={getColumn(true)}
					api={ordinaryList}
					loadConfig={{
						request: false,
					}}
					tableRef={tableRef}
					searchConfig={{
						form,
						columns: searchColumn,
					}}
					scroll={{ x: '100%', y: 182 }}
					rowSelection={rowSelection}
					beforeFetch={() => {
						return isDepartment.current;
					}}
					params={{
						// isEnabled: true,
						nonAutoPurchase: global?.config?.non_automatic_purchase == 'true', // 过滤库存为0物资，避免自动采购
						departmentAdd: false,
						departmentId,
						sourceWarehouseId: undefined,
						targetWarehouseId: undefined,
					}}
					onReset={() => {
						form.setFieldsValue({ sourceWarehouseId, targetWarehouseId });
					}}
				/>
			</div>
			<div
				style={{ marginTop: 25 }}
				id='ordinaryTable'>
				<span className='cardTitle'>选择请领项</span>
				<ProTable<OrdinaryQuery>
					tableInfoCode='department_warehousing_apply_add_ordinary_down_list'
					isTbaleBespread={true}
					columns={getColumn(false)}
					rowKey='goodsId'
					api={undefined}
					loadConfig={{
						loadText: '暂无数据',
						request: false,
					}}
					dataSource={selectList}
					headerTitle='医耗套包'
					searchConfig={undefined}
				/>
			</div>
		</div>
	);
};

export default Ordinary;
