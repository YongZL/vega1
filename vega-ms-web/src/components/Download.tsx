import React from 'react';
import { getUrl } from '@/utils/utils';

const DownLoad: React.FC<{ url: string }> = ({ children, url }) => {
	return (
		<a
			href={`${getUrl()}${url}?originName=${url}`}
			download
			rel='noopener noreferrer'
			target='_blank'>
			{children}
		</a>
	);
};

export default DownLoad;
