import type { ProFormColumns } from '@/components/SchemaForm';

import BaseModal from '@/components/BaseModal';
import SchemaForm from '@/components/SchemaForm';
import { colItem2 } from '@/constants/formLayout';
import { scanCapacityUpdate } from '@/services/scanCountReport';
import { Form } from 'antd';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { addRowAttribute } from '../utils';

const EditMdodal = ({
	selectRowData,
	onFinish,
	onCancel,
	setOperatorTip,
	setTableClass,
	tableElRef,
	dataSource,
}: any) => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [visible, setVisible] = useState<boolean>(true);
	const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
	const [params, setParams] = useState<Record<string, any>>({});

	useEffect(() => {
		form.setFieldsValue({ ...selectRowData });

		return () => {
			form?.resetFields();
			setConfirmVisible(false);
			setVisible(true);
		};
	}, []);

	const handleSave = (values: Record<string, any>) => {
		setVisible(false);
		setConfirmVisible(true);
		setParams({ ...values });
		setTableClass('consume-handle-table__active');
		addRowAttribute(tableElRef.current as Element, selectRowData.operatorBarcode, dataSource);
	};

	// 保存
	const saveData = () => {
		form
			.validateFields()
			.then((values: Record<string, any>) => {
				handleSave(values);
			})
			.catch((error: Record<string, any>) => {
				if (error.errorFields && error.errorFields.length === 0) {
					handleSave(error.values);
				}
			});
	};

	// 提交容量编辑
	const handleConfirm = async () => {
		setLoading(true);
		setOperatorTip('等待处理...');
		try {
			const res = await scanCapacityUpdate({
				goodsId: selectRowData.goodsId,
				scanCapacity: params.scanCapacity,
			});
			if (res && res.code === 0) {
				onFinish();
			}
		} finally {
			setLoading(false);
		}
	};

	const columns: ProFormColumns = [
		{
			title: fields.goodsCode,
			dataIndex: 'goodsCode',
			colProps: colItem2,
			fieldProps: {
				disabled: true,
			},
		},
		{
			title: '规格',
			dataIndex: 'specification',
			colProps: colItem2,
			fieldProps: {
				disabled: true,
			},
		},
		{
			title: fields.goodsName,
			dataIndex: 'goodsName',
			colProps: colItem2,
			fieldProps: {
				disabled: true,
			},
		},
		{
			title: '容量/单位',
			dataIndex: 'detectionCapacityUint',
			colProps: colItem2,
			fieldProps: {
				disabled: true,
			},
			formItemProps: {
				className: 'consumeHandleunitName',
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			colProps: colItem2,
			fieldProps: {
				disabled: true,
			},
		},
		{
			title: '单次容量',
			dataIndex: 'scanCapacity',
			colProps: colItem2,
			fieldProps: {
				suffix: selectRowData?.capacityUnit,
				type: 'number',
			},
			formItemProps: {
				labelCol: {
					style: { color: CONFIG_LESS['@c_starus_await'] },
				},
			},
		},
	];

	return (
		<>
			<BaseModal
				width={800}
				okText='保存'
				cancelText='退出'
				title='单次容量编辑'
				onOk={saveData}
				onCancel={onCancel}
				visible={visible}
				bodyStyle={{ background: CONFIG_LESS['@bgc_title'], padding: '16px 18px 0px' }}>
				<SchemaForm
					layoutType='Form'
					columns={columns}
					labelAlign='left'
					layout='horizontal'
					submitter={false}
					form={form}
					grid
					rules={{
						scanCapacity: [
							{ required: true, message: '' },
							{
								validator: (_rule, value: string) => {
									if (!value) {
										return Promise.resolve();
									} else {
										const reg = /^[1-9]*[1-9][0-9]*$/;
										if (!reg.test(value)) {
											return Promise.reject('');
										}
										return Promise.resolve();
									}
								},
							},
						],
					}}
				/>
			</BaseModal>
			{/* 确认编辑容量 */}
			<BaseModal
				width={270}
				okText='是'
				cancelText='否'
				destroyOnClose
				closable={false}
				maskClosable={false}
				onOk={handleConfirm}
				onCancel={() => {
					setTableClass('');
					setConfirmVisible(false);
					setVisible(true);
				}}
				visible={confirmVisible}
				okButtonProps={{
					loading,
				}}>
				<p>是否“确认该{fields.goods}条码之前分拆操作&确认本次容量编辑”？</p>
			</BaseModal>
		</>
	);
};

export default EditMdodal;
