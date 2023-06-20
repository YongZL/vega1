import type { InputProps } from 'antd';
import type { FC } from 'react';

import useDebounce from '@/hooks/useDebounce'; // 延迟-- loadash不可用
import { ExclamationCircleFilled, ScanOutlined } from '@ant-design/icons';
import { Input, Popover } from 'antd';
import { useEffect, useState } from 'react';

/**
 * 对输入结果去重，防止扫码枪重复输入两次
 * @param {输入结果} value
 */
const removeRepeat = (scanValue: string) => {
	const { length } = scanValue;
	const index = length / 2;
	const beforeString = scanValue.slice(0, index);
	const afterString = scanValue.slice(index, length);
	if (beforeString === afterString) {
		scanValue = beforeString;
	}
	return scanValue;
};

const ScanInput: FC<
	{
		onSubmit: (value: string) => void;
		onChange: (value: string) => void;
		forbiddenPressEnter?: boolean;
	} & Omit<InputProps, 'onChange'>
> = ({ value, placeholder, onSubmit, onPressEnter, onChange, forbiddenPressEnter, ...props }) => {
	const [inputValue, setInputValue] = useState<string>(`${value}`);
	const [visible, setVisible] = useState(false);
	const [scanType, setScanType] = useState(false);
	const [lastTime, setLastTime] = useState<number | undefined>();
	const [ctrlPressed, setCtrlPressed] = useState(false);

	useEffect(() => {
		setInputValue(`${value !== undefined && value !== null ? value : ''}`);
	}, [value]);

	useEffect(() => {
		const show = document.getElementById('scan_show');
		const onCompositionstart = () => {
			setVisible(true);
		};
		show?.addEventListener('compositionstart', onCompositionstart);
		return () => {
			show && show.removeEventListener('compositionstart', onCompositionstart);
		};
	}, []);

	const debouncedSearchTerm = useDebounce(inputValue, 500);
	useEffect(() => {
		if (debouncedSearchTerm) {
			if (inputValue && scanType) {
				const val = removeRepeat(inputValue).toUpperCase().trim();
				setInputValue(val);
				if (forbiddenPressEnter) {
					onSubmit(val);
				}
			}
		}
	}, [debouncedSearchTerm]);

	const handleChange: InputProps['onChange'] = (e) => {
		const value = e.target.value.trim();
		const nextTime = new Date().getTime();
		if (nextTime && lastTime && nextTime - lastTime <= 100 && inputValue.length < value.length) {
			setScanType(true);
		} else {
			setScanType(false);
		}
		setLastTime(nextTime);
		setInputValue(value);
		if (typeof onChange === 'function') {
			onChange(removeRepeat(value));
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
				id='scan_show'
				value={inputValue}
				onChange={async (event) => {
					if (!event.target.value) {
						setVisible(false);
					}
					handleChange(event);
				}}
				onBlur={() => setVisible(false)}
				placeholder={placeholder}
				onPressEnter={(e) => onSubmit((e.target as any).value)}
				onKeyDown={async (event) => {
					setCtrlPressed(event.keyCode === 17); // ctrl
					/**
					 *  ctrl+] 等于ASCII码分隔符 参考https://wenku.baidu.com/view/355b1b1d0875f46527d3240c844769eae109a391.html?fr=search
					 * https://stackoverflow.com/questions/48296955/ascii-control-character-html-input-text
					 *
					 */
					if (event.keyCode === 221 && ctrlPressed) {
						setInputValue((event.target as any).value + String.fromCharCode(29));
						setCtrlPressed(false);
					}
				}}
				suffix={<ScanOutlined style={{ color: CONFIG_LESS['@c_body'] }} />}
				{...props}
			/>
		</Popover>
	);
};

export default ScanInput;
