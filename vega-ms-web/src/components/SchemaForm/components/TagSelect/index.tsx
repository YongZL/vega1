import type { FC } from 'react';
import type { TagSelectProps, CheckableTagProps } from './typings';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tag } from 'antd';
import classNames from 'classnames';

const { CheckableTag } = Tag;

import './tagSelect.less';

const TagSelect: FC = <T extends any>(props: TagSelectProps<T>) => {
	const {
		options: currentOptions,
		defaultValue,
		value,
		multiple,
		checkAllText,
		onChange,
		onItemClick,
		cancelable,
		...rest
	} = props;
	const [checkedStatus, setCheckedStatus] = useState<boolean[]>([]);

	const [options, setOptions] = useState<CheckableTagProps[]>([]);

	useEffect(() => {
		const currentValue = value || defaultValue || [];
		let v: string[] = [];
		if (typeof currentValue === 'string') {
			v = (currentValue as string).split(',');
		} else {
			v = currentValue as string[];
		}
		if (multiple !== false || (multiple === false && v.length)) {
			setCheckedStatus(
				options.map((option) =>
					multiple === false
						? v.includes(String(option.value)) || false
						: v.includes(String(option.value)),
				),
			);
		}
	}, [value, defaultValue, options]);

	useEffect(() => {
		setOptions((currentOptions || []) as CheckableTagProps[]);
	}, [currentOptions]);

	const getValue = useCallback((checkedStatusList: boolean[], opts: CheckableTagProps[]) => {
		return multiple === false
			? checkedStatusList.length
				? (checkedStatusList[0] as any).value || (checkedStatusList[0] as any).text
				: undefined
			: opts
					.filter((_option, index: number) => checkedStatusList[index])
					.map((option) => option.value)
					.join(',');
	}, []);

	const checkedAll = useMemo(() => {
		const checkList = checkedStatus.filter((checked) => checked);
		return checkList.length > 0 && options.length > 0 && checkList.length === options.length;
	}, [options, checkedStatus]);

	const handleOnChange = useCallback(
		(vals: any[]) => {
			if (typeof onChange === 'function') {
				onChange(vals);
			}
		},
		[onChange],
	);

	const checkOptions = useMemo(() => {
		const handleItemClik = (
			e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
			option: CheckableTagProps,
			index: number,
		) => {
			// 单选模式处理
			if (multiple === false) {
				if (!cancelable) {
					if (checkedStatus[index]) {
						return;
					}
					setCheckedStatus(checkedStatus.filter((_e, i) => i === index));
					handleOnChange(option.value || option.text);
					return;
				}
				setCheckedStatus(
					checkedStatus.map((e, i) => (i === index ? !checkedStatus[index] : false)),
				);
				handleOnChange(checkedStatus[index] ? undefined : option.value || option.text);
				return;
			}

			const checked = !checkedStatus[index];
			const newCheckedStatus = [...checkedStatus];
			newCheckedStatus[index] = checked;
			setCheckedStatus(newCheckedStatus);
			handleOnChange(getValue(newCheckedStatus, options));

			if (typeof onItemClick === 'function') {
				onItemClick(e, option, checked);
			}
		};

		return options.map((option, index) => {
			const { render, ...itemOption } = option;
			return (
				<CheckableTag
					key={option.value}
					checked={checkedStatus[index]}
					onClick={(e) => handleItemClik(e, option, index)}>
					{typeof render === 'function'
						? render(itemOption)
						: itemOption.label || itemOption.text || itemOption.value}
				</CheckableTag>
			);
		});
	}, [options, multiple, checkedStatus, handleOnChange, getValue, onItemClick]);

	const handleCheckAll = () => {
		const val = checkedStatus.map(() => !checkedAll);
		setCheckedStatus(val);
		handleOnChange(getValue(val, options));
	};

	return (
		<>
			<div
				{...rest}
				className={classNames('tag-select-container', rest.className)}>
				{multiple !== false && (
					<CheckableTag
						key='tag-select-checked-all'
						checked={checkedAll}
						onClick={handleCheckAll}>
						{checkAllText || '全部'}
					</CheckableTag>
				)}
				{checkOptions}
			</div>
		</>
	);
};

export default TagSelect;
