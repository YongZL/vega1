import { ExclamationCircleFilled } from '@ant-design/icons';
import type { FC, ReactNode } from 'react';

export const GetNotification: FC<{ headerTitle: ReactNode }> = ({ headerTitle = '' }) => {
	const msg = '';
	return (
		<div className='tableHeaderNotificationTitle'>
			<p>{headerTitle}</p>
			{msg && (
				<div className='tableAlert'>
					<ExclamationCircleFilled
						style={{
							color: CONFIG_LESS['@c_starus_early_warning'],
							marginRight: '8px',
							fontSize: '12px',
						}}
					/>
					<span className='consumeCount'>{msg}</span>
				</div>
			)}
		</div>
	);
};

export const Tips: FC<{
	headerTitle: ReactNode;
	text?: string;
	longText?: string;
}> = ({ headerTitle = '', text = '', longText = '' }) => {
	return (
		<div className='tableNotificationTitle'>
			<p style={{ marginRight: '43px' }}>{headerTitle}</p>
			{text && (
				<div className='tableAlert'>
					<div style={{ color: CONFIG_LESS['@c_body'], marginRight: '8px', fontSize: '12px' }} />
					<span className='consumeCount'>{text}</span>
				</div>
			)}

			{longText && <div className='tableAlert'>{longText}</div>}
		</div>
	);
};
