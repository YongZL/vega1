import React, { useCallback, useEffect, useState } from 'react';
import request from '@/utils/request';
import { transformSBCtoDBC } from '@/utils';
import { Col, DatePicker, Form, Input, Radio, Select, Row } from 'antd';
import { debounce } from 'lodash';
import TagSelect from '@/components/TagSelect';
import DatePickerMore from '@/components/DatePickerMore';

import {
	searchFormItem4,
	searchFormItemSingle6,
	searchFormItemSingle4,
	searchFormItem6,
} from '@/constants/formLayout';

const FormItem = Form.Item;
const label = (label: string) => {
	let len = label.length;
	let width = len < 4 ? 64 : len * 16;
	return (
		<div
			className='labelEle'
			style={{ width: width, minWidth: width }}>
			{label}
			<span></span>
		</div>
	);
};

// 单行选择
export const SingleSelect = ({ props, searchStatus = undefined }) => {
	// const formItem = props.label.length > 4 ? searchFormItemSingle6 : searchFormItemSingle4;
	return (
		<Col
			span={12}
			style={{ width: '100%' }}>
			<FormItem
				name={props.field}
				label={label(props.label)}
				initialValue={searchStatus ? searchStatus.split(',') : []}>
				<TagSelect>
					{props.options.map((item) => {
						return (
							<TagSelect.Option
								key={item.key}
								value={item.key}>
								{item.value}
							</TagSelect.Option>
						);
					})}
				</TagSelect>
			</FormItem>
		</Col>
	);
};

// 输入
export const SearchInput = ({ props, className = '' }) => {
	// const formItem = props.label.length > 4 ? searchFormItem6 : searchFormItem4;
	return (
		<Col
			span={8}
			className={className}>
			<FormItem
				label={label(props.label)}
				name={props.field}
				rules={[{ required: props.required, message: '请输入' }]}>
				<Input
					maxLength={30}
					placeholder='请输入'
					allowClear
				/>
			</FormItem>
		</Col>
	);
};

// 下拉枚举
export const EnumSelect = ({ props, className = '' }) => {
	// const initValue = props.options.some((item: any) => item.key === searchStatus);
	const formItem = props.label.length > 4 ? searchFormItem6 : searchFormItem4;
	return (
		<Col
			span={8}
			className={className}>
			<FormItem
				name={props.field}
				label={label(props.label)}
				rules={[{ required: props.required, message: '请选择' }]}
				// initialValue={initValue ? String(searchStatus) : undefined}
			>
				<Select
					style={{ width: '100%' }}
					placeholder='请选择'
					allowClear
					showArrow
					multiple={props.multiValue}>
					{props.options.map((item: any) => {
						return (
							<Select.Option
								key={item.key}
								value={item.key}>
								{item.value}
							</Select.Option>
						);
					})}
				</Select>
				{/* )} */}
			</FormItem>
		</Col>
	);
};

// 单选
export const SearchRedio = ({ props, className = '' }) => {
	return (
		<Col
			span={16}
			className={className}>
			<FormItem
				label={label(props.label)}
				name={props.field}
				rules={[{ required: props.required, message: '请选择' }]}>
				<Radio.Group>
					{props.options.map((item) => {
						return (
							<Radio
								key={item.key}
								value={item.key}>
								{item.value}
							</Radio>
						);
					})}
				</Radio.Group>
			</FormItem>
		</Col>
	);
};

// 下拉搜索
export const SearchSelect = ({ props, form, className = '' }) => {
	const [list, setList] = useState([]);
	const getDate = async () => {
		let params = {};
		if (props.pageSize) {
			params = transformSBCtoDBC(
				Object.assign({ pageSize: props.pageSize, pageNum: 0 }, { ...params }),
			);
		}
		const res = await request(props.optionUrl, params);
		if (res && res.code === 0) {
			const data = res.data.rows ? res.data.rows : res.data;
			setList(data);
		}
	};
	useEffect(() => {
		getDate();
	}, []);
	return (
		<Col
			span={8}
			className={className}>
			<FormItem
				label={label(props.label)}
				name={props.field}
				rules={[{ required: props.required, message: '请选择' }]}>
				<Select
					style={{ width: '100%' }}
					placeholder='请选择'
					showSearch
					allowClear
					showArrow
					multiple={props.multiValue}
					getPopupContainer={(node) => node.parentNode}
					filterOption={(input, option) =>
						option.props.children.toLowerCase().indexOf(transformSBCtoDBC(input).toLowerCase()) >= 0
					}
					onChange={() => (props.children ? form.resetFields(props.children) : null)}>
					{list.map((item, index) => (
						<Select.Option
							key={index}
							value={item[props.optionValue]}>
							{item[props.optionKey]}
						</Select.Option>
					))}
				</Select>
			</FormItem>
		</Col>
	);
};

