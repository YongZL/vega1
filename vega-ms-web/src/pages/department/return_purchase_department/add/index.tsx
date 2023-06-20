import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import InputUnit from '@/components/InputUnit';
import { ProColumns, ProTableAction } from '@/components/ProTable';
import ProTable from '@/components/ResizableTable';
import { ProFormColumns } from '@/components/SchemaForm';
import { returnableStatus, returnableStatusValueEnum, returnType } from '@/constants/dictionary';
import { searchFormItem4 } from '@/constants/formLayout';
import { useWarehouseList } from '@/hooks/useWarehouseList';
import type { ConnectState } from '@/models/connect';
import type { GlobalModelState } from '@/models/global';
import {
	findBulkGoods,
	getReturnable,
	submitDepartmentCode,
	submitDepartmentData,
} from '@/services/returnGoods';
import { judgeBarCodeOrUDI, scrollTable, transformSBCtoDBC } from '@/utils';
import { beforeUpload } from '@/utils/file';
import { formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { getUrl } from '@/utils/utils';
import { UploadOutlined } from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-form';
import { Button, Card, Form, Select, Upload } from 'antd';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import React, { FC, useEffect, useRef, useState } from 'react';
import { connect, history, useModel } from 'umi';
import AddMoreModal from './addMore';

const FormItem = Form.Item;

const AddList: FC<{ global: GlobalModelState }> = ({ global }) => {
	const warehouseList = (useWarehouseList({ excludeCentralWarehouse: true }) || []).map((item) => {
		const { name, id, nameAcronym } = item;
		return { value: id, label: name, key: (nameAcronym || '') + '' + name };
	});
	const [imgLoading, setImgLoading] = useState<boolean>(false);
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [scanValue, setScanValue] = useState<string>('');
	const [selectedList, setSelectedList] = useState<ReturnGoodsController.ListDepartmentRecord[]>(
		[],
	);
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const [selectedWh, setSelectedWh] = useState<number>();
	const [moreVisible, setMoreVisible] = useState<boolean>(false);
	const [moreAllList, setMoreAllList] = useState<ReturnGoodsController.ListDepartmentRecord[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const tableRef = useRef<ProTableAction>();
	const formRef = useRef<ProFormInstance>();
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');

	// 重置
	const resetSerach = () => {
		formRef.current?.resetFields();
		formRef.current?.setFieldsValue({
			warehouseId: warehouseList[0].value,
		});
		setSelectedWh(warehouseList[0].value);
		tableRef.current?.reload();
	};

	useEffect(() => {
		if (warehouseList.length) {
			formRef.current?.setFieldsValue({
				warehouseId: warehouseList[0].value,
			});
			setSelectedWh(warehouseList[0].value);
		}
		document.getElementsByClassName('ant-pro-form-collapse-button')[1]?.remove();
	}, [warehouseList.length]);

	// 获取图片列表
	const getImgList = (list: any) => {
		let returnList: string[] = [];
		list.map((item: { response: string }) => {
			returnList.push(item.response);
		});
		return returnList;
	};

	// 提交
	const listSubmit = () => {
		for (let index = 0; index < selectedList.length; index++) {
			if (!selectedList[index].returnReason) {
				scrollTable(Number(index) + 1, 'returnPurchaseDepartmentTable');
				break;
			}
		}

		formRef.current?.validateFields().then(async (value) => {
			if (imgLoading) {
				notification.warning('图片上传中，请稍后');
				return;
			}
			if (selectedList.length <= 0) {
				notification.warning(`请选择${fields.goods}`);
				return;
			}

			setSubmitLoading(true);
			let goodsList: ReturnGoodsController.GoodsList[] = [];
			let ordinaryList: ReturnGoodsController.OrdinaryList[] = []; //医耗套包
			selectedList.forEach((item) => {
				if (!item.recordId && item.packageBulkItemId) {
					ordinaryList.push({
						attachments: getImgList(item.fileList || []),
						ordinaryItemId: item.packageBulkItemId,
						returnReason: item.returnReason,
					});
				} else {
					goodsList.push({
						attachments: getImgList(item.fileList || []),
						goodsItemId: item.goodsItemId,
						packageBulkItemGoodsId: item.packageBulkItemGoodsId,
						packageBulkItemId: item.packageBulkItemId,
						quantity: item.num || item.quantity,
						recordId: item.recordId,
						returnReason: item.returnReason,
					});
				}
			});
			const params: ReturnGoodsController.CenterSubmitParams = {
				goodsList,
				ordinaryList,
				warehouseId: selectedWh,
				contactPhone: value.contactPhone,
			};

			const res = await submitDepartmentData(params);
			if (res && res.code === 0) {
				notification.success('操作成功');
				history.push({ pathname: '/department/return_processing', state: { key: '2' } });
			}
			setSubmitLoading(false);
		});
	};

	// upload img
	const handleImageChange = (
		info: UploadChangeParam<UploadFile<any>>,
		index: number,
		record: ReturnGoodsController.ListDepartmentRecord,
	) => {
		setImgLoading(true);
		let file = info.file;
		let status = file.status;
		let submitList = cloneDeep(selectedList);
		let currList = info.fileList;
		if (currList.length > 9) {
			notification.error('最多上传9张');
			currList = currList.slice(0, 9);
		}
		if (file.status === 'done') {
			setImgLoading(false);
		}
		let changedItem = submitList[index];
		if (status === 'uploading' || status === 'removed') {
			// if (status === 'removed' && changedItem[prop]) {
			//   changedItem[prop].splice(index, 1);
			// }
			changedItem.fileList = currList;
			setSelectedList(submitList);
		}
		if (status === 'done' && file.response) {
			if (typeof file.response === 'object') {
				if (file.response.code === 0) {
					// changedItem[prop] = !changedItem[prop] ? [] : changedItem[prop];
					// changedItem[prop].push(file.response);
					changedItem.fileList = currList;
					setSelectedList(submitList);
				} else {
					notification.error(file.response.msg);
				}
			} else {
				// changedItem[prop] = !changedItem[prop] ? [] : changedItem[prop];
				// changedItem[prop].push(file.response);
				changedItem.fileList = currList;
				setSelectedList(submitList);
			}
		}
		setImgLoading(false);
	};

	const handleChange = (record: any, value: any, key: string) => {
		const submitList = selectedList.map((item) => {
			if (
				(record.key && item.key === record.key) ||
				(record.packageBulkItemId && item.packageBulkItemId === record.packageBulkItemId) ||
				(record.packageSurgicalItemId &&
					item.packageSurgicalItemId === record.packageSurgicalItemId)
			) {
				item[key] = value;
				return item;
			}
			return item;
		});
		setSelectedList(submitList);
	};

	// 扫码搜索
	const scanSubmit = async (value: string) => {
		let selectedRowKeys = cloneDeep(selectedKeys);
		let submitList = cloneDeep(selectedList);
		const warehouseId = tableRef.current?.getParams().warehouseId;

		if (!warehouseId) {
			notification.error('请选择仓库！');
			return;
		}
		if (!value) {
			notification.error(`请输入/扫描${fields.goods}条码！`);
			return;
		}
		const transValue = transformSBCtoDBC(value);
		// const gs1Code = transValue.indexOf('_') > -1 ? transValue : transValue;
		const goodsItemIds = selectedList.map((item) => item.goodsItemId).join(',');
		const params = {
			code: transValue,
			warehouseId,
			goodsItemIds,
		};
		const res = await submitDepartmentCode(params);
		if (res && res.code === 0) {
			const list = res.data;
			if (list?.length > 1) {
				// Modal
				setMoreVisible(true);
				setMoreAllList(res.data);
				return;
			}
			if (
				submitList.some((item) => {
					let existItemKeys = []; // 已扫码在待退货列表物资
					let listItemKeys: string[] = []; // 接口查询码返回的物资
					if (item.key) existItemKeys.push(item.key); // 基础物资有key属性，没有keys属性
					if (item.keys) existItemKeys = existItemKeys.concat(item.keys); // 定数包和手术套包有key属性，没有keys属性
					if (list[0].key) listItemKeys.push(list[0].key); // 基础物资有key属性，没有keys属性
					if (list[0].keys) listItemKeys = listItemKeys.concat(list[0].keys); // 定数包和手术套包有key属性，没有keys属性
					const intersection = existItemKeys.filter((value) => listItemKeys.includes(value)); // 计算两个数组是否有交集，有交集说明有重复物资
					return intersection.length > 0;
				})
			) {
				notification.error(`列表里已有该${fields.goods}！`);
				return;
			}
			submitList.push(list[0]);
			if (list[0].key) selectedRowKeys.push(list[0].key);
			setSelectedKeys(selectedRowKeys);
			setSelectedList(submitList);
			// 成功则清空
			setScanValue('');
		}
	};

	// 扫码
	const scanChange = (value: string) => {
		setScanValue(value);
	};
	// 删除
	const removeItem = (record: any) => {
		let submitList = cloneDeep(selectedList);
		let selectedRowKeys = cloneDeep(selectedKeys);
		if (record.keys) {
			record.keys.forEach((item: any) => {
				selectedRowKeys = selectedRowKeys.filter((child) => child !== item);
			});
			submitList = record.packageBulkItemId
				? submitList.filter((item) => item.packageBulkItemId !== record.packageBulkItemId)
				: submitList.filter((item) => item.packageSurgicalItemId !== record.packageSurgicalItemId);
		} else {
			selectedRowKeys = selectedRowKeys.filter((item) => item !== record.key);
			submitList = submitList.filter((item) => item.key !== record.key);
		}
		formRef.current?.resetFields([
			`returnReason${record.key || record.packageBulkItemId || record.packageSurgicalItemId}`,
		]);
		setSelectedList(submitList);
		setSelectedKeys(selectedRowKeys);
	};

	// 选择
	const selectRow = async (record: any, status: boolean) => {
		let selectedRowKeys = cloneDeep(selectedKeys);
		let submitList = cloneDeep(selectedList);

		if (record.ordinaryItemId) {
			// 定数包
			const params = {
				packageBulkItemId: record.ordinaryItemId,
				warehouseId: record.warehouseId,
			};

			setLoading(true);
			const res = await findBulkGoods(params);
			setLoading(false);
			if (res && res.code === 0) {
				if (!res?.data.length) {
					return;
				}
				if (status) {
					if (record.recordId) {
						// 已消耗--取key
						if (res.data.length > 1) {
							// Modal
							setMoreAllList(res.data);
							setMoreVisible(true);
						} else {
							selectedRowKeys.push(res?.data[0].key as string);
							submitList.push(res.data[0]);
						}
					} else {
						// 未消耗--取keys
						selectedRowKeys = Array.from(
							new Set(selectedRowKeys.concat(res?.data[0].keys as string)),
						);
						submitList.push(res.data[0]);
					}
				} else {
					if (!record.recordId) {
						// 未消耗需整个包的基础物资一起取消
						if (res.data.length > 1) {
							res.data
								.map((item) => item.keys)
								.flat()
								.map((item) => {
									selectedRowKeys = selectedRowKeys.filter((child) => child !== item);
								});
						}
						let keys: any = res.data[0].keys;
						keys.map((item: any) => {
							selectedRowKeys = selectedRowKeys.filter((child) => child !== item);
						});
						submitList = submitList.filter(
							(item) => item.packageBulkItemId != record.packageBulkItemId,
						);
					} else {
						selectedRowKeys = selectedRowKeys.filter((item) => item !== record.key);
						submitList = submitList.filter((item) => item.key !== record.key);
					}
				}
			}
		} else {
			// 基础物资
			if (status) {
				selectedRowKeys.push(record.key);
				submitList.push(record);
			} else {
				selectedRowKeys = selectedRowKeys.filter((item) => item !== record.key);
				submitList = submitList.filter((item) => item.key !== record.key);
			}
		}

		setSelectedKeys(selectedRowKeys);
		setSelectedList(submitList);
	};

	// 单行点击选中
	const selectRowOfClick = (record: any) => {
		if (selectedKeys.some((item) => item === record.key)) {
			selectRow(record, false);
		} else {
			selectRow(record, true);
		}
	};

	const getImgProps = (record: any) => {
		const imgProps = {
			name: 'file',
			fileList: record.fileList ? record.fileList : [],
			action: `${getUrl()}/api/admin/upload/1.0/upload_image`,
			beforeUpload: beforeUpload,
			accept: 'image/*',
			multiple: true,
			withCredentials: true,
			showUploadList: {
				showPreviewIcon: true,
				showRemoveIcon: true,
				showDownloadIcon: false,
			},
		};
		return imgProps;
	};

	const columns: ProColumns<ReturnGoodsController.ListDepartmentRecord>[] = [
		{
			title: '状态',
			dataIndex: 'status',
			key: 'status',
			width: 100,
			filters: false,
			valueEnum: returnableStatusValueEnum,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 100,
		},
		{
			title: `${fields.goods}条码/UDI`,
			dataIndex: 'goodsOperatorBarcode',
			key: 'goodsOperatorBarcode',
			width: 180,
			ellipsis: true,
			renderText: (text, record) => judgeBarCodeOrUDI(record, true),
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
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
			title: '批号/序列号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 150,
			ellipsis: true,
			renderText: (text: string, record) => (
				<span>{`${text || '-'}/${record.serialNum || '-'}`}</span>
			),
		},
		{
			title: '退货数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			renderText: (text, record) => text + record.minUnitName,
		},
		{
			title: '退货科室',
			dataIndex: 'departmentName',
			key: 'departmentName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '退货仓库',
			dataIndex: 'warehouseName',
			key: 'warehouseName',
			width: 150,
			ellipsis: true,
		},
		{
			title: fields.distributor,
			dataIndex: 'distributorName',
			key: 'distributorName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '所属包',
			dataIndex: 'ordinaryName',
			key: 'ordinaryName',
			width: 150,
			ellipsis: true,
			renderText: (text: string, record) => text || '-',
		},
		{
			title: '消耗时间',
			dataIndex: 'consumedTime',
			key: 'consumedTime',
			width: 180,
			sorter: true,
			render: (text) => {
				return (
					<span>
						{text && text !== '-' ? moment(Number(text)).format('YYYY/MM/DD HH:mm:ss') : ''}
					</span>
				);
			},
		},
	];

	const submitColumns: ProColumns<ReturnGoodsController.ListDepartmentRecord>[] = [
		{
			title: `${fields.goods}条码/UDI`,
			dataIndex: 'goodsOperatorBarcode',
			key: 'goodsOperatorBarcode',
			width: 150,
			ellipsis: true,
			renderText: (text, record) => {
				const codeText = record.recordId
					? text
					: record.surgicalOperatorBarcode || record.packageOperatorBarcode || text;
				const { barcodeControlled, printed, udiCode } = record;
				if (barcodeControlled) {
					return printed ? codeText : udiCode;
				} else {
					return '-';
				}
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
			ellipsis: true,
			render: (text, record) =>
				record.recordId ? text : record.surgicalName || record.packageName || text,
		},
		{
			title: '通用名称',
			dataIndex: 'commonName',
			key: 'commonName',
			width: 100,
			ellipsis: true,
		},
		{
			title: () => {
				return (
					<React.Fragment>
						<span className='cl_FF110B'>*</span>退货数量
					</React.Fragment>
				);
			},
			dataIndex: 'quantity',
			key: 'quantity',
			width: 150,
			render: (text, record) => {
				return (
					<InputUnit
						onChange={(value: number | string) => handleChange(record, value, 'num')}
						disabled={Number(text) <= 1 || !global.configuration}
						unit={record.minUnitName}
						value={Number('num' in record ? record.num : text)}
						min={1}
						max={Number(text)}
						style={{ width: '100px' }}
					/>
				);
			},
		},
		{
			title: () => {
				return (
					<React.Fragment>
						<span className='cl_FF110B'>*</span>退货事由
					</React.Fragment>
				);
			},
			dataIndex: 'returnReason',
			key: 'returnReason',
			width: 150,
			render: (text, record) => {
				return (
					<FormItem
						preserve={false}
						className='mg0'
						name={`returnReason${
							record.key || record.packageBulkItemId || record.packageSurgicalItemId
						}`}
						rules={[{ required: true, message: ' ' }]}
						style={{ height: '32px' }}>
						<Select
							onChange={(value) => handleChange(record, value, 'returnReason')}
							style={{ width: '150px' }}
							options={returnType}
						/>
					</FormItem>
				);
			},
		},
		{
			title: '图片',
			dataIndex: 'attachments',
			key: 'attachments',
			width: 180,
			render: (text, record, index) => {
				return (
					<Upload
						{...getImgProps(record)}
						onChange={(value) => handleImageChange(value, index, record)}
						headers={{ 'X-AUTH-TOKEN': sessionStorage.getItem('x_auth_token') || '' }}>
						<Button
							ghost
							type='primary'
							icon={<UploadOutlined />}>
							点击上传
						</Button>
					</Upload>
				);
			},
		},
		{
			title: '操作',
			dataIndex: 'key',
			key: 'key',
			width: 80,
			render: (text, record) => {
				return (
					<span
						className='handleLink'
						onClick={() => removeItem(record)}>
						删除
					</span>
				);
			},
		},
	];

	const searchColumns: ProFormColumns = [
		{
			title: '状态',
			dataIndex: 'statusList',
			valueType: 'tagSelect',
			fieldProps: {
				options: returnableStatus,
			},
		},
		{
			title: '退货仓库',
			dataIndex: 'warehouseId',
			valueType: 'select',
			initialValue: warehouseList && warehouseList.length ? warehouseList[0].value : undefined,
			fieldProps: {
				showSearch: true,
				value: selectedWh,
				options: warehouseList,
				onChange: (val: number) => {
					setSelectedWh(val);

					formRef.current?.setFieldsValue({
						warehouseId: val,
					});
				},
				filterOption: (input: string, option: { label: string }) => {
					return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
				},
			},
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
		},
		{
			title: '批号/序列号',
			dataIndex: 'lotNum',
		},
	];

	const returnSearchColumns: ProFormColumns = [
		{
			title: '扫描/输入条码',
			dataIndex: 'scanInput',
			valueType: 'scanInputWithSpace',
			fieldProps: {
				placeholder: '点击此处扫码',
				autoFocus: true,
				value: scanValue,
				onChange: scanChange,
				// onPressEnter: (val: { target: { value: string } }) => scanSubmit(val.target.value),
				onSubmit: scanSubmit,
			},
		},
		{
			title: '联系方式',
			dataIndex: 'contactPhone',
			fieldProps: {
				maxLength: 11,
			},
		},
	];
	return (
		<div className='main-page'>
			<div className='page-bread-crumb'>
				<Breadcrumb
					config={[
						'',
						['', { pathname: '/department/return_processing', state: { key: '2' } }],
						['', { pathname: '/department/return_processing', state: { key: '2' } }],
						'',
					]}
				/>
			</div>
			<Card bordered={false}>
				<ProTable
					tableInfoCode='department_add_return_goods_up_list'
					isTbaleBespread={true}
					searchConfig={{
						columns: searchColumns,
						formRef,
					}}
					onReset={() => {
						resetSerach();
					}}
					tableRef={tableRef}
					columns={columns}
					params={{
						warehouseId: selectedWh
							? selectedWh
							: warehouseList && warehouseList.length && warehouseList[0].value,
					}}
					api={getReturnable}
					rowKey='key'
					rowSelection={{
						selectedRowKeys: selectedKeys,
						onSelect: selectRow,
						columnTitle: ' ',
					}}
					scroll={{
						y: 300,
					}}
					onRow={(record) => ({
						onClick: () => {
							selectRowOfClick(record);
						},
					})}
					tableAlertOptionRender={
						<a
							onClick={() => {
								setSelectedList([]);
								setSelectedKeys([]);
							}}>
							取消选择
						</a>
					}
				/>
			</Card>
			<Form
				form={form}
				{...searchFormItem4}
				labelAlign='left'>
				<Card
					bordered={false}
					className='mb6'>
					<h3 className='mb1'>待退货列表</h3>
					<div id='returnPurchaseDepartmentTable'>
						<ProTable
							tableInfoCode='department_add_return_goods_down_list'
							isTbaleBespread={true}
							columns={submitColumns}
							searchConfig={{
								columns: returnSearchColumns,
								form: form,
								formRef,
								submitter: { render: () => [] },
							}}
							rowKey='key'
							dataSource={selectedList}
							pagination={false}
							scroll={{
								y: 250,
								x: '100%',
							}}
							size='small'
						/>
					</div>
				</Card>

				<FooterToolbar>
					<Button
						onClick={() => {
							history.push({ pathname: '/department/return_processing', state: { key: '2' } });
						}}
						className='returnButton'>
						返回
					</Button>
					<Button
						type='primary'
						onClick={listSubmit}
						loading={submitLoading}
						className='verifyButton'>
						确认操作
					</Button>
				</FooterToolbar>
			</Form>
			<AddMoreModal
				isOpen={moreVisible}
				setIsOpen={setMoreVisible}
				allList={moreAllList}
				selectList={selectedList}
				submitList={setSelectedList}
				submitKey={setSelectedKeys}
			/>
		</div>
	);
};

export default connect(({ global }: ConnectState) => ({ global }))(AddList);
