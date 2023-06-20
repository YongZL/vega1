import { CloseOutlined } from '@ant-design/icons';
import { Card, Col, Row } from 'antd';

import React from 'react';
import defaultSettings from '@/../config/defaultSettings';

const Msg = ({ context, code, onClose, onClickDetail, id }) => {
	setTimeout(onClose, 5000);
	const content = code ? `${context}(${code}),` : `${context} `;
	return (
		<Card
			bordered={false}
			style={{
				width: 384,
				borderRadius: 12,
				boxShadow: '0px 24px 48px 0px rgba(0,0,0,0.16)',
				position: 'absolute',
				top: 50,
				right: 61,
				zIndex: 10000,
			}}>
			<Row
				type='flex'
				justify='space-between'
				style={{ marginBottom: 20 }}>
				<Col style={{ fontSize: 16, fontWeight: 'bold', color: CONFIG_LESS['@c_body'] }}>
					新消息提醒
				</Col>
				<Col>
					<CloseOutlined
						style={{ cursor: 'pointer' }}
						onClick={onClose}
					/>
				</Col>
			</Row>
			<Row>
				<Col style={{ fontSize: 14, fontWeight: 'bold', color: CONFIG_LESS['@c_hint'] }}>
					<span dangerouslySetInnerHTML={{ __html: content }} />
					{code && id && (
						<span
							onClick={onClickDetail}
							style={{ color: defaultSettings.primaryColor, paddingLeft: 8, cursor: 'pointer' }}>
							查看详情
						</span>
					)}
				</Col>
			</Row>
		</Card>
	);
};

export default Msg;
