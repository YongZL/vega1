/**
 * 科室选择器
 */

import api from '@/constants/api';
import request from '@/utils/request';
import { Select } from 'antd';
import React, { useEffect, useState } from 'react';

/**
 *
 * @param {boolean} shouldShowAllOption 是否需要有一个全部的选项（目前是只有「服务商」和「设备科」会有这个选项）
 */
const useDepartmentFilter = ({ shouldShowAllOption = false }) => {
	const [departmentList, setDepartmentList] = useState([]);
	const [id, setId] = useState(null);
	const [name, setName] = useState('');

	useEffect(() => {
		const getDepartmentList = async () => {
			const res = await request(api.departments.departmentList);
			const list =
				res && res.data.length > 0
					? res.data.map((e) => ({ name: e.departmentName, id: e.departmentId }))
					: [];

			const theOne = list.length > 0 ? list[0] : {};
			const idNew = shouldShowAllOption ? -1 : theOne.id;
			const nameNew = shouldShowAllOption ? '全院' : theOne.name;

			setDepartmentList(list);
			setId(idNew);
			setName(nameNew);
		};

		getDepartmentList();
	}, [shouldShowAllOption]);

	function getNameByID(id) {
		if (id === -1) {
			return '全院';
		}
		const theOne = departmentList.length > 0 && departmentList.find((e) => e.id === id);
		return theOne.name;
	}

	const handleChange = (id) => {
		setId(id);
		setName(getNameByID(id));
	};

	const optionList =
		departmentList.length > 0 &&
		departmentList.map((department) => {
			return (
				<Select.Option
					value={department.id}
					key={department.id}>
					{department.name}
				</Select.Option>
			);
		});

	const UI = () => (
		<Select
			showSearch
			getPopupContainer={(node) => node.parentNode}
			filterOption={(input, option) =>
				option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
			}
			value={id}
			style={{ width: 120, marginRight: 17 }}
			onChange={handleChange}>
			{shouldShowAllOption && <Select.Option value={-1}>全院</Select.Option>}
			{optionList}
		</Select>
	);

	return [UI, { name, id }];
};

export default useDepartmentFilter;
