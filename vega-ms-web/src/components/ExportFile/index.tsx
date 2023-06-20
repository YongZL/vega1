import type { ButtonProps, PopconfirmProps } from 'antd';
import type { FC } from 'react';

import defaultSettings from '@/../config/defaultSettings';
import api from '@/constants/api';
import request from '@/utils/request';
import { getUrl } from '@/utils/utils';
import { Badge, Button, Popconfirm } from 'antd';
import { useEffect, useState } from 'react';

const ExportFile: FC<
	{
		data: {
			filters: Record<string, any>;
			link: string;
			method?: string;
			getForm?: () => Record<string, any>;
			keys?: any[];
			type?: string;
		};
	} & ButtonProps
> = (props) => {
	const { filters, link, method = 'GET', getForm = null, keys = [], type = null } = props.data;
	const [params, setParams] = useState({});
	useEffect(() => {
		setParams(filters);
	}, [filters]);
	const [loading, setLoading] = useState(false);
	const onExport: PopconfirmProps['onConfirm'] = async (e) => {
		e?.stopPropagation();
		if (getForm) {
			const newParams = Object.assign(params, { ...getForm() });
			setParams(newParams);
		}
		setLoading(true);
		const requestParams = {
			method,
			[method === 'GET' ? 'params' : 'data']: params,
		};
		const res = await request(link, requestParams);
		if (res && res.code === 0) {
			const downloadUrl = res.data;
			if (Array.isArray(downloadUrl)) {
				downloadUrl.map((item) => {
					window.open(`${getUrl()}${api.common.download}?filename=${item}`);
				});
			} else {
				window.open(`${getUrl()}${api.common.download}?filename=${downloadUrl}`);
			}
		}
		setLoading(false);
	};

	return (
		<>
			{props.disabled ? (
				<Button
					type='primary'
					className='btnOperator'
					loading={loading}
					{...props}>
					导出
				</Button>
			) : (
				<Popconfirm
					placement='left'
					title='确定导出？'
					onConfirm={onExport}>
					{type === 'checkBox' ? (
						<Badge
							count={keys.length}
							style={{ backgroundColor: defaultSettings.primaryColor }}
							overflowCount={99}>
							<Button
								type='primary'
								style={{ width: 72, padding: 0 }}
								className='btnOperator'
								loading={loading}
								{...props}>
								导出
							</Button>
						</Badge>
					) : (
						<Button
							type='primary'
							style={{ width: 72, padding: 0 }}
							className='btnOperator'
							loading={loading}
							{...props}>
							导出
						</Button>
					)}
				</Popconfirm>
			)}
		</>
	);
};

export default ExportFile;