export const BackendSearchSelect = ({ form, props, className = '' }) => {
	const [list, setList] = useState([]);
	// const formItem = props.label.length > 4 ? searchFormItem6 : searchFormItem4;
	const getDate = async (key = null) => {
		let params = {};
		// 级联
		if (props.cascadeCondition) {
			params = Object.assign(
				{ [props.cascadeField]: form.getFieldValue(props.cascadeCondition) },
				{ ...params },
			);
			form.setFieldsValue({ [props.field]: undefined });
			setList([]);
		}
		if (props.cascadeCondition && !form.getFieldValue(props.cascadeCondition)) {
			return;
		}
		// 关键字
		if (props.keyword) {
			params = Object.assign({ [props.keyword]: key }, { ...params });
		}
		// 分页
		if (props.pageSize) {
			params = Object.assign({ pageSize: props.pageSize, pageNum: 0 }, { ...params });
		}
		params = transformSBCtoDBC(params);
		const res = await request(props.optionUrl, { params });
		if (res && res.code === 0) {
			const data = res.data.rows ? res.data.rows : res.data;
			setList([...data]);
		}
	};
	// 防抖
	const delayedQuery = useCallback(
		debounce((val) => getDate(val), 800),
		[],
	);
	useEffect(() => {
		getDate();
	}, [props.cascadeCondition && form.getFieldValue(props.cascadeCondition)]);
	return (
		<Col span={8}>
			<FormItem
				label={label(props.label)}
				name={props.field}
				rules={[{ required: props.required, message: '请选择' }]}>
				<Select
					style={{ width: '100%' }}
					placeholder='请选择'
					showSearch
					allowClear
					multiple={props.multiValue}
					getPopupContainer={(node) => node.parentNode}
					onSearch={(val) => delayedQuery(transformSBCtoDBC(val))}
					onFocus={() => getDate()}
					filterOption={false}
					onChange={() => (props.children ? form.resetFields(props.children) : null)}>
					{list.map((item) => {
						return (
							<Select.Option
								key={item[props.optionValue]}
								value={item[props.optionValue]}>
								{item[props.optionKey]}
							</Select.Option>
						);
					})}
				</Select>
			</FormItem>
		</Col>
	);
};

// 时间范围(快捷键)
export const DateRange = ({ props, className = '' }) => {
	const formItem = props.label.length > 4 ? searchFormItemSingle6 : searchFormItemSingle4;
	const searchWidth = document.getElementsByClassName('custom-table-query-box')[0]?.clientWidth;
	console.log();
	return (
		// <Row style={{ width: '100%' }} className={className}>
		<Col span={24}>
			<FormItem
				name={props.field}
				label={label(props.label)}
				rules={[{ required: props.required, message: '请选择' }]}>
				<DatePickerMore
					format={props.formatter}
					DatePickerWidth={searchWidth / 3 - 162}
				/>
			</FormItem>
		</Col>
		// </Row>
	);
};

// 时间范围
export const DateRangePicker = ({ props, className = '' }) => {
	const formItem = props.label.length > 4 ? searchFormItem6 : searchFormItem4;
	return (
		<Row className={className}>
			<FormItem
				name={props.field}
				label={label(props.label)}
				rules={[{ required: props.required, message: '请选择' }]}>
				<DatePicker.RangePicker
					format={props.formatter}
					style={{ width: '100%' }}
				/>
			</FormItem>
		</Row>
	);
};

// 时间
export const DateSingle = ({ form, props, className = '' }) => {
	const formItem = props.label.length > 4 ? searchFormItem6 : searchFormItem4;
	return (
		<Col
			span={8}
			className={className}>
			<FormItem
				label={label(props.label)}
				name={props.field}
				rules={[{ required: props.required, message: '请选择' }]}>
				<DatePicker
					format={props.formatter}
					getCalendarContainer={(node) => node.parentNode}
				/>
			</FormItem>
		</Col>
	);
};
