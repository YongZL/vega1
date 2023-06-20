import type { ProFormColumns } from '@/components/SchemaForm';
import type { match as Match } from 'react-router';

import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import SchemaForm from '@/components/SchemaForm';
import { getDay } from '@/utils';
import { convertPriceWithDecimal } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Card, Form } from 'antd';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';
import { history } from 'umi';

import { colItem3, searchFormItem6 } from '@/constants/formLayout';
import { equipmentAdd, equipmentEdit } from '@/services/equipment';

const AddList: FC = () => {
	const handleType =
		history.location.state && (history.location.state as { id: number }).id ? 'edit' : 'add';
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [form] = Form.useForm();
	const [id, setId] = useState();

	useEffect(() => {
		if (handleType === 'edit') {
			const data: any = history.location.state;
			setId(data.id);
			form.setFieldsValue({
				assetClassification: data.assetClassification,
				departmentName: data.departmentName,
				equipmentCode: data.equipmentCode,
				equipmentName: data.equipmentName,
				equipmentStoragePlace: data.equipmentStoragePlace,
				price: convertPriceWithDecimal(data.price || 0),
				getTime: data.getTime ? moment(data.getTime) : undefined,
			});
		}
	}, [handleType]);

	// 提交
	const postSubmit = () => {
		form.validateFields().then(async (values: any) => {
			const params = {
				...values,
				getTime: getDay(values.getTime),
				price: (parseFloat(values.price || 0) * 10000).toFixed(0),
			};
			const res =
				handleType === 'add' ? await equipmentAdd(params) : await equipmentEdit({ ...params, id });
			setSubmitLoading(false);
			if (res.code === 0) {
				notification.success('操作成功');
				history.push(`/base_data/equipment`);
			}
		});
	};

	const columns: ProFormColumns = [
		{
			title: '设备名称',
			dataIndex: 'equipmentName',
			colProps: colItem3,
			fieldProps: {
				maxLength: 20,
				placeholder: '请输入设备名称',
			},
			formItemProps: {
				rules: [{ required: true, message: '请输入设备名称' }],
			},
		},
		{
			title: '资产分类',
			dataIndex: 'assetClassification',
			colProps: colItem3,
			fieldProps: {
				maxLength: 20,
				placeholder: '请输入资产分类',
			},
			formItemProps: {
				rules: [{ required: true, message: '请输入资产分类' }],
			},
		},
		{
			title: '设备存放地点',
			dataIndex: 'equipmentStoragePlace',
			colProps: colItem3,
			fieldProps: {
				maxLength: 30,
				placeholder: '请输入设备存放地点',
			},
			formItemProps: {
				rules: [{ required: true, message: '请输入设备存放地点' }],
			},
		},
		{
			title: '所属部门',
			dataIndex: 'departmentName',
			colProps: colItem3,
			fieldProps: {
				maxLength: 20,
				placeholder: '请输入所属部门',
			},
			formItemProps: {
				rules: [{ required: true, message: '请输入所属部门' }],
			},
		},
		{
			title: '卡片编号',
			dataIndex: 'equipmentCode',
			colProps: colItem3,
			fieldProps: {
				maxLength: 20,
				placeholder: '请输入卡片编号',
			},
			formItemProps: {
				rules: [{ required: true, message: '请输入卡片编号' }],
			},
		},
		{
			title: '原始价值(元)',
			dataIndex: 'price',
			valueType: 'inputNumber',
			colProps: colItem3,
			fieldProps: {
				min: 0,
				max: 99999999,
				maxLength: 8,
				placeholder: '请输入原始价值',
			},
			formItemProps: {
				rules: [{ required: true, message: '请输入原始价值' }],
			},
		},
		{
			title: '取得时间',
			dataIndex: 'getTime',
			valueType: 'datePicker',
			colProps: colItem3,
			fieldProps: {
				format: 'YYYY/MM/DD',
				style: { width: '100%' },
				placeholder: '请选择取得时间',
			},
			formItemProps: {
				rules: [{ required: true, message: '请选择取得时间' }],
			},
		},
	];

	return (
		<>
			<Breadcrumb config={['', ['', '/base_data/equipment'], ``]} />
			<Card bordered={false}>
				<SchemaForm
					columns={columns}
					grid
					layoutType='Form'
					form={form}
					{...searchFormItem6}
					layout='horizontal'
					submitter={{
						render: () => [],
					}}
				/>
				<FooterToolbar>
					<Button
						onClick={() => {
							history.goBack();
						}}>
						返回
					</Button>
					<Button
						type='primary'
						loading={submitLoading}
						onClick={postSubmit}>
						提交
					</Button>
				</FooterToolbar>
			</Card>
		</>
	);
};

export default AddList;
