import type { ProColumns, ProTableAction } from '@/components/ProTable/typings';
import type { ProFormColumns } from '@/components/SchemaForm/typings';

import ProTable from '@/components/ProTable';
import { roleBindUser } from '@/services/roleUser';
import { getUserListByRoleId } from '@/services/users';
import { notification } from '@/utils/ui';
import { Button, Form, Modal } from 'antd';
import { cloneElement, FC, useRef, useState } from 'react';

interface Props {
	trigger: JSX.Element;
	roleId: number;
	disabled?: boolean;
	getTableList: () => void;
	roleTypeTextMap?: Record<string, any>;
}

const CheckModal: FC<Props> = ({ getTableList, roleId, disabled, trigger, roleTypeTextMap }) => {
	const [form] = Form.useForm();
	const [visible, setVisible] = useState(false);
	const onCancel = () => setVisible(false);
	const tableRef = useRef<ProTableAction>();
	const [loading, setLoading] = useState(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

	const searchColumns: ProFormColumns = [
		{
			title: '登录账号',
			dataIndex: 'loginPhone',
		},
	];

	//点击选择
	const handleClick = (id: number) => {
		let ids: number[] = [...selectedRowKeys];
		if (ids.includes(id)) {
			ids = ids.filter((item) => item != id);
		} else {
			ids.push(id);
		}
		setSelectedRowKeys(ids);
	};

	const goodsColumns: ProColumns<UsersController.ByRoleIdGetUserRecord>[] = [
		{
			width: 'XXL',
			title: '登录账号',
			dataIndex: 'loginPhone',
		},
		{
			width: 'L',
			title: '类型',
			dataIndex: 'type',
			renderText: (text) => {
				return <span>{roleTypeTextMap[text]}</span>;
			},
		},
		{
			width: 'XL',
			title: '用户姓名',
			dataIndex: 'name',
		},
	];

	const rowSelection = {
		selectedRowKeys: selectedRowKeys,
		onChange: (selectedRowKeys: number[]) => {
			setSelectedRowKeys(selectedRowKeys);
		},
		getCheckboxProps: (record: { isAssociateToDepartment: string }) => ({
			disabled: record.isAssociateToDepartment,
		}),
	};

	const subMintBtn = async () => {
		if (selectedRowKeys.length === 0) {
			notification.warning('请选择用户');
			return;
		}

		setLoading(true);
		let res = await roleBindUser({
			roleId,
			userIds: selectedRowKeys,
		});
		if (res && res.code === 0) {
			notification.success('操作成功！');
			setSelectedRowKeys([]);
			getTableList();
			onCancel();
		}
		setLoading(false);
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
			{visible && (
				<div>
					<Modal
						destroyOnClose
						visible={visible}
						width={'80%'}
						maskClosable={false}
						title='选择绑定用户资料'
						onCancel={onCancel}
						footer={[
							<Button
								onClick={onCancel}
								key='cancel'>
								取消
							</Button>,
							<Button
								key='submit'
								type='primary'
								loading={loading}
								onClick={subMintBtn}>
								确定
							</Button>,
						]}
						className='ant-detail-modal'>
						<ProTable
							rowKey='id'
							params={{
								roleId,
								type: 'distributor',
								excludeExists: true,
							}}
							scroll={{ x: '100%', y: 300 }}
							//  tableInfoId="123"
							api={getUserListByRoleId}
							columns={goodsColumns}
							tableRef={tableRef}
							searchConfig={{
								form,
								columns: searchColumns,
							}}
							rowSelection={rowSelection}
							onRow={(record: Record<string, any>) => ({
								onClick: () => {
									handleClick(record?.id);
								},
							})}
							tableAlertOptionRender={
								<a
									onClick={() => {
										setSelectedRowKeys([]);
									}}>
									取消选择
								</a>
							}
						/>
					</Modal>
				</div>
			)}
		</>
	);
};
export default CheckModal;
