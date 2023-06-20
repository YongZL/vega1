import { invoiceSync } from '@/constants';
import { Select } from 'antd';
import React from 'react';

const SelectInvoiceSync = ({
	onChange = () => {},
	isShowDel = true,
	defaultValue = '请选择',
	placeholder = '选择是否货票同行',
}) => {
	return (
		<Select
			allowClear={isShowDel}
			defaultValue={defaultValue}
			placeholder={placeholder}
			onChange={onChange}>
			{invoiceSync.map((item: any) => {
				return (
					<Select.Option
						value={item.value}
						key={item.value}>
						{item.label}
					</Select.Option>
				);
			})}
		</Select>
	);
};

export default SelectInvoiceSync;
