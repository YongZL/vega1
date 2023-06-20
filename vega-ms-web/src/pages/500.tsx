import { Link } from 'umi';
import { Result, Button } from 'antd';
import React from 'react';

export default () => (
	<Result
		status='500'
		title='500'
		style={{
			background: 'none',
		}}
		subTitle='抱歉,您的网络发生异常，无法连接服务器'
		// extra={
		//   <Link to="/">
		//     <Button type="primary">Back Home</Button>
		//   </Link>
		// }
	/>
);
