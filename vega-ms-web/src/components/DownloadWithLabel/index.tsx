import type { FC, ReactNode } from 'react';
import { Icon as LegacyIcon } from '@ant-design/compatible';
import style from './index.less';
import { getUrl } from '@/utils/utils';

const download = (url: string) => {
	window.open(`${getUrl()}${url}`);
};

export interface DownloadWithLabelProps {
	label?: ReactNode;
	url?: string;
	icon?: string;
	handleTxt?: ReactNode;
}

const DownloadWithLabel: FC<DownloadWithLabelProps> = ({ label, url, icon, handleTxt }) => {
	const content = url && (
		<span
			className={style.link}
			onClick={() => download(url)}>
			<LegacyIcon type={icon || 'download'} />
			{handleTxt || '下载'}
		</span>
	);
	return (
		<>
			{label ? (
				<div>
					{label}
					{content}
				</div>
			) : (
				content
			)}
		</>
	);
};

export default DownloadWithLabel;
