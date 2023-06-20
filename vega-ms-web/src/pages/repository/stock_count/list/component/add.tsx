import React, { useState, useEffect } from 'react';
import { transformSBCtoDBC } from '@/utils';
import { notification } from '@/utils/ui';
import { Modal, Form, Select } from 'antd';
import { useWarehouseList } from '@/hooks/useWarehouseList';

import '@ant-design/compatible/assets/index.css';
import { formItemModal } from '@/constants/formLayout';
import { getUserListByDepId, add } from '../service';

const FormItem = Form.Item;

export interface UpdateProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	getFormList?: () => void;
}

const AddModal: React.FC<UpdateProps> = (props) => {
	const [userList, setUserList] = useState([]);
	const [loading, setLoading] = useState(false);

	const warehousesList = useWarehouseList({ excludeCentralWarehouse: true, virtual: true });
	const [form] = Form.useForm();

	const { isOpen, setIsOpen, getFormList } = props;

	// 关闭弹窗
	const modalCancel = (update: boolean) => {
		setUserList([]);
		setIsOpen(false);
		form.resetFields();
		if (update) {
			getFormList();
		}
	};

	// 获取用户列表
	const getUserList = async (departmentId: string) => {
		const params = {
			departmentId,
			pageNum: 0,
			pageSize: 1000,
		};
		const res = await getUserListByDepId(params);
		if (res && res.code === 0) {
			const list = res.data.rows.map((item: any) => ({ text: item.name, value: item.id }));
			setUserList(list);
		}
	};

	// 选择仓库
	const handleWarehouseChange = (value: string) => {
		form.resetFields(['stockTakingOperator', 'stockTakingReviewer', 'stockTakingWatcher']);
		const departmentId = warehousesList.find((item) => item.id === value).departmentId;
		getUserList(departmentId);
	};

	const handleSubmit = () => {
		form.validateFields().then(async (values: any) => {
			setLoading(true);
			const res = await add({ ...values });
			if (res && res.code === 0) {
				notification.success('新增成功');
				modalCancel(true);
			}
			setLoading(false);
		});
	};

	useEffect(() => {}, []);

	return (
		<Form
			form={form}
			{...formItemModal}
			labelAlign='left'>
			<Modal
				destroyOnClose
				maskClosable={false}
				visible={isOpen}
				title='新增盘库单'
				onCancel={() => modalCancel(false)}
				onOk={handleSubmit}
				confirmLoading={loading}>
				<FormItem
					name='warehouseId'
					label='仓库'
					rules={[{ required: true, message: '请选择' }]}>
					<Select
						placeholder='请选择仓库'
						getPopupContainer={(node) => node.parentNode}
						onChange={handleWarehouseChange}
						filterOption={(input, option: any) =>
							option.props.children.toLowerCase().indexOf(transformSBCtoDBC(input).toLowerCase()) >=
							0
						}
						showSearch>
						{warehousesList.map((item) => (
							<Select.Option
								value={item.id}
								key={item.id}>
								{item.name}
							</Select.Option>
						))}
					</Select>
				</FormItem>
				<FormItem
					name='stockTakingOperator'
					label='实盘人'
					rules={[{ required: true, message: '请选择' }]}>
					<Select
						placeholder='请选择实盘人'
						getPopupContainer={(node) => node.parentNode}
						filterOption={(input, option: any) =>
							option.props.children.toLowerCase().indexOf(transformSBCtoDBC(input).toLowerCase()) >=
							0
						}>
						{userList.map((item) => (
							<Select.Option value={item.value}>{item.text}</Select.Option>
						))}
					</Select>
				</FormItem>
				<FormItem
					name='stockTakingReviewer'
					label='复盘人'
					rules={[{ required: true, message: '请选择' }]}>
					<Select
						placeholder='请选择复盘人'
						getPopupContainer={(node) => node.parentNode}
						filterOption={(input, option: any) =>
							option.props.children.toLowerCase().indexOf(transformSBCtoDBC(input).toLowerCase()) >=
							0
						}>
						{userList.map((item) => (
							<Select.Option value={item.value}>{item.text}</Select.Option>
						))}
					</Select>
				</FormItem>
				<FormItem
					name='stockTakingWatcher'
					label='监盘人'
					rules={[{ required: true, message: '请选择' }]}>
					<Select
						placeholder='请选择监盘人'
						getPopupContainer={(node) => node.parentNode}
						filterOption={(input, option: any) =>
							option.props.children.toLowerCase().indexOf(transformSBCtoDBC(input).toLowerCase()) >=
							0
						}>
						{userList.map((item) => (
							<Select.Option value={item.value}>{item.text}</Select.Option>
						))}
					</Select>
				</FormItem>
			</Modal>
		</Form>
	);
};

export default AddModal;
