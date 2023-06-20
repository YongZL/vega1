import { Switch } from 'antd';
import type { FC } from 'react';
import type { ASwitchProps } from './typings';

const ASwitch: FC<ASwitchProps> = ({ onSwitchChange, onChange, checked, ...props }) => {
	const handleChange: ASwitchProps['onChange'] = (...rest) => {
		if (typeof onChange === 'function') {
			onChange(...rest);
		}
		if (typeof onSwitchChange === 'function') {
			onSwitchChange(...rest);
		}
	};
	delete props.style;

	return (
		<Switch
			style={{ float: 'right' }}
			{...props}
			onChange={handleChange}
			checked={checked}
		/>
	);
};

export default ASwitch;
