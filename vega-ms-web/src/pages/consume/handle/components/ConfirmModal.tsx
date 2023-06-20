import type { ModalProps } from 'antd';

import BaseModal from '@/components/BaseModal';
import styles from '../index.less';

type TProps = ModalProps & {
	lowerExprateDate: string[];
};

const ConfirmModal = ({ onCancel, onOk, lowerExprateDate }: TProps) => {
	return (
		<BaseModal
			width={350}
			okText='是'
			cancelText='否'
			destroyOnClose
			closable={false}
			maskClosable={false}
			onOk={onOk}
			onCancel={onCancel}
			visible>
			<div className={styles.lowerExprateDate}>
				<p>产品另有效期为</p>
				<p className={styles.expiryDateContent}>{lowerExprateDate.toString()}</p>
				<p>是否继续操作？</p>
			</div>
		</BaseModal>
	);
};

export default ConfirmModal;
