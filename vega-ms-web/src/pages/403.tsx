import { Button, Result } from 'antd';
import React from 'react';
import { history } from 'umi';

const NoAuthPage: React.FC<{}> = () => (
	<Result
		status='403'
		title='403'
		subTitle='抱歉，您暂无权限查看该页面！'
		extra={
			<Button
				type='primary'
				onClick={() => history.push('/user/login')}>
				去登录
			</Button>
		}
	/>
);

export default NoAuthPage;
