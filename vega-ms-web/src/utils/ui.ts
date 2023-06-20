import type { ArgsProps } from 'antd/es/notification';

import { notification as notificationComp } from 'antd';
import { typeOf } from './index';

export interface NotificationApi {
	success: (args: string | ArgsProps) => void;
	error: (args: string | ArgsProps) => void;
	info: (args: string | ArgsProps) => void;
	warning: (args: string | ArgsProps) => void;
	open: (args: string | ArgsProps) => void;
	warn: (args: string | ArgsProps) => void;
	close: (key: string) => void;
	destroy: () => void;
}

notificationComp.config({
	placement: 'topRight',
	top: 10,
	duration: 3,
});

const notification = {} as NotificationApi;
['success', 'error', 'info', 'warning', 'warn', 'open', 'close', 'destroy'].forEach((key) => {
	if (key === 'destroy') {
		notification[key] = notificationComp[key];
	} else if (key === 'close') {
		notification[key] = (k: string) => notificationComp[key](k);
	} else {
		notification[key] = (msg: string | ArgsProps) => {
			const options = (typeOf(msg) === 'object' ? msg : { message: msg }) as ArgsProps;
			return notificationComp[key](options);
		};
	}
});

export { notification };
