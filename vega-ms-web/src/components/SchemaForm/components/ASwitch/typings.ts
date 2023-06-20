import type { SwitchProps } from 'antd';

export type ASwitchProps = SwitchProps & {
	onSwitchChange?: SwitchProps['onChange'];
	checked?: SwitchProps['checked'];
};
