import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';

import { Checkbox, Modal, notification } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import { history, useModel } from 'umi';
import styles from './index.less';

const CheckboxGroup = Checkbox.Group;
const SelectWarehouseModal: React.FC<{ onFinish?: () => void }> = ({ onFinish }) => {
	const [checkedList, setCheckedList] = React.useState<CheckboxValueType[]>([]);
	const [indeterminate, setIndeterminate] = React.useState<boolean>(false);
	const [checkAll, setCheckAll] = React.useState<boolean>(false);
	const [visible, setVisible] = useState<boolean>(true);
	const { warehouses, saveWarehouses } = useModel('scanCountReport');

	// 选中科室
	const onChange = (list: CheckboxValueType[]) => {
		setCheckedList(list);
		setIndeterminate(!!list.length && list.length < warehouses?.length);
		setCheckAll(list.length === warehouses.length);
	};

	// 科室全选
	const onCheckAllChange = (e: CheckboxChangeEvent) => {
		setCheckedList(e.target.checked ? warehouses.map((item: any) => item.warehouseId) : []);
		setIndeterminate(false);
		setCheckAll(e.target.checked);
	};

	// 点击弹出确认
	const handleOk = async () => {
		if (checkedList.length < 1) {
			notification.error({
				message: '请选择科室/仓库！',
			});
			return;
		}
		sessionStorage.setItem('warehouseIds', JSON.stringify(checkedList));
		// 把用户选择中仓库的ID传给后端
		await saveWarehouses(checkedList as number[]);
		setVisible(false);
		if (typeof onFinish === 'function') {
			onFinish();
		}
	};

	// 点击弹出取消或关闭
	const handleCancel = () => {
		setCheckedList([]);
		setIndeterminate(false);
		setCheckAll(false);
		setVisible(false);
		history.goBack();
	};

	return (
		<>
			<Modal
				title='科室/仓库'
				width={697}
				centered={true}
				mask={false}
				maskClosable={false}
				visible={visible}
				onOk={handleOk}
				onCancel={handleCancel}
				className={classNames(
					styles['select-warehouse-modal'],
					warehouses.length > 4 && styles['check-all-bottom-modal'],
				)}>
				<CheckboxGroup
					value={checkedList}
					onChange={onChange}>
					{warehouses.map((item: any) => (
						<p key={item.warehouseId}>
							<span className='checkbox'>
								<Checkbox value={item.warehouseId} />
							</span>
							{item.warehouseName}
						</p>
					))}
				</CheckboxGroup>
				<p
					className={classNames(
						warehouses.length > 4 && 'check-all-bottom',
						warehouses.length === 4 && 'check-all',
					)}>
					<span className='checkbox'>
						<Checkbox
							indeterminate={indeterminate}
							onChange={onCheckAllChange}
							checked={checkAll}
						/>
					</span>
					-
				</p>
			</Modal>
		</>
	);
};

export default SelectWarehouseModal;
