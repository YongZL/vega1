import { MenuDataItem, getMenuData, getPageTitle } from '@ant-design/pro-layout';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useIntl, ConnectProps, connect } from 'umi';
import React, { useEffect, useState } from 'react';
import { ConnectState } from '@/models/connect';

export interface UserLayoutProps extends Partial<ConnectProps> {
	breadcrumbNameMap: {
		[path: string]: MenuDataItem;
	};
}

const UserLayout: React.FC<UserLayoutProps> = (props) => {
	const {
		route = {
			routes: [],
		},
	} = props;
	const { routes = [] } = route;
	const {
		children,
		location = {
			pathname: '',
		},
	} = props;
	const { formatMessage } = useIntl();
	const { breadcrumb } = getMenuData(routes);
	const title = getPageTitle({
		pathname: location.pathname,
		formatMessage,
		breadcrumb,
		...props,
	});
	const [newTitle, setNewTitle] = useState('Insight管理平台');
	useEffect(() => {
		setNewTitle(title);
	}, [title]);
	return (
		<HelmetProvider>
			<Helmet>
				<title>{newTitle}</title>
				<meta
					name='description'
					content={newTitle}
				/>
			</Helmet>
			{children}
		</HelmetProvider>
	);
};

export default connect(({ settings }: ConnectState) => ({ ...settings }))(UserLayout);
