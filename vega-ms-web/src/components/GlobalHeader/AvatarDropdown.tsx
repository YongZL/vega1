import { LogoutOutlined, SettingOutlined, SwapOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin } from 'antd';
import { MenuClickEventHandler } from 'rc-menu/es/interface';
import React from 'react';
import { history, ConnectProps, connect } from 'umi';
import { ConnectState } from '@/models/connect';

import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import iconAvatar from '@/assets/images/headerImg.png';
import { getUrl } from '@/utils/utils';

export interface GlobalHeaderRightProps extends Partial<ConnectProps> {
	currentUser: Partial<LoginWebController.User>;
	menu?: boolean;
}

const MenuItem = Menu.Item;

@connect(({ user }: ConnectState) => ({
	currentUser: user.currentUser || {},
}))
class AvatarDropdown extends React.Component<GlobalHeaderRightProps> {
	onMenuClick: MenuClickEventHandler = (event) => {
		const { key } = event;
		if (key === 'logout') {
			const { dispatch } = this.props;
			if (dispatch) {
				dispatch({
					type: 'user/logout',
				});
			}
			return;
		}
		history.push(key);
	};

	render(): React.ReactNode {
		const {
			currentUser: { name, profileImg, hospitals = [] },
			menu,
		} = this.props;
		const menuHeaderDropdown = (
			<Menu
				className={styles.menu}
				selectedKeys={[]}
				onClick={this.onMenuClick}>
				{menu && (
					<MenuItem key='/account/changePassword'>
						<SettingOutlined />
						修改密码
					</MenuItem>
				)}
				{menu && hospitals.length > 1 && (
					<MenuItem key='/user/hospital'>
						<SwapOutlined />
						选择医院
					</MenuItem>
				)}
				{menu && <Menu.Divider />}
				<MenuItem key='logout'>
					<LogoutOutlined />
					退出登录
				</MenuItem>
			</Menu>
		);

		return name ? (
			<HeaderDropdown
				overlay={menuHeaderDropdown}
				trigger={['click']}>
				<span className={`${styles.action} ${styles.account}`}>
					<Avatar
						size='small'
						className={styles.avatar}
						src={profileImg ? `${getUrl()}${profileImg}` : iconAvatar}
						alt='avatar'
					/>
					<span className={styles.name}>{name}</span>
				</span>
			</HeaderDropdown>
		) : (
			<span className={`${styles.action} ${styles.account}`}>
				<Spin
					size='small'
					style={{
						marginLeft: 8,
						marginRight: 8,
					}}
				/>
			</span>
		);
	}
}

export default AvatarDropdown;
