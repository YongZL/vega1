import type { FC } from 'react';

import { getPermissionsList } from '@/services/permissions';
import { addRole, editRole, getDetail } from '@/services/role';
import { accessNameMap, transformSBCtoDBC } from '@/utils';
import { genTreeData } from '@/utils/dataUtil';
import { notification } from '@/utils/ui';
import { Button, Form, Input, Modal, Select, Tree } from 'antd';
import { cloneElement, useEffect, useState } from 'react';

const FormItem = Form.Item;

export const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 4, offset: 1 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 18 },
	},
};

interface Props {
	trigger: JSX.Element;
	id?: number;
	disabled?: boolean;
	pageType?: boolean;
	roleType: ConfigController.UserType[];
	getTableList: () => void;
}

const CheckModal: FC<Props> = ({ trigger, id, disabled, pageType, getTableList, roleType }) => {
	const [form] = Form.useForm();
	const [visible, setVisible] = useState(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [details, setDetails] = useState<Record<string, any>>({});
	const [permissionValue, setPermissionValue] = useState<number[]>([]);
	const [treeData, setTreeData] = useState<Record<string, any>>({});
	const accessName = accessNameMap(); // 权限名称

	const closeModal = () => setVisible(false);

	const treeCheck = (value: number[]) => {
		form.setFieldsValue({
			['permissionIds']: value,
		});

		setPermissionValue(value);
	};

	const getPermissionsData = async () => {
		let res = await getPermissionsList();
		if (res && res.code === 0) {
			const treeData = genTreeData(res.data);
			setTreeData(treeData);
		}
	};

	const getTreeDataLastId = (data: Record<string, any>[], arr: number[]) => {
		data.forEach((item) => {
			const { children, value } = item;
			if (children !== undefined && children.length !== 0) {
				return getTreeDataLastId(children, arr);
			}
			arr.push(value);
		});
		return arr;
	};

	useEffect(() => {
		if (visible) {
			getPermissionsData();
		}
	}, [visible]);

	useEffect(() => {
		//获取详情
		const getDetailData = async (id: number) => {
			let details = await getDetail(id);
			if (details.code === 0) {
				setDetails(details?.data);
				const permissionIds = genTreeData(details?.data?.permissions);
				const permissionValues = permissionIds ? getTreeDataLastId(permissionIds, []) : [];
				setPermissionValue(permissionValues);
				form.resetFields();
			}
			setLoading(false);
		};

		if (id && visible) {
			setLoading(true);
			getDetailData(id);
		}
	}, [id, visible]);

	const onFinish = async () => {
		setLoading(true);
		try {
			const params = transformSBCtoDBC(await form.validateFields());
			let paramsObj = { ...params, isSystemDefined: false };
			let res = pageType
				? await editRole(id as number, { id, ...paramsObj })
				: await addRole(paramsObj);
			if (res && res.code == 0) {
				notification.success('操作成功！');
				closeModal();
				getTableList();
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{cloneElement(trigger, {
				onClick: () => {
					if (disabled) {
						return;
					}
					setVisible(true);
				},
			})}
			<Modal
				destroyOnClose
				visible={visible}
				width={'80%'}
				maskClosable={false}
				title={pageType ? accessName['edit_role'] : accessName['add_role']}
				onCancel={closeModal}
				footer={[
					<Button
						key='back'
						onClick={closeModal}>
						取消
					</Button>,
					<Button
						key='submit'
						type='primary'
						loading={loading}
						onClick={() => {
							form.submit();
						}}>
						确认操作
					</Button>,
				]}>
				<Form
					form={form}
					onFinish={onFinish}
					{...formItemLayout}>
					<FormItem
						label='权限名称'
						name='name'
						initialValue={details?.name}
						rules={[{ required: true, message: '请输入权限名称' }]}>
						<Input
							placeholder='请输入权限名称'
							maxLength={20}
						/>
					</FormItem>
					<FormItem
						label='编码'
						name='code'
						initialValue={details?.code}
						rules={[{ required: true, message: '请输入编码' }]}>
						<Input
							placeholder='请输入编码'
							maxLength={20}
							disabled={pageType}
						/>
					</FormItem>
					<FormItem
						label='类型'
						name='type'
						initialValue={details?.type}
						rules={[{ required: true, message: '请选择类型' }]}>
						<Select
							disabled={pageType}
							options={roleType}
							placeholder='请选择类型'
							getPopupContainer={(node) => node.parentNode}
						/>
					</FormItem>
					<FormItem
						label='权限分配'
						name='permissionIds'
						initialValue={permissionValue || []}
						rules={[{ required: true, message: '请选择权限分配' }]}>
						<Tree
							checkable
							selectable={false}
							onCheck={treeCheck}
							checkedKeys={permissionValue || []}
							className='treeBox'
							treeData={JSON.stringify(treeData) !== '{}' && treeData}></Tree>
					</FormItem>
					<FormItem
						label='备注'
						name='remark'
						initialValue={details?.remark}>
						<Input.TextArea
							rows={4}
							placeholder='请输入备注(选填)'
							maxLength={100}
						/>
					</FormItem>
				</Form>
			</Modal>
		</>
	);
};
export default CheckModal;
