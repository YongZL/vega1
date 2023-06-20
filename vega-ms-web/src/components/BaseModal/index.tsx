import type { ModalProps } from 'antd';
import { Modal } from 'antd';
import React from 'react';

const BaseModal: React.FC<ModalProps> = (props) => {
	return (
		<Modal
			{...props}
			centered={true}
			maskClosable={false}
			maskStyle={{ background: 'transparent' }}>
			{props.children}
		</Modal>
	);
};

export default BaseModal;
