import { Badge, notification } from 'antd';
import React, { useState, useEffect } from 'react';
import { connect, ConnectProps, Link, history, useAccess } from 'umi';
import { ConnectState } from '@/models/connect';
import Avatar from './AvatarDropdown';
import HeaderSearch from '../HeaderSearch';
import styles from './index.less';
// import NoticeIconView from './NoticeIconView';
import api from '@/constants/api';
import request from '@/utils/request';
import styleCommon from '@/assets/style/common.less';
import messageConfig from './messageConfig';
import { LocalIcon } from '@/utils/utils';
import { doneStatus } from '@/constants/dictionary';
import { doBatchRead } from '@/services/message';
import defaultSettings from '@/../config/defaultSettings';

export type SiderTheme = 'light' | 'dark';

export interface GlobalHeaderRightProps extends Partial<ConnectProps> {
	theme?: SiderTheme;
	layout: 'sidemenu' | 'topmenu';
}

const GlobalHeaderRight: React.SFC<GlobalHeaderRightProps> = ({ ...props }) => {
	const access = useAccess();
	const [unreadNumber, setUnreadNumber] = useState(0);
	const appKey = sessionStorage.getItem('appKey') || '';
	const [num, setNum] = useState(0);
	const [port, setPort] = useState('8181');
	const { theme, layout } = props;
	let className = styles.right;

	if (theme === 'dark' && layout === 'topmenu') {
		className = `${styles.right}  ${styles.dark}`;
	}

	// 「查看详情」的点击回调
	const handleGoDetail = async (record: MessageController.ListRecord) => {
		const { msgContent, id, readOnly, status } = record;
		const { messageTypeStr, id: targetId, code } = msgContent || {};
		let msgConfig = messageConfig(messageTypeStr, false);
		let { path, state }: Record<string, any> = msgConfig;

		if (!code && (!targetId || targetId === 0)) {
			// 不支持查看详情
			return;
		}
		// 路由跳转到目标路径
		if (
			messageTypeStr === 'goods_request_commit' ||
			messageTypeStr === 'goods_request_refuse' ||
			messageTypeStr === 'goods_request_pass' ||
			messageTypeStr === 'warehouse_request_approval_review' ||
			messageTypeStr === 'goods_request_review_refuse' ||
			messageTypeStr === 'goods_request_review_pass'
		) {
			// 进入请领界面
			const str = `${readOnly ? true : false}/${messageTypeStr}`;
			history.push(`${path}/${targetId}/${str}`);
		} else {
			if (status && doneStatus.some((item) => item.value === status)) {
				path = msgConfig.searchPath;
			}
			if (state) {
				history.push({ pathname: `${path}/${targetId}/${readOnly ? true : false}`, state });
			} else {
				history.push(`${path}/${targetId}/${readOnly ? true : false}`);
			}
		}

		// 消息已读
		await doBatchRead({ ids: [id] });
		// 更新右上角消息角标的未读消息个数
		// getNewMsg();
	};

	const getMessage = async () => {
		if (window.location.pathname === '/user/login') {
			return;
		}
		const res = await request(api.message.getNewOne);
		if (res && res.code === 0) {
			setNum(num > 100 ? 0 : num + 1);
			const { message, unreadNum } = res.data || {};
			const { id, read, msgContent } = message || {};
			const { context, code } = msgContent || {};
			window.localStorage.setItem('unreadNum', unreadNum);
			setUnreadNumber(unreadNum);
			const unReadMsgIdStr = window.localStorage.getItem('unReadMsgIdStr');

			if (id && (!unReadMsgIdStr || (!read && !unReadMsgIdStr.includes(id)))) {
				window.localStorage.setItem('unReadMsgIdStr', `${unReadMsgIdStr};${id}`); // 缓存新消息
				notification.open({
					message: '新消息提醒',
					description: (
						<span>
							<span
								dangerouslySetInnerHTML={{ __html: code ? `${context}(${code})` : `${context}` }}
							/>
							{code && msgContent.id && (
								<span
									onClick={() => handleGoDetail(message)}
									style={{ color: defaultSettings.primaryColor, cursor: 'pointer' }}>
									查看详情
								</span>
							)}
						</span>
					),
				});
			}
		}
	};

	useEffect(() => {
		if (window.location.pathname === '/user/login' || API_NO_LOOP) {
			return;
		}
		setTimeout(() => getMessage(), 3000);
	}, [num]);

	useEffect(() => {
		getMessage();
		setPort(window.location?.port);
	}, []);
	return (
		<div className={className}>
			{access.global_search && (
				<HeaderSearch
					className={`${styles.action} ${styles.search}`}
					placeholder='搜索'
					defaultValue=''
					options={[]}
					onSearch={(value: string) => {
						console.log('input', value);
					}}
				/>
			)}
			{access.message_list && (
				<a
					onClick={() => {
						history.push('/message_list');
					}}
					className={styleCommon['nav-icon']}>
					<Badge
						count={unreadNumber}
						className={styleCommon.badge}
					/>
					<LocalIcon
						type='icon-notice1'
						className='cl_86899A'
					/>
				</a>
			)}
			{appKey && (
				<a
					href={
						OVERVIEW_ENV
							? `${window.location.origin}/${OVERVIEW_ENV}?appKey=${appKey}`
							: `http://192.168.10.199:${port === '8282' ? '7272' : '7171'}?appKey=${appKey}`
					}
					target='_blank'
					className={styleCommon['nav-icon']}>
					<LocalIcon
						type='icon-monitor'
						className='cl_86899A'
					/>
				</a>
			)}

			{/* <NoticeIconView /> */}
			<Avatar menu />
			{/* {REACT_APP_ENV && (
        <span>
          <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>
        </span>
      )} */}
			{/* <SelectLang className={styles.action} /> */}
		</div>
	);
};

export default connect(({ settings }: ConnectState) => ({
	theme: settings.navTheme,
	layout: settings.layout,
}))(GlobalHeaderRight);
