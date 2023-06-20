import ProTable from '@/components/ResizableTable';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { useGetAreaList } from '@/hooks/allocation';
import { useGoodsType } from '@/hooks/useGoodsType';
import { getApplyGoodsList } from '@/services/storageReallocation';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { AlertRenderType } from '@ant-design/pro-table/lib/components/Alert';
import { Card, Form, Input, InputNumber, message, Modal } from 'antd';
import React, { ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useModel } from 'umi';
import { propsType } from '../data';
import styles from './ordinary.less';
const FormItem = Form.Item;
type GetApplyGoodsListRecord = StorageReallocateController.GetApplyGoodsListRecord;

const Goods: React.FC<propsType> = ({ ...props }) => {
	const { handleprops, style, comRef } = props;
	const { fields } = useModel('fieldsMapping');
	const { type, setType, selectType, setSelectType } = handleprops;
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const [selectList, setSelectList] = useState<GetApplyGoodsListRecord[]>([]);
	const tagsData = useGoodsType({ goodsValue: '1', ordinaryValue: '2' }); //类型
	const {
		getOptions,
		value: sourceValue,
		setValue: setSourceValue,
		options,
	} = useGetAreaList('source');
	const {
		getOptions: getTargetOptions,
		value: targetValue,
		setValue: setTargetValue,
		options: targetOptions,
		setOptions: setTargetOptions,
	} = useGetAreaList('target');

	useEffect(() => {
		getOptions();
	}, [getOptions]);

	const columns: ProColumns<GetApplyGoodsListRecord>[] = [
		{
			title: fields.goodsName,
			dataIndex: 'name',
			width: 150,
			ellipsis: true,
		},
		{
			title: '通用名称',
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
			renderText: (_text: string, record) => formatStrConnect(record, ['specification', 'model']),
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
			dataIndex: 'procurementPrice',
			key: 'procurementPrice',
			width: 150,
			align: 'right',
			renderText: (procurementPrice: number) => convertPriceWithDecimal(procurementPrice),
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'code',
			width: 150,
		},
		{
			title: '可用库存',
			dataIndex: 'remainStock',
			width: 100,
			ellipsis: true,
		},
	];

	//删除操作
	const selectDelete = (id: number) => {
		const newSelectList = [...selectList],
			newSelectedRowKeys = [...selectedRowKeys];
		newSelectList.forEach((item, index) => {
			if (item.id == id) {
				newSelectList.splice(index, 1);
			}
		});
		newSelectedRowKeys.splice(newSelectedRowKeys.indexOf(id), 1);
		setSelectedRowKeys(newSelectedRowKeys);
		setSelectList(newSelectList);
	};
	// 编辑数量操作
	const onChangeAddQuantity = (value: number | '', record: GetApplyGoodsListRecord) => {
		const newdata = selectList.map((item: GetApplyGoodsListRecord) =>
			item.id == record.id ? { ...item, quantity: value } : { ...item },
		);
		setSelectList(newdata);
	};
	//申请事由
	const onChangeReason = (
		val: React.ChangeEvent<HTMLInputElement>,
		record: Record<string, any>,
	) => {
		const { value } = val.target;
		setSelectList(
			selectList.map((item) =>
				record.id === item.id
					? {
							...item,
							reason: value,
					  }
					: { ...item },
			),
		);
	};
	const inputNumberElement = (record: any, text: any) => {
		return (
			<FormItem
				className='mg0'
				rules={[{ required: true }]}
				name={record.id}>
				<div style={{ display: 'flex' }}>
					<InputNumber
						min={1}
						max={99999}
						style={{ width: '80px' }}
						key={record.id}
						// disabled={record.isDanger}
						defaultValue={text ? Number(text) : ''}
						onChange={(value) => {
							onChangeAddQuantity(value, record);
						}}
					/>

					<div
						style={{
							display: 'flex',
							flexDirection: 'column-reverse',
							justifyContent: 'center',
							marginLeft: '4px',
						}}>
						{record.minGoodsUnit}
					</div>
				</div>
			</FormItem>
		);
	};

	const columnsGoods: ProColumns<GetApplyGoodsListRecord>[] = [
		{
			title: fields.goodsName,
			dataIndex: 'name',
			width: 150,
			ellipsis: true,
		},
		{
			title: '通用名称',
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
			renderText: (_text: string, record) => formatStrConnect(record, ['specification', 'model']),
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
			dataIndex: 'procurementPrice',
			key: 'procurementPrice',
			width: 150,
			align: 'right',
			renderText: (procurementPrice: number) => convertPriceWithDecimal(procurementPrice),
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '可用库存',
			dataIndex: 'remainStock',
			width: 100,
			ellipsis: true,
		},
		{
			title: '申请数量',
			dataIndex: 'quantity',
			width: 100,
			renderText: (text: number, record) => inputNumberElement(record, text),
		},
		{
			title: '申请事由',
			dataIndex: 'reason',
			width: 100,
			render: (_text: ReactNode, record) => {
				return (
					<>
						<Input
							defaultValue={record.reason ? record.reason : ''}
							onChange={(val) => onChangeReason(val, record)}
							placeholder='请输入'
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
			render: (_: any, record) => {
				return (
					<div
						className='operation'
						onClick={() => {
							selectDelete(record.id);
						}}>
						<span className='handleLink'>删除</span>
					</div>
				);
			},
		},
	];
	useEffect(() => {
		form.setFieldsValue({ type: [type] });
	}, [type]);
	const searchColumns: ProFormColumns = [
		{
			title: '类型',
			dataIndex: 'type',
			valueType: 'tagSelect',
			fieldProps: {
				defaultValue: ['1'],
				multiple: false,
				options: tagsData,
				onChange: (value: '1' | '2' | undefined) => {
					if (value) {
						setType(value);
					}
				},
			},
		},
		{
			title: '供货库房',
			dataIndex: 'sourceStorageAreaId',
			valueType: 'apiSelect',
			formItemProps: {
				rules: [{ required: true, message: '请选择供货库房' }],
			},
			fieldProps: {
				placeholder: '请选择供货库房',
				options,
				disabled: selectedRowKeys.length > 0,
				onClick: () => {
					if (selectedRowKeys.length > 0) {
						message.warn(
							`当前选择供货&到货库房已有${fields.goods}勾选，请取消勾选后尝试更换库房！`,
						);
						return;
					}
				},
				onChange: (value: number) => {
					setSourceValue(value);
					if (value) {
						if (!sourceValue || (sourceValue && sourceValue !== value)) {
							getTargetOptions(value);
						}
					}
					form.resetFields(['targetStorageAreaId']);
					setTargetValue(undefined);
					setTargetOptions([]);
					tableRef.current?.setDataSource([]);
				},
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: '到货库房',
			dataIndex: 'targetStorageAreaId',
			valueType: 'select',
			formItemProps: {
				rules: [{ required: true, message: '请选择到货库房' }],
			},
			fieldProps: {
				placeholder: '请选择到货库房',
				options: targetOptions,
				disabled: !sourceValue || selectedRowKeys.length > 0,
				onClick: () => {
					if (!sourceValue) {
						message.warn('请先选择供货库房！');
						return;
					}
					if (selectedRowKeys.length > 0) {
						message.warn(
							`当前选择供货&到货库房已有${fields.goods}勾选，请取消勾选后尝试更换库房！`,
						);
						return;
					}
				},
				onChange: (value: number) => {
					setTargetValue(value);
					form.submit();
				},
				showSearch: true,
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			fieldProps: {
				placeholder: `请输入${fields.goodsCode}`,
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			fieldProps: {
				placeholder: `请输入${fields.goodsName}`,
			},
		},
		{
			title: '本地医保编码',
			dataIndex: 'chargeNum',
			fieldProps: {
				placeholder: '请输入本地医保编码',
			},
		},
		{
			title: '收费编码',
			dataIndex: 'chargeCode',
			fieldProps: {
				placeholder: '请输入收费编码',
			},
		},
		{
			title: '通用名称',
			dataIndex: 'commonName',
			fieldProps: {
				placeholder: '请输入通用名称',
			},
		},
	];

	//是否有选中来设置目前选中的类型
	useEffect(() => {
		if (selectedRowKeys.length > 0) {
			setSelectType('1');
		} else {
			setSelectType(undefined);
		}
	}, [selectedRowKeys]);
	// 选择行
	const selectRow = (selectedRecord: GetApplyGoodsListRecord, selected: boolean) => {
		onselectChange(selectedRecord, selected);
	};

	// 点击行
	const selectRowOfClick = (selectedRecord: GetApplyGoodsListRecord) => {
		const index = selectedRowKeys.indexOf(selectedRecord.id);
		onselectChange(selectedRecord, !(index >= 0));
	};

	// 当前为基础物资时点对击行的数据处理
	const onselectChange = (selectedRecord: GetApplyGoodsListRecord, selected: boolean) => {
		if (selectType === '2') {
			Modal.warning({
				title: '提示',
				content: '不允许跨耗材包装种类发起申请，请确认后重试！',
			});
			return;
		}
		const record = selectedRecord;
		const newSelectList = [...selectList],
			newSelectedRowKeys = [...selectedRowKeys];
		let rowKeyId;
		rowKeyId = selectedRecord.id;
		if (selected) {
			record.goodsType = type; //保存物品类型
			record.goodsId = record.id;
			record.quantity = '';
			record.minTotal = '';
			// record.minTotal = record.conversionRate;
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

	// 点击全选复选框
	const onSelectAll = (
		selected: boolean,
		_selectedRecord: GetApplyGoodsListRecord[],
		changeRows: GetApplyGoodsListRecord[],
	) => {
		if (selectType === '2') {
			Modal.warning({
				title: '提示',
				content: '不允许跨耗材包装种类发起申请，请确认后重试！',
			});
			return;
		}
		let newSelectList = [...selectList],
			newSelectedRowKeys = [...selectedRowKeys];
		changeRows.forEach((item, i) => {
			if (selected) {
				let rowKeyId;
				rowKeyId = item.id;
				const record = item;
				record.Type = type; //保存物品类型
				record.Id = record.id;
				record.quantity = '';
				record.minTotal = record.conversionRate;
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
	//取消选择
	const cancelSelect = () => {
		setSelectList([]);
		setSelectedRowKeys([]);
	};

	// 暴露方法
	useImperativeHandle(comRef, () => ({
		selectList: () => {
			return selectList;
		},
		getSearchStorageArea: () => {
			return form.getFieldsValue(['sourceStorageAreaId', 'targetStorageAreaId']);
		},
	}));

	return (
		<>
			<Card style={{ ...style }}>
				<div className={styles.ordinaryProTable}>
					<ProTable<GetApplyGoodsListRecord>
						hasRequired
						rowKey='id'
						isTbaleBespread={true}
						api={getApplyGoodsList}
						tableInfoCode='allocation_handle_add_goods_list'
						searchConfig={{
							columns: searchColumns,
							form,
						}}
						loadConfig={{ request: false }}
						columns={columns}
						beforeSearch={(value) => {
							return { ...value, type: 1 };
						}}
						beforeOnReset={(f) => {
							f?.setFieldsValue({
								sourceStorageAreaId: sourceValue ? sourceValue : undefined,
								targetStorageAreaId: targetValue ? targetValue : undefined,
							});
						}}
						scroll={{ x: '100%', y: 182 }}
						rowSelection={{
							selectedRowKeys: selectedRowKeys,
							onSelect: selectRow,
							onSelectAll: onSelectAll,
							columnWidth: 40,
						}}
						onRow={(record) => ({
							onClick: () => {
								selectRowOfClick(record);
							},
						})}
						tableAlertOptionRender={
							(
								<a
									onClick={() => {
										cancelSelect();
									}}>
									取消选择
								</a>
							) as unknown as AlertRenderType<Record<string, any>> | undefined
						}
						tableRef={tableRef}
					/>
				</div>
			</Card>
			<Card
				bordered={false}
				className='mt2'
				style={style}>
				<span className='cardTitle'>输入调拨数量</span>
				<div id='goodsTable'>
					<ProTable<GetApplyGoodsListRecord>
						tableInfoCode='allocation_handle_add_goods_down_list'
						headerTitle={fields.baseGoods}
						isTbaleBespread={true}
						rowKey='id'
						pagination={false}
						loadConfig={{ request: true }}
						scroll={{ y: 300 }}
						columns={columnsGoods}
						dataSource={selectList}
					/>
				</div>
			</Card>
		</>
	);
};

export default Goods;
