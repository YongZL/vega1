import type { ProFormColumns } from '@/components/SchemaForm';
import type { ChangeEvent } from 'react';

import React, { useState, useEffect, useCallback } from 'react';
import { Form } from 'antd';
import SchemaForm from '@/components/SchemaForm';

import { postReturnGoods } from '@/services/scanCountReport';
import { colItem2 } from '@/constants/formLayout';
import './index.less';

const colProps = colItem2;

interface IProps {
	trigger: JSX.Element;
	detail?: ScanCountReportController.ConsumeRecord;
	onFinish?: () => void;
}
const EditModal = ({ trigger, onFinish, detail }: IProps) => {
	const [visible, setVisible] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [quantity, setQuantity] = useState<number>(0);
	const [form] = Form.useForm();

	useEffect(() => {
		if (detail && visible) {
			const { retNum, splitQuantity, unitMl, quantity: qty, reason, scanCapacity } = detail;

			const count = Number(qty || 0) + Number(splitQuantity || 0);
			form.setFieldsValue({
				reason,
				quantity: count,
				retNum,
				consumeCapacity: (scanCapacity || 0) * count + (unitMl as string),
				retCapacity: retNum ? (scanCapacity || 0) * count + (unitMl as string) : '',
			});
			setQuantity(count);
		}
	}, [detail, visible]);

	const handleCancel = useCallback(() => {
		form.resetFields();
		setVisible(false);
		setQuantity(0);
	}, []);

	const handleOk = async (values: ScanCountReportController.ReturnGoodsParams) => {
		if (!values || !values.retNum) {
			return;
		}
		setLoading(true);
		const params = {
			id: detail?.id as number,
			retNum: Number(values.retNum || 0),
			reason: values.reason,
			retCapacity: parseInt(values.retCapacity as unknown as string),
			operateType: values.operateType,
			operationLongTime: new Date().getTime(),
		};
		try {
			const res = await postReturnGoods({ ...params });
			if (res && res.code === 0) {
				handleCancel();
				if (typeof onFinish === 'function') {
					onFinish();
				}
			}
		} finally {
			setLoading(false);
		}
	};

	const columns: ProFormColumns<ScanCountReportController.ReturnGoodsParams> = [
		{
			title: '消耗数量',
			dataIndex: 'quantity',
			colProps,
			fieldProps: {
				disabled: true,
			},
		},
		{
			title: '消耗容量',
			dataIndex: 'consumeCapacity',
			colProps,
			fieldProps: {
				disabled: true,
			},
		},
		{
			title: '退货/撤销数量',
			dataIndex: 'retNum',
			valueType: 'inputNumber',
			colProps,
			fieldProps: {
				onBlur: (e: ChangeEvent<HTMLInputElement>) => {
					const v = e.target.value;
					const reg = /^[1-9]*[1-9][0-9]*$/;
					const isNumber = reg.test(v);
					const value = isNumber ? Number(v) : 0;
					form.setFieldsValue({
						retCapacity: value
							? (Number((detail && detail.scanCapacity) || 0) || 0) * (Number(value) || 0) +
							  ((detail && detail.unitMl) || '')
							: '',
					});
				},
				onChange: (value: string) => {
					form.setFieldsValue({
						retCapacity: value
							? (Number((detail && detail.scanCapacity) || 0) || 0) * (Number(value) || 0) +
							  ((detail && detail.unitMl) || '')
							: '',
					});
				},
			},
			formItemProps: {
				labelCol: {
					style: { color: CONFIG_LESS['@c_starus_warning'] },
				},
			},
		},
		{
			title: '退货/撤销容量',
			dataIndex: 'retCapacity',
			colProps,
			fieldProps: {
				disabled: true,
				placeholder: '',
			},
		},
		{
			title: '操作类别',
			valueType: 'select',
			dataIndex: 'operateType',
			colProps,
			fieldProps: {
				options: [
					{ value: 'return', label: '退货' },
					{ value: 'revoke', label: '撤销' },
				],
			},
			formItemProps: {
				labelCol: {
					style: { color: CONFIG_LESS['@c_starus_warning'] },
				},
			},
		},
		{
			title: '退货/撤销原因',
			dataIndex: 'reason',
			colProps,
			fieldProps: {
				placeholder: '请输入',
			},
		},
	];

	return (
		<SchemaForm
			justifyLabel
			columns={columns}
			layoutType='ModalForm'
			/* @ts-ignore */
			onVisibleChange={(v: boolean) => {
				setVisible(v);
				if (!v) {
					handleCancel();
				}
			}}
			visible={visible}
			grid
			layout='horizontal'
			form={form}
			onFinish={handleOk}
			trigger={trigger}
			modalProps={{
				width: 800,
				title: '退货/撤销编辑',
				onOk: handleOk,
				onCancel: handleCancel,
				bodyStyle: { backgroundColor: CONFIG_LESS['@bgc_table'], padding: '16px 18px 0px' },
				destroyOnClose: true,
			}}
			rules={{
				retNum: [
					{ required: true, message: '' },
					{
						validator: (_rule: any, value: string) => {
							if (!value) {
								return Promise.resolve();
							} else {
								let reg = /^[1-9]*[1-9][0-9]*$/;
								if (!reg.test(value) || Number(value) > quantity) {
									return Promise.reject('');
								}
								return Promise.resolve();
							}
						},
					},
				],
				operateType: [{ required: true, message: '' }],
			}}
			submitter={{
				searchConfig: {
					submitText: '保存',
					resetText: '退出',
				},
				submitButtonProps: { loading, style: { marginLeft: 8 } },
			}}
		/>
	);
};

export default EditModal;
