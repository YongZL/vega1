import { Button, Result } from 'antd';
import React from 'react';
import { history } from 'umi';

const NoFoundPage: React.FC<{}> = () => (
	<Result
		status='404'
		title='404'
		subTitle='抱歉，您查看的页面不存在！'
		extra={
			<Button
				type='primary'
				onClick={() => history.push(sessionStorage.getItem('homePage') || '/')}>
				回到首页
			</Button>
		}
	/>
);

export default NoFoundPage;
