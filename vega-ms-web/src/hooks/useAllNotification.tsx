import { useEffect, useState } from 'react';
import request from '@/utils/request';
import api from '@/constants/api';

/**
 *
 * 获取页面通知提示
 */
const useAllNotification = () => {
	const [notification, setNotification] = useState('');
	useEffect(() => {
		request(api.message.getNewMsg).then((res: any) => {
			if (res && res.code === 0) setNotification(res.data && res.data.msgValue);
		});
	}, []);
	return notification;
};
export default useAllNotification;
