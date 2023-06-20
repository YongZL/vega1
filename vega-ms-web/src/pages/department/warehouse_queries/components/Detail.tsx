import Descriptions, { DescriptionsItemProps } from '@/components/Descriptions';
import ProTable, { ProColumns } from '@/components/ProTable';
import ScanInput from '@/components/ScanInput';
import {
	reallocationOrderStatusValueEnum,
	reallocationStatusTextMap,
} from '@/constants/dictionary';
import { approve, batchPass, commit, getDetail, pass } from '@/services/reallocate';
import { accessNameMap, getScrollX, judgeBarCodeOrUDI, transformSBCtoDBC } from '@/utils';
import { formatStrConnect, formatToGS1 } from '@/utils/format';
import { notification } from '@/utils/ui';
import '@ant-design/compatible/assets/index.css';
import { Button, Form, Input, Modal, Radio, Statistic } from 'antd';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import React, { FormEvent, useEffect, useState } from 'react';
import { useAccess, useModel } from 'umi';

const FormItem = Form.Item;
const accessNameMaplist: Record<string, any> = accessNameMap();
const handleTitle = {
	detail: accessNameMaplist.acceptance_order_view,
	approve: '调拨单审核',
	acceptance: '调拨单验收',
};

export interface UpdateProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	handleType?: string;
	orderId?: number;
	getFormList?: () => void;
}

type GoodsList = ReallocateController.GoodsList;
type DataItem = ReallocateController.DataItem;

