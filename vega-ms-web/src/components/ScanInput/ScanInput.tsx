import type { InputProps } from 'antd';
import type { FC } from 'react';

import { ExclamationCircleFilled, ScanOutlined } from '@ant-design/icons';
import { Input, Popover } from 'antd';
import { useEffect, useState, useRef } from 'react';

/**
 * 对输入结果去重，防止扫码枪重复输入两次
 * @param {string} scanValue
 */
const removeRepeat = (scanValue: string) => {
	const val = scanValue.trim();
	if (!val || !scanValue) {
		return '';
	}
	const vl = [...new Set(val.split(' '))].filter((v) => !!v.trim()).join(' ');
	return vl;
};
// 此组件用于处理多段扫码、多段字符去重，
const ScanInput: FC<
	{
		onSubmit?: (value: string) => void;
		onChange?: (value: string) => void;
		immediate?: boolean; // 是否回车立即提交
	} & Omit<InputProps, 'onChange'>
> = ({ value, placeholder, onSubmit, onChange, immediate, ...props }) => {
	const [inputValue, setInputValue] = useState<string>(`${value}`);
	const [visible, setVisible] = useState<boolean>(false);
	const timerRef = useRef<NodeJS.Timeout | undefined>();
	const timeRef = useRef<number>(Date.now());
	const valRef = useRef<string>(`${value}`);
	const [inputId] = useState<number>(Date.now());
	const [ctrlPressed, setCtrlPressed] = useState(false);
	const [InputMode, setInputMode] = useState<boolean>(false);
	const [manualinputValue, setManualinputValue] = useState<string>(`${value}`);
	const scanerinputValue = useRef<string>(`${value}`);

	useEffect(() => {
		const val = `${['number', 'string', 'boolean'].includes(typeof value) ? value : ''}`;
		setInputValue(val);
		valRef.current = val;
	}, [value]);
	useEffect(() => {
		const input = document.querySelector(`#multipleScanInput_${inputId}`);
		const onCompositionstart = () => {
			setVisible(true);
		};
		input?.addEventListener('compositionstart', onCompositionstart);
		return () => {
			input && input.removeEventListener('compositionstart', onCompositionstart);
		};
	}, [inputId]);
	useEffect(() => {
		if (InputMode) {
			if (manualinputValue && scanerinputValue.current.indexOf(manualinputValue) !== -1) {
				let value =
					scanerinputValue.current.slice(0, manualinputValue.length) +
					' ' +
					scanerinputValue.current.slice(manualinputValue.length);
				setInputValue(value);
			}
		}
	}, [InputMode]);

	const handleChange: InputProps['onChange'] = (e) => {
		const val = InputMode ? removeRepeat(e.target.value.trim()) : e.target.value;
		setInputValue(val);
		valRef.current = val;

		if (typeof onChange === 'function') {
			onChange(val);
		}
	};

	const handleKeyDown: InputProps['onKeyDown'] = (e) => {
		let isValRef = false;

		setCtrlPressed(e.keyCode === 17);
		if (e.keyCode === 221 && ctrlPressed) {
			setInputValue((e.target as any).value + String.fromCharCode(29));
			setCtrlPressed(false);
		}
		if (
			e.keyCode !== 13 &&
			e.keyCode !== 37 &&
			e.keyCode !== 38 &&
			e.keyCode !== 39 &&
			e.keyCode !== 40 &&
			e.keyCode !== 8
		) {
			if (
				Date.now() - Number(timeRef.current) < 100 ||
				(e.ctrlKey === true && (e.key === 'v' || e.key === 'V'))
			) {
				isValRef = true;
				setInputMode(isValRef);
				scanerinputValue.current = (e.target as any).value;
			} else {
				isValRef = false;
				setManualinputValue((e.target as any).value);
				setInputMode(isValRef);
			}
			timeRef.current = Date.now();
		}

		if (![8, 13, 46].includes(e.keyCode)) {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
			timerRef.current = setTimeout(() => {
				const val = (e.target as any).value.trim();
				if (val && val.length >= valRef.current.length) {
					valRef.current = val + ' ';
					isValRef ? setInputValue(val + ' ') : setInputValue(val);
				}
			}, 100);
		}
	};
	const handlePressEnter: InputProps['onPressEnter'] = (e) => {
		// 回车立即提交
		const val = InputMode ? removeRepeat((e.target as any).value) : (e.target as any).value;
		if (immediate && val) {
			typeof onSubmit === 'function' && onSubmit(val);
			return;
		}

		const now = Date.now();
		// 回车与上一个keyDown相隔超过150毫秒则提交
		if (now - timeRef.current > 150 && val) {
			typeof onSubmit === 'function' && onSubmit(val);
		} else {
			// 回车则记录一次输入时间
			timeRef.current = now;
		}
	};

	return (
		<Popover
			content={
				<span>
					<ExclamationCircleFilled
						className='cl_FF9F00'
						style={{ marginRight: '4px' }}
					/>
					请切换至英文输入法
				</span>
			}
			visible={visible}
			placement='bottom'>
			<Input
				id={`multipleScanInput_${inputId}`}
				value={inputValue}
				onChange={async (event) => {
					if (!event.target.value) {
						setVisible(false);
					}
					handleChange(event);
				}}
				onBlur={() => setVisible(false)}
				placeholder={placeholder}
				onKeyDown={handleKeyDown}
				suffix={<ScanOutlined style={{ color: CONFIG_LESS['@c_body'] }} />}
				{...props}
				onPressEnter={handlePressEnter}
			/>
		</Popover>
	);
};

export default ScanInput;
