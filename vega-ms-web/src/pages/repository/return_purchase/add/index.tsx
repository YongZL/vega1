import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import { Tips } from '@/components/GetNotification';
import InputUnit from '@/components/InputUnit';
import { ProColumns } from '@/components/ProTable';
import ProTable from '@/components/ResizableTable';
import { ProFormColumns } from '@/components/SchemaForm';
import { returnType } from '@/constants/dictionary';
import { searchFormItem4 } from '@/constants/formLayout';
import { useCentralWarehouse } from '@/hooks/useWarehouseList';
import { notBarcodeControllerList, submitCode, submitData } from '@/services/returnGoods';
import { judgeBarCodeOrUDI, scrollTable, transformSBCtoDBC } from '@/utils';
import { beforeUpload } from '@/utils/file';
import { convertPriceWithDecimal, formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { getUrl } from '@/utils/utils';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Form, Select, Upload } from 'antd';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { history, useModel } from 'umi';

type Details = {
	attachments?: string[];
	goodsItemId?: number;
	nonBarcodeUniqueKey?: string;
	quantity?: number;
	recordId?: number;
	returnReason?: string;
};
type listType = ReturnGoodsController.SubmitList &
	ReturnGoodsController.NotBarcodeControllerListRecord;
const FormItem = Form.Item;
const AddList: FC = () => {
	const { fields } = useModel('fieldsMapping');
	const [list, setList] = useState<listType[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [imgLoading, setImgLoading] = useState<boolean>(false);
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [scanValue, setScanValue] = useState('');
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const [selectedList, setSelectedList] = useState<
		ReturnGoodsController.NotBarcodeControllerListRecord[]
	>([]);
	const [form] = Form.useForm();
	const warehouseList = useCentralWarehouse();

	// 获取图片列表
	const getImgList = (list: any[]) => {
		let returnList: string[] = [];
		list.map((item) => {
			returnList.push(item.response);
		});
		return returnList;
	};

	// 提交
	const listSubmit = () => {
		for (let index = 0; index < list.length; index++) {
			if (!list[index].returnReason) {
				scrollTable(Number(index) + 1, 'returnPurchaseTable');
				break;
			}
		}
		form.validateFields().then(async (value) => {
			if (imgLoading) {
				notification.warning('图片上传中，请稍后');
				return;
			}
			if (list.length <= 0) {
				notification.warning(`请扫码添加${fields.goods}`);
				return;
			}
			let details: Details[] = [];

			list.forEach((item) => {
				details.push({
					attachments: getImgList(item.fileList || []),
					goodsItemId: item.goodsItemId,
					nonBarcodeUniqueKey: item.nonBarcodeUniqueKey,
					quantity: item.num || item.quantity,
					recordId: item.recordId,
					returnReason: item.returnReason,
				});
			});
			setSubmitLoading(true);
			const params: ReturnGoodsController.CenterSubmitParams = {
				details,
				warehouseId: warehouseList[0].id,
				contactPhone: value.contactPhone,
			};
			const res = await submitData(params);
			if (res && res.code === 0) {
				notification.success('操作成功');
				history.push('/department/return_processing');
			}
			setSubmitLoading(false);
		});
	};

	// upload img
	const handleImageChange = (info: UploadChangeParam<UploadFile<any>>, index: string | number) => {
		setImgLoading(true);
		let file = info.file;
		let status = file.status;
		let submitList = cloneDeep(list);
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
			setList(submitList);
		}
		if (status === 'done' && file.response) {
			if (typeof file.response === 'object') {
				if (file.response.code === 0) {
					// changedItem[prop] = !changedItem[prop] ? [] : changedItem[prop];
					// changedItem[prop].push(file.response);
					changedItem.fileList = currList;
					setList(submitList);
				} else {
					notification.error(file.response.msg);
				}
			} else {
				// changedItem[prop] = !changedItem[prop] ? [] : changedItem[prop];
				// changedItem[prop].push(file.response);
				changedItem.fileList = currList;
				setList(submitList);
			}
		}
		setImgLoading(false);
	};

	const handleChange = (record: any, value: any, key: string) => {
		const submitList = cloneDeep(list).map((item) => {
			if (record.barcodeControlled) {
				if (item.goodsItemId === record.goodsItemId) {
					item[key] = value;
					return item;
				}
			} else {
				if (item.nonBarcodeUniqueKey === record.nonBarcodeUniqueKey) {
					item[key] = value;
					return item;
				}
			}
			return item;
		});
		setList(submitList);
	};

	// 扫码搜索添加
	const scanSubmit = async (valueInput: string) => {
		let submitList = cloneDeep(list);
		if (!valueInput) {
			return;
		}
		let value = valueInput.replace(//g, '');
		if (value.indexOf('PB') > -1 || value.indexOf('PS') > -1) {
			notification.error('中心库不可退手术套包和定数包！');
			return;
		}
		if (list.some((item) => item['operatorBarcode'] === scanValue && item['quantity'] === 1)) {
			notification.error(`列表里已有该${fields.baseGoods}！`);
			return;
		}
		const transValue = transformSBCtoDBC(value);
		const gs1Code = transValue.indexOf('_') > -1 ? transValue : transValue;
		const goodsItemIds = submitList
			.filter((item) => item.barcodeControlled === true)
			.map((item) => item.goodsItemId)
			.join(',');
		const params = {
			code: gs1Code,
			warehouseId: warehouseList[0].id,
			scanned: goodsItemIds,
		};

		setLoading(true);
		const res: Record<string, any> = await submitCode(params);
		if (res && res.code === 0) {
			const data = { ...res.data, time: Date.now() };
			const allSome = list.filter((item) => item['operatorBarcode'] === data.operatorBarcode);
			if (allSome.length > 0 && allSome.length >= data.quantity) {
				notification.warning(`该${fields.baseGoods}已添加至上限`);
				setLoading(false);
				return;
			}
			submitList.push(data);
			setList(submitList);
			// 成功则清空
			setScanValue('');
		}
		setLoading(false);
	};

	// 扫码
	const scanChange = (value: string) => {
		setScanValue(value.replace(//g, ''));
	};
	// 删除
	const removeItem = (index: number) => {
		let submitList = cloneDeep(list);
		submitList.splice(index, 1);
		setList(submitList);
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

	useEffect(() => {
		const newList = list.filter((item) => !item.barcodeControlled);
		setSelectedList(newList);
		setSelectedKeys(newList.map((item) => item.nonBarcodeUniqueKey));
	}, [list]);

	const columns: ProColumns<listType>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (_text, _record, index) => index + 1,
		},
		{
			title: `${fields.goods}条码/UDI`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 230,
			ellipsis: true,
			renderText: (text, record) => judgeBarCodeOrUDI(record),
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			renderText: (text: string, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 100,
			align: 'right',
			renderText: (_text, record) => convertPriceWithDecimal(record.price) || '-',
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
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 150,
			renderText: (_text, record) =>
				record.productionDate ? moment(record.productionDate).format('YYYY/MM/DD') : '-',
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 120,
			renderText: (_text, record) =>
				record.expirationDate ? moment(record.expirationDate).format('YYYY/MM/DD') : '-',
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
			render: (text, record, index) => {
				return (
					<InputUnit
						onChange={(value: any) => handleChange(record, value, 'num')}
						disabled={Number(text) <= 1}
						unit={record.minGoodsUnitName}
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
			render: (_text, record, index) => {
				return (
					<FormItem
						preserve={false}
						className='mg0'
						name={`returnReason${record.nonBarcodeUniqueKey || record.goodsItemId}`}
						rules={[{ required: true, message: ' ' }]}
						style={{ height: '32px' }}>
						<Select
							onChange={(value) => handleChange(record, value, 'returnReason')}
							style={{ width: '140px' }}
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
						onChange={(value) => handleImageChange(value, index)}
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
			render: (text, record, index) => {
				return (
					<span
						className='handleLink'
						onClick={() => removeItem(index)}>
						删除
					</span>
				);
			},
		},
	];
	const goodsColumns: ProColumns<ReturnGoodsController.NotBarcodeControllerListRecord>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 230,
			ellipsis: true,
		},
		{
			title: 'DI',
			dataIndex: 'diCode',
			key: 'diCode',
			width: 230,
			ellipsis: true,
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			renderText: (text: string, record) => formatStrConnect(record, ['specification', 'model']),
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '批号',
			dataIndex: 'lotNum',
			key: 'lotNum',
			width: 150,
			ellipsis: true,
		},
		{
			title: '单价(元)',
			dataIndex: 'price',
			key: 'price',
			width: 100,
			align: 'right',
			renderText: (text, record) => convertPriceWithDecimal(record.price) || '-',
		},
		{
			title: '生产日期',
			dataIndex: 'productionDate',
			key: 'productionDate',
			width: 150,
			renderText: (text, record) =>
				record.productionDate ? moment(record.productionDate).format('YYYY/MM/DD') : '-',
		},
		{
			title: '有效期至',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width: 120,
			renderText: (text, record) =>
				record.expirationDate ? moment(record.expirationDate).format('YYYY/MM/DD') : '-',
		},
		{
			title: '库存数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 150,
			ellipsis: true,
		},
	];

	const goodsSearchColumns: ProFormColumns = [
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
			title: 'DI',
			dataIndex: 'diCode',
			fieldProps: {
				placeholder: '请输入器械标识号',
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			fieldProps: {
				placeholder: '请输入生产厂家',
			},
		},
	];
	//取消选中
	const handleUnselect = () => {
		let newList = [...list];
		newList = newList.filter((item) => item.barcodeControlled === true);
		setList(newList);
	};

	const selectRow = (
		record: ReturnGoodsController.NotBarcodeControllerListRecord,
		selected: boolean,
	) => {
		let newSelectedList = [...selectedList];
		if (selected) {
			newSelectedList.push(record);
			setList([...list, record]);
		} else {
			newSelectedList = newSelectedList.filter(
				(item) => item.nonBarcodeUniqueKey !== record.nonBarcodeUniqueKey,
			);
			setList(list.filter((item) => item.nonBarcodeUniqueKey !== record.nonBarcodeUniqueKey));
		}
		setSelectedList(newSelectedList);
		setSelectedKeys(newSelectedList.map((item) => item.nonBarcodeUniqueKey));
	};
	const onSelectAll = (
		selected: boolean,
		recordList: ReturnGoodsController.NotBarcodeControllerListRecord[],
		selecterecordList: ReturnGoodsController.NotBarcodeControllerListRecord[],
	) => {
		let newSelectedList = [...selectedList];
		let newList = [...list];
		if (selected) {
			newSelectedList = [...newSelectedList, ...selecterecordList];
			newList = [...newList, ...selecterecordList];
		} else {
			selecterecordList.forEach((item) => {
				newSelectedList = newSelectedList.filter(
					(val) => val.nonBarcodeUniqueKey !== item.nonBarcodeUniqueKey,
				);
				newList = newList.filter((val) => val.nonBarcodeUniqueKey !== item.nonBarcodeUniqueKey);
			});
		}
		setSelectedList(newSelectedList);
		setList(newList);
		setSelectedKeys(newSelectedList.map((item) => item.nonBarcodeUniqueKey));
	};
	const selectRowOfClick = (record: ReturnGoodsController.NotBarcodeControllerListRecord) => {
		selectRow(record, !selectedKeys.includes(record.nonBarcodeUniqueKey));
	};

	const searchColumns: ProFormColumns = [
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
						['', '/department/return_processing'],
						['', '/department/return_processing'],
						'',
					]}
				/>
			</div>
			<Card bordered={false}>
				<ProTable<ReturnGoodsController.NotBarcodeControllerListRecord>
					tableInfoCode='add_return_goods_up_list'
					isTbaleBespread={true}
					headerTitle={
						<Tips
							headerTitle=''
							text={`* 此检索详情仅包含“非条码管控”${fields.goods}。“条码管控”${fields.goods}请于下方扫码退货`}
						/>
					}
					searchConfig={{
						columns: goodsSearchColumns,
					}}
					columns={goodsColumns}
					api={notBarcodeControllerList}
					rowKey='nonBarcodeUniqueKey'
					rowSelection={{
						selectedRowKeys: selectedKeys,
						onSelect: selectRow,
						onSelectAll: onSelectAll,
					}}
					scroll={{
						y: 300,
					}}
					onRow={(record) => ({
						onClick: () => {
							selectRowOfClick(record);
						},
					})}
					tableAlertOptionRender={<a onClick={handleUnselect}>取消选择</a>}
				/>
			</Card>
			<Card
				bordered={false}
				className='mb6'>
				<h3 className='mb1'>待退货列表</h3>
				<Form
					form={form}
					{...searchFormItem4}
					labelAlign='left'>
					<div id='returnPurchaseTable'>
						<ProTable<listType>
							tableInfoCode='add_return_goods_down_list'
							isTbaleBespread={true}
							searchConfig={{
								columns: searchColumns,
								submitter: { render: () => [] },
							}}
							headerTitle=''
							columns={columns}
							rowKey={(record) =>
								record.barcodeControlled ? record.goodsItemId! : record.nonBarcodeUniqueKey!
							} //条码管控的唯一标识与非条码管控的唯一标识不同，故有此写法
							dataSource={list}
							pagination={false}
							loading={loading}
							scroll={{ x: '100%', y: 300 }}
							size='small'
						/>
					</div>
					<FooterToolbar>
						<Button
							onClick={() => {
								history.goBack();
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
			</Card>
		</div>
	);
};

export default AddList;
