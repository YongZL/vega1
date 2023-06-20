import type { RangeSelectProps } from './typings';
import type { CascaderProps } from 'antd';

import { useState, useMemo, useCallback } from 'react';
import { Select, Cascader } from 'antd';
import classNames from 'classnames';

import './rangeSelect.less';

const RangeSelect = <T extends Record<string, any>>({
	className,
	onChange,
	request,
	style,
	...props
}: RangeSelectProps<T>) => {
	const { options = [] } = props.selectProps || {};
	const [cascaderMap, setCascaderMap] = useState<Record<string, CascaderProps<T>['options']>>({});
	const [cascaderOptions, setCascaderOptions] = useState<CascaderProps<T>['options']>([]);
	const [value, setValue] = useState<number | null>();
	const [cascaderValue, setCascaderValue] = useState<string[]>();
	const [disabled, setDisabled] = useState<boolean>(true);
	const getCascaderData = useCallback(
		async (val: number) => {
			if (cascaderMap[val]) {
				return;
			}
			if (typeof request === 'function') {
				try {
					const res = await request(val);
					// 缓存已请求数据
					setCascaderMap({ ...cascaderMap, [val]: res });
					setCascaderOptions(res);
					setDisabled(false);
				} catch (e) {}
			}
		},
		[request, cascaderMap],
	);

	const handleSelectChange = useCallback(
		(val: number) => {
			if (val) {
				const option = options.find((item) => item.value === value);
				if (!cascaderMap[val]) {
					if (
						!option ||
						!option.children ||
						!Array.isArray(option.children) ||
						!option.children.length
					) {
						setDisabled(true);
						getCascaderData(val);
					} else {
						setDisabled(false);
						setCascaderOptions(option.children as CascaderProps<T>['options']);
						setCascaderMap({ ...cascaderMap, [val]: option.children });
					}
				} else {
					setDisabled(false);
					setCascaderOptions(cascaderMap[val]);
				}
			} else {
				setDisabled(false);
			}
			setValue(val);
			if (typeof onChange === 'function') {
				onChange({
					select: val,
					cascader: cascaderValue,
				});
			}
		},
		[cascaderMap, cascaderValue, getCascaderData, onChange, options, value],
	);
	const handleCascaderChange = useCallback(
		(val: any[]) => {
			setCascaderValue(val);
			if (typeof onChange === 'function') {
				onChange({
					select: value,
					cascader: val,
				});
			}
		},
		[onChange, value],
	);

	const selectProps = useMemo(() => {
		return {
			placeholder: (props.selectProps || {}).placeholder || '请选择',
			...(props.selectProps || {}),
		};
	}, [props.selectProps]);

	const cascaderProps = useMemo(() => {
		return {
			placeholder: !disabled || !(cascaderOptions || []).length ? '请先选择父级' : '请选择',
			...(props.cascaderProps || {}),
		};
	}, [props.cascaderProps, disabled, cascaderOptions]);

	return (
		<div
			className={classNames('range-select-container', className)}
			style={style}>
			<Select
				{...selectProps}
				options={options}
				value={value}
				style={{ width: '100px' }}
				onChange={handleSelectChange}
			/>
			<Cascader<T>
				{...cascaderProps}
				disabled={disabled}
				value={cascaderValue}
				onChange={handleCascaderChange}
				options={cascaderOptions}
			/>
		</div>
	);
};

export default RangeSelect;