const DetailModal: React.FC<UpdateProps> = (props) => {
	const access = useAccess();
	const { fields } = useModel('fieldsMapping');
	const [goodsList, setGoodsList] = useState<GoodsList[]>([]);
	// const [packageBulkList, setPackageBulkList] = useState([]);
	// const [surgicalPkgBulkList, setSurgicalPkgBulkList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [submitLoading, setSubmitLoading] = useState(false);
	const [detail, setDetail] = useState<Record<string, any>>({});
	const [acceptVisible, setAcceptVisible] = useState(false);
	const [formAgree, setFormAgree] = useState<string>('');
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const [scanValue, setScanValue] = useState<string>('');
	const [form] = Form.useForm();

	const { isOpen, handleType = '', orderId, setIsOpen, getFormList = () => {} } = props;

	// 弹窗详情
	const getDetailInfo = async () => {
		setLoading(true);
		const res = await getDetail({ reallocateId: orderId });
		if (res && res.code === 0) {
			setGoodsList(res.data.goodsList || []);
			// setPackageBulkList(res.data.packageBulkList);
			// setSurgicalPkgBulkList(res.data.surgicalPkgBulkList);
			setDetail(res.data.order);
		}
		setLoading(false);
	};

	// 关闭弹窗
	const modalCancel = (update: boolean) => {
		setScanValue('');
		setGoodsList([]);
		// setPackageBulkList([]);
		// setSurgicalPkgBulkList([]);
		setSelectedKeys([]);
		form.resetFields();
		setIsOpen(false);
		if (update) {
			getFormList();
		}
	};

	const auditCancel = () => {
		setAcceptVisible(false);
		form.resetFields(['auditType', 'auditReason']);
	};

	const showBatch = () => {
		setAcceptVisible(true);
		form.setFieldsValue({ auditType: 'Y' });
		setFormAgree('');
	};

	// 提交
	const returnSubmit = async () => {
		setSubmitLoading(true);
		try {
			// 审核
			if (handleType === 'approve') {
				form.validateFields().then(async (values) => {
					const params = transformSBCtoDBC({
						status: values.agree !== 'N',
						reason: values.reason,
						reallocateId: orderId,
					});
					setLoading(true);
					const res = await approve(params);
					if (res && res.code === 0) {
						notification.success('操作成功！');
						modalCancel(true);
					}
					setLoading(false);
				});
			}

			// 验收提交
			if (handleType === 'acceptance') {
				setLoading(true);
				const res = await commit({ reallocateId: orderId });
				if (res && res.code === 0) {
					notification.success('操作成功！');
					modalCancel(true);
				}
				setLoading(false);
			}
		} finally {
			setSubmitLoading(false);
		}
	};

	const scanChange = (value: string) => {
		setScanValue(value);
	};

	// 批量验收
	const goodsAcceptSubmit = () => {
		form.validateFields().then(async (values) => {
			const params = {
				operatorBarcodeList: selectedKeys,
				reallocateId: orderId,
				reason: values.reason,
				status: values.auditType !== 'N',
			};
			setLoading(true);
			const res = await batchPass(params);
			if (res && res.code === 0) {
				notification.success('操作成功！');
				getDetailInfo();
				auditCancel();
			}
			setLoading(false);
		});
	};

	// 扫码提交
	const scanSubmit = async (valueInput: FormEvent<HTMLInputElement> | string) => {
		if (!valueInput) {
			return;
		}
		const gs1Code =
			(valueInput as string).indexOf('_') > -1 ? valueInput : formatToGS1(valueInput as string);
		const params = {
			operatorBarcode: gs1Code,
			reallocateId: detail.id,
		};
		const res = await pass(params);
		if (res && res.code === 0) {
			notification.success('操作成功！');
			getDetailInfo();
			getFormList();
			setScanValue('');
		}
	};

	const goodsModal: ProColumns<GoodsList>[] = [
		{
			title: '序号',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			align: 'center',
			render: (text, record, index) => index + 1,
		},
		{
			title: '验收状态',
			dataIndex: 'status',
			key: 'status',
			width: 120,
			filters: false,
			valueEnum: reallocationOrderStatusValueEnum,
		},
		{
			title: `${fields.goods}条码/UDI`,
			dataIndex: 'operatorBarcode',
			key: 'operatorBarcode',
			width: 180,
			renderText: (text, record) => judgeBarCodeOrUDI(record),
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			key: 'goodsName',
			width: 150,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			renderText: (text: string, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 200,
			ellipsis: true,
		},
		{
			title: '调拨数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
			render: (text, record) => {
				return <span>1 {record.minUnitName}</span>;
			},
		},
		{
			title: '调拨事由',
			dataIndex: 'remarks',
			key: 'remarks',
			width: 140,
		},
	];
	// const bulkModal = [
	//   {
	//     title: '序号',
	//     dataIndex: 'id',
	//     key: 'id',
	//     width: 80,
	//     align: 'center',
	//     render: (text, record, index) => index + 1,
	//   },
	//   {
	//     title: '验收状态',
	//     dataIndex: 'status',
	//     key: 'status',
	//     width: 100,
	//     filters: false,
	//     valueEnum: reallocationOrderStatusValueEnum,
	//   },
	//   {
	//     title: `${fields.goods}条码`,
	//     dataIndex: 'operatorBarcode',
	//     key: 'operatorBarcode',
	//     width: 150,
	//   },
	//   {
	//     title: '定数包名称',
	//     dataIndex: 'packageName',
	//     key: 'packageName',
	//     width: 180,
	//     ellipsis: true,
	//   },
	//   {
	//     title: fields.goodsName,
	//     dataIndex: 'goodsName',
	//     key: 'goodsName',
	//     width: 180,
	//     ellipsis: true,
	//   },
	//   {
	//     title: '规格/型号',
	//     dataIndex: 'specification',
	//     key: 'specification',
	//     ellipsis: true,
	//     width: 150,
	//     render: (text: any, record: any) => {
	//       let info = `${record.specification || ''} ${(record.specification && record.model && '/') || ''
	//         } ${record.model || ''}`;
	//       return <span>{info}</span>;
	//     },
	//   },
	//   {
	//     title: '包装数',
	//     dataIndex: 'quantity',
	//     key: 'quantity',
	//     width: 100,
	//     render: (num, record) => {
	//       return (
	//         <span>
	//           {num}
	//           {record.minUnitName}/包
	//         </span>
	//       );
	//     },
	//   },
	//   {
	//     title: '调拨数量',
	//     dataIndex: 'quantity',
	//     key: 'quantity',
	//     width: 100,
	//     render: () => {
	//       return <span>1包</span>;
	//     },
	//   },
	//   {
	//     title: '调拨事由',
	//     dataIndex: 'remarks',
	//     key: 'remarks',
	//     width: 150,
	//     editable: true,
	//   },
	// ];
	// const surgicalModal = [
	//   {
	//     title: '序号',
	//     dataIndex: 'id',
	//     key: 'id',
	//     width: 80,
	//     align: 'center',
	//     render: (text, record, index) => index + 1,
	//   },
	//   {
	//     title: '验收状态',
	//     dataIndex: 'status',
	//     key: 'status',
	//     width: 120,
	//     filters: false,
	//     valueEnum: reallocationOrderStatusValueEnum,
	//   },
	//   {
	//     title: fields.goodsCode,
	//     dataIndex: 'operatorBarcode',
	//     key: 'operatorBarcode',
	//     width: 150,
	//   },
	//   {
	//     title: '套包名称',
	//     dataIndex: 'surgicalPkgName',
	//     key: 'surgicalPkgName',
	//     width: 200,
	//     editable: true,
	//   },
	//   {
	//     title: '类别',
	//     dataIndex: 'category',
	//     key: 'category',
	//     width: 120,
	//   },
	//   {
	//     title: '调拨数量',
	//     dataIndex: 'quantity',
	//     key: 'quantity',
	//     width: 100,
	//     render: () => {
	//       return <span>1套</span>;
	//     },
	//   },
	//   {
	//     title: '调拨事由',
	//     dataIndex: 'remarks',
	//     key: 'remarks',
	//     width: 150,
	//     editable: true,
	//   },
	// ];

	const allList = [goodsModal];
	allList.forEach((item) => {
		if (handleType === 'approve') {
			item.splice(1, 1);
		}
		if (handleType === 'detail') {
			item.push({
				title: '验收不通过原因',
				dataIndex: 'reason',
				key: 'reason',
				width: 'L',
				ellipsis: true,
			});
		}
	});

	// 选择
	const selectRow = (selectData: GoodsList, status: boolean) => {
		let selectedRowKeys: string[] = cloneDeep(selectedKeys);
		const detailList = goodsList;
		if (status) {
			selectedRowKeys.push(selectData.operatorBarcode);
		} else {
			detailList.forEach((val, index) => {
				if (val.operatorBarcode === selectData.operatorBarcode) {
					selectedRowKeys.splice(index, 1);
				}
			});
		}
		setSelectedKeys(selectedRowKeys);
	};

	// 全选
	const onSelectAll = (
		selected: boolean,
		selectedRecords: GoodsList[],
		changeRecords: GoodsList[],
	) => {
		let selectedRowKeys = cloneDeep(selectedKeys);
		let list = selectedRecords.map((item) => item.operatorBarcode);
		if (selected) {
			selectedRowKeys = Array.from(new Set(selectedRowKeys.concat(list)));
		} else {
			changeRecords.forEach((item) => {
				selectedRowKeys = selectedRowKeys.filter((el) => el !== item.operatorBarcode);
			});
		}
		setSelectedKeys(selectedRowKeys);
	};

	// 单行点击选中
	const selectRowOfClick = (record: any) => {
		if (record.status !== null) {
			return;
		}
		if (selectedKeys.some((item) => item === record.operatorBarcode)) {
			selectRow(record, false);
		} else {
			selectRow(record, true);
		}
	};

	const rowSelection = {
		selectedRowKeys: selectedKeys,
		onSelect: selectRow,
		onSelectAll: onSelectAll,
		getCheckboxProps: (record: any) => ({
			disabled: ['rejected', 'passed'].includes(record.status),
		}),
	};

	const tabs = [
		{
			name: fields.baseGoods,
			type: 'goods',
			columns: goodsModal, // 固定列处理
			data: goodsList,
		},
		// {
		//   name: '定数包',
		//   type: 'package_bulk',
		//   columns: bulkModal,
		//   data: packageBulkList,
		// },
		// {
		//   name: '手术套包',
		//   type: 'package_surgical',
		//   columns: surgicalModal,
		//   data: surgicalPkgBulkList,
		// },
	];

	const options: DescriptionsItemProps<DataItem>[] = [
		{
			label: '调拨单号',
			dataIndex: 'code',
		},
		{
			label: '发起科室',
			dataIndex: 'sourceDepartmentName',
		},
		{
			label: '发起仓库',
			dataIndex: 'sourceWarehouseName',
		},
		{
			label: '接收科室',
			dataIndex: 'targetDepartmentName',
		},
		{
			label: '接收仓库',
			dataIndex: 'targetWarehouseName',
		},
		{
			label: '审核人员',
			dataIndex: 'approvedName',
		},
		{
			label: '审核时间',
			dataIndex: 'timeApproved',
			render: (timeApproved) =>
				timeApproved ? moment(timeApproved).format('YYYY/MM/DD  HH:mm:ss') : '-',
		},
	];

	useEffect(() => {
		if (isOpen) {
			getDetailInfo();
			form.setFieldsValue({ agree: 'Y' });
			setFormAgree('');
		}
	}, [isOpen]);

	useEffect(() => {
		if (['approve'].includes(handleType)) {
			form.setFieldsValue({ agree: 'Y' });
			setFormAgree('');
		}
	}, [handleType]);

	const modalAccept = {
		visible: acceptVisible,
		maskClosable: false,
		title: '验收',
		onCancel: auditCancel,
		footer: (
			<React.Fragment>
				<Button onClick={auditCancel}>取消</Button>
				<Button
					type='primary'
					onClick={goodsAcceptSubmit}
					loading={loading}>
					提交
				</Button>
			</React.Fragment>
		),
		destroyOnClose: true,
	};
	return (
		<Form form={form}>
			<Modal
				width='80%'
				destroyOnClose
				maskClosable={false}
				visible={isOpen}
				title={<>{handleTitle[handleType]}</>}
				onCancel={() => modalCancel(false)}
				footer={
					(handleType === 'approve' && access.warehouse_request_approval) ||
					(handleType === 'acceptance' && access.warehouse_request_accept)
						? [
								<Button
									type='primary'
									loading={submitLoading}
									onClick={returnSubmit}>
									提交
								</Button>,
								handleType === 'acceptance' && (
									<Button
										type='primary'
										disabled={!selectedKeys.length}
										onClick={showBatch}>
										批量操作
									</Button>
								),
						  ]
						: false
				}>
				<div className='modelInfo'>
					<div className='left'>
						<Descriptions<DataItem>
							options={options}
							data={detail as DataItem}
							optionEmptyText={'-'}
						/>
					</div>
					<div className='right'>
						<Statistic
							title='当前状态'
							value={reallocationStatusTextMap[detail.status] || '-'}
						/>
					</div>
				</div>
				{handleType === 'acceptance' && (
					<div className='scanInput'>
						<ScanInput
							value={scanValue}
							onSubmit={scanSubmit}
							onPressEnter={scanSubmit}
							onChange={scanChange}
							autoFocus={true}
							placeholder='点击此处扫码'
						/>
					</div>
				)}

				{tabs.map((item) => {
					return (
						item.data.length > 0 && (
							<div key={item.type}>
								<h3>{item.name}</h3>
								<ProTable
									className='mb2'
									rowSelection={handleType === 'acceptance' ? rowSelection : undefined}
									loading={loading}
									columns={item.columns}
									rowKey='operatorBarcode'
									dataSource={item.data}
									scroll={{
										y: 300,
										x: getScrollX(item.columns, true),
									}}
									pagination={false}
									size='small'
									onRow={(record) => ({
										onClick: () => {
											if (handleType === 'acceptance') {
												selectRowOfClick(record);
											}
										},
									})}
								/>
							</div>
						)
					);
				})}

				{handleType === 'approve' && access.warehouse_request_approval && (
					<>
						<h3 className='mt2 mb1'>审核结果</h3>
						<FormItem
							name='agree'
							rules={[{ required: true, message: '请选择' }]}>
							<Radio.Group onChange={(e) => setFormAgree(e.target.value)}>
								<Radio
									value='Y'
									style={{ display: 'block', marginBottom: '10px' }}>
									通过
								</Radio>
								<Radio
									value='N'
									style={{ display: 'block' }}>
									不通过
								</Radio>
							</Radio.Group>
						</FormItem>
						{formAgree === 'N' && (
							<FormItem
								name='reason'
								rules={[{ required: true, message: '请输入不通过' }]}
								style={{ marginLeft: '22px' }}>
								<Input.TextArea
									style={{ maxWidth: '500px' }}
									rows={3}
									placeholder='请输入不通过理由'
									maxLength={100}
								/>
							</FormItem>
						)}
					</>
				)}
			</Modal>

			{handleType === 'acceptance' && (
				<Modal {...modalAccept}>
					<FormItem
						label='验收结果'
						name='auditType'
						rules={[{ required: true, message: '请选择' }]}>
						<Radio.Group onChange={(e) => setFormAgree(e.target.value)}>
							<Radio value='Y'>通过</Radio>
							<Radio value='N'>不通过</Radio>
						</Radio.Group>
					</FormItem>
					{formAgree === 'N' && (
						<FormItem
							label='原因'
							name='auditReason'
							rules={[{ required: true, message: '请输入验收不通过原因' }]}>
							<Input.TextArea
								rows={4}
								maxLength={100}
							/>
						</FormItem>
					)}
				</Modal>
			)}
		</Form>
	);
};

export default DetailModal;
