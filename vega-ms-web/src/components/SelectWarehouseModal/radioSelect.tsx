import type { InputProps } from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';

import { Button, Input, Modal, notification } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import styles from './radioSelect.less';

const SelectWarehouseModal: React.FC<{ onFinish?: () => void; isChange?: boolean }> = ({
	onFinish,
	isChange,
}) => {
	const [checkedList, setCheckedList] = React.useState<CheckboxValueType[]>([]);
	const [filterList, setFilterList] = React.useState<
		ScanCountReportController.DepartmentAndWarehouseRecord[]
	>([]);
	const [value, setValue] = React.useState<string>('');
	const [visible, setVisible] = useState<boolean>(true);
	const { byUserWarehouses, saveConsumeWarehouses } = useModel('scanConsumeReport');

	// 点击弹出确认
	const handleOk = async (checkedList: number[]) => {
		if (checkedList.length < 1) {
			notification.error({
				message: '请选择仓库！',
			});
			return;
		}
		const warehouse = (byUserWarehouses || []).filter(
			(item) => item.warehouseId === checkedList[0],
		);
		sessionStorage.setItem('consumeWarehouse', JSON.stringify(warehouse[0] || {}));
		await saveConsumeWarehouses(warehouse[0]);
		setVisible(false);
		if (typeof onFinish === 'function') {
			onFinish();
		}
	};

	// 点击弹出取消或关闭
	const handleCancel = () => {
		setCheckedList([]);
		setVisible(false);
		// 当前页切换不用返回上一级
		if (!isChange) {
			history.goBack();
		} else {
			if (typeof onFinish === 'function') {
				onFinish();
			}
		}
	};

	const handleClick = (id: number) => {
		setCheckedList([id]);
		setTimeout(() => {
			handleOk([id]);
		}, 200);
	};

	const handleChange: InputProps['onChange'] = (e) => {
		setValue(e.target.value);
	};

	useEffect(() => {
		const val = value.trim();
		if (val) {
			setFilterList((byUserWarehouses || []).filter((item) => item.warehouseName.includes(val)));
		} else {
			setFilterList([...byUserWarehouses]);
		}
	}, [value, checkedList]);

	return (
		<>
			<Modal
				title='选择仓库'
				width={400}
				centered={true}
				mask={false}
				maskClosable={false}
				visible={visible}
				// onOk={handleOk}
				onCancel={handleCancel}
				className={classNames(
					styles['single-select-warehouse-modal'],
					'single-select-warehouse-modal',
				)}
				footer={false}
				// footer={[
				// 	<Button onClick={handleCancel}>取消</Button>,
				// 	<Button
				// 		type='primary'
				// 		onClick={handleOk}>
				// 		确认
				// 	</Button>,
				// ]}
			>
				<div className='search-container'>
					<Input
						placeholder='请输入'
						style={{ width: '100%' }}
						value={value}
						onChange={handleChange}
						allowClear
					/>
				</div>
				<div className='select-list'>
					{filterList.map((item: any) => (
						<p
							className={(checkedList.includes(item.warehouseId) && 'selected') || ''}
							key={item.warehouseId}
							onClick={() => handleClick(item.warehouseId)}>
							{item.warehouseName}
						</p>
					))}
				</div>
			</Modal>
		</>
	);
};

export default SelectWarehouseModal;
