import type { CascaderProps } from 'antd/es/cascader';
import type { DefaultOptionType } from 'rc-cascader';
import type { SingleValueType } from 'rc-cascader/es/Cascader';
import type { FC } from 'react';

import React, { useState, useEffect } from 'react';
import request from '@/utils/request';
import { Cascader } from 'antd';

enum Keys {
	value = 'value',
	label = 'label',
}

export interface Option {
	label?: string;
	value?: any;
	key?: string;
	loading?: boolean;
	children?: Option[];
	[key: string]: any;
}

export type CascaderSelectProps<T = Option> = CascaderProps<T> & {
	loadUrl: string; // 查询请求的url
	loadParams: string; // 查询时的参数关键字 如 departmentid
	childKeyMaps?: { [key in Keys]: string }; // 字段对照，格式化查询返回的数字数据为cascader可用数据格式
	updateOptions?: (options: Option[]) => void;
};

const CascaderSelect: FC<CascaderSelectProps> = (props) => {
	const [options, setOptions] = useState<Option[] | undefined>([]);
	const [childKeyMaps, setChildKeyMaps] = useState<{ [key in Keys]: string }>({
		value: 'id',
		label: 'name',
	});

	useEffect(() => {
		setOptions(props.options);
	}, [props.options]);

	useEffect(() => {
		if (props.childKeyMaps) setChildKeyMaps(props.childKeyMaps);
	}, [props.childKeyMaps]);

	const onChange = (value: SingleValueType, selectedOptions: DefaultOptionType[]) => {
		const { onChange } = props;
		if (typeof onChange === 'function') {
			onChange(
				value as SingleValueType & SingleValueType[],
				selectedOptions as DefaultOptionType[] & DefaultOptionType[][],
			);
		}
	};

	const loadData = async (selectedOptions?: DefaultOptionType[]) => {
		if (!selectedOptions) return;
		const { loadUrl, loadParams } = props;
		const targetOption = selectedOptions[selectedOptions.length - 1];
		targetOption.loading = true;
		const res = await request(loadUrl, {
			params: { [loadParams]: targetOption.value },
		});
		const childrenList = res.data;
		targetOption.loading = false;
		targetOption.children = childrenList.map((item: any) => {
			let obj = {};
			for (let key in childKeyMaps) {
				obj[key] = item[childKeyMaps[key]];
			}
			return obj;
		});
		setOptions([...(options || [])]);
		if (typeof props.updateOptions === 'function') {
			props.updateOptions([...(options || [])]);
		}
	};

	return (
		<Cascader
			loadData={loadData}
			options={options}
			onChange={onChange}
			changeOnSelect
			showSearch
		/>
	);
};
export default CascaderSelect;
