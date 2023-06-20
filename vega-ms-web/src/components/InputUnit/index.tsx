import type { InputProps } from 'antd';
import { Input } from 'antd';
import type { ChangeEvent, FC } from 'react';
import { useEffect, useState } from 'react';
import style from './index.less';

type changeEvent = (e: number | string) => void;

type IProps = Omit<InputProps, 'max' | 'min' | 'onChange' | 'defaultValue' | 'value'> & {
	max?: number;
	min?: number;
	onChange: changeEvent;
	defaultValue?: number;
	value?: number;
	unit?: string;
	preUnit?: string;
	disabled?: boolean;
};

const InputUnit: FC<IProps> = ({
	value = '',
	placeholder,
	onChange,
	allowClear,
	disabled,
	defaultValue,
	min: prevMin,
	max,
	unit,
	preUnit,
	...props
}) => {
	const [min, setMin] = useState<number>(prevMin || 0);
	const [inputValue, setInputValue] = useState<string>(`${value}`);
	const inputReg = /\D/g;

	useEffect(() => {
		if (value) {
			setInputValue(`${value}`);
		}
	}, [value]);

	// 设置最小值
	useEffect(() => {
		if (defaultValue) {
			setMin(
				typeof prevMin === 'number' && !Number.isNaN(prevMin)
					? prevMin
					: defaultValue >= 0
					? 1
					: -1,
			);
		}
	}, [defaultValue, prevMin]);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		e.stopPropagation();
		e.isPropagationStopped();

		let v = e.target.value.trim();
		if (v.length > 0) {
			// 最小值小于0并且以-开始，把后面的非数字字符删除

			if (min < 0 && v.startsWith('-')) {
				v = `-${v.replace(inputReg, '')}`;
			} else {
				v = v.replace(inputReg, '');
			}
		}

		if (v === '' && allowClear) {
			setInputValue(v);
			return;
		}
		setInputValue(v);
		onChange(Number(v));
	};

	const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
		let v: string | number = e.target.value.trim();
		if (!defaultValue && !inputValue) {
			onChange('');
			return;
		}
		if (v === '' && allowClear) {
			setInputValue(v);
			onChange(-1);
			return;
		}
		if (v === '') {
			v = min < 0 ? -1 : 1;
			setInputValue(`${v}`);
			onChange(v);
			return;
		}
		v = Number(v);
		if (max && v > max) {
			v = max;
		}
		if (min && v < min) {
			v = min;
		}
		setInputValue(`${v}`);
		onChange(v);
	};

	return (
		<Input
			className={style.inputUnit}
			value={inputValue}
			onChange={handleChange}
			maxLength={Math.max(String(max).length, String(min).length, String(defaultValue).length)}
			placeholder={placeholder}
			disabled={disabled}
			prefix={preUnit}
			suffix={unit}
			defaultValue={defaultValue}
			max={max}
			min={min}
			{...props}
			onBlur={handleBlur}
		/>
	);
};

export default InputUnit;
