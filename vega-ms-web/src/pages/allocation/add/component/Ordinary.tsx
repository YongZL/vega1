import ProTable from '@/components/ResizableTable';
import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import { useGetAreaList } from '@/hooks/allocation';
import { useGoodsType } from '@/hooks/useGoodsType';
import { getApplyGoodsList } from '@/services/storageReallocation';
import { AlertRenderType } from '@ant-design/pro-table/lib/components/Alert';
import { Card, Form, Input, InputNumber, message, Modal } from 'antd';
import React, { ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useModel } from 'umi';
import { propsType } from '../data';
import GoodsInfoOrdinary from './GoodsInfo';
import styles from './ordinary.less';
const FormItem = Form.Item;
type GetApplyGoodsListRecord = StorageReallocateController.GetApplyGoodsListRecord;

const Ordinary: React.FC<propsType> = ({ ...props }) => {
	const { fields } = useModel('fieldsMapping');
	const { handleprops, style, comRef } = props;
	const { type, setType, selectType, setSelectType } = handleprops;
	const [form] = Form.useForm();
	const tableRef = useRef<ProTableAction>();
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
	const [selectList, setSelectList] = useState<GetApplyGoodsListRecord[]>([]);
	const [goodsId, setGoodsId] = useState<number>();
	const [ordinaryVisible, setOrdinaryVisible] = useState(false);
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

	// 医耗套包资详情
	const ordinaryDetail = (e: any, id: number) => {
		e.stopPropagation();
		setGoodsId(id);
		setOrdinaryVisible(true);
	};

	const columns: ProColumns<GetApplyGoodsListRecord>[] = [
		{
			title: '医耗套包编号',
			dataIndex: 'code',
			width: 150,
			ellipsis: true,
		},
		{
			title: '医耗套包名称',
			dataIndex: 'name',
			width: 150,
			ellipsis: true,
			render: (text: ReactNode, record) => (
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
			dataIndex: 'ordinaryDescription',
			width: 150,
			ellipsis: true,
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
		let newdata = [];
		newdata = selectList.map((item: GetApplyGoodsListRecord) =>
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
						{record.conversionUnitName}
					</div>
				</div>
			</FormItem>
		);
	};
	const columnsordinary: ProColumns<GetApplyGoodsListRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			renderText: (_text: string, _record, index: number) => index + 1,
			width: 80,
		},
		{
			title: '医耗套包编号',
			dataIndex: 'code',
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
			dataIndex: 'ordinaryDescription',
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
			renderText: (text: string, record) => inputNumberElement(record, text),
		},
		{
			title: '申请事由',
			dataIndex: 'reason',
			width: 100,
			render: (text: ReactNode, record) => {
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
						<span className={`${styles.release_del} ${'handleLink'}`}>删除</span>
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
				defaultValue: ['2'],
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
			title: '套包编号/名称',
			dataIndex: 'keyword',
			formItemProps: {},
			fieldProps: {
				placeholder: '请输入套包编号/名称',
			},
		},
	];
	//是否有选中来设置目前选中的类型
	useEffect(() => {
		if (selectedRowKeys.length > 0) {
			setSelectType('2');
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
		if (selectType === '1') {
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
		_selectedRecords: GetApplyGoodsListRecord[],
		changeRows: GetApplyGoodsListRecord[],
	) => {
		if (selectType === '1') {
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
			<Card style={style}>
				<div className={styles.ordinaryProTable}>
					<ProTable
						tableInfoCode='allocation_handle_add_ordinary_list'
						hasRequired
						rowKey='id'
						isTbaleBespread={true}
						api={getApplyGoodsList}
						searchConfig={{
							columns: searchColumns,
							form,
							defaultColsNumber: 5,
						}}
						loadConfig={{ request: false }}
						columns={columns}
						beforeSearch={(value) => {
							return { ...value, type: 2 };
						}}
						scroll={{ x: '100%', y: 182 }}
						beforeOnReset={(f) => {
							f?.setFieldsValue({
								sourceStorageAreaId: sourceValue ? sourceValue : undefined,
								targetStorageAreaId: targetValue ? targetValue : undefined,
							});
						}}
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
				className='mt2 mb6'
				style={style}>
				<span className='cardTitle'>输入调拨数量</span>
				<div id='ordinaryTable'>
					<ProTable<GetApplyGoodsListRecord>
						tableInfoCode='allocation_handle_add_ordinary_down_list'
						isTbaleBespread={true}
						headerTitle='医耗套包'
						rowKey='id'
						pagination={false}
						scroll={{ y: 300 }}
						columns={columnsordinary}
						dataSource={selectList}
					/>
				</div>
			</Card>
			<GoodsInfoOrdinary
				visible={ordinaryVisible}
				setVisible={setOrdinaryVisible}
				id={goodsId}
			/>
		</>
	);
};

export default Ordinary;
