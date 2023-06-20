import { DealDate } from '@/utils/DealDate';
import { Button, Modal } from 'antd';
import React from 'react';

interface UpdateProps {
	modalData?: string;
	setModalData: (value: string) => void;
	handleOk: (value: any) => void;
	departmentName?: string;
	stockTimes?: number;
}
const style = {
	height: '32px',
};
const ConfirmModal: React.FC<UpdateProps> = ({
	modalData,
	setModalData,
	handleOk,
	departmentName,
	stockTimes,
}) => {
	return (
		<Modal
			width={520}
			maskClosable={false}
			title={<div style={{ textAlign: 'center', fontWeight: 'bold' }}>注 意</div>}
			visible={modalData !== ''}
			onCancel={() => setModalData('')}
			footer={[
				<Button
					key='back'
					onClick={() => setModalData('')}>
					返回修改
				</Button>,
				<Button
					key='submit'
					type='primary'
					onClick={() => handleOk(modalData)}>
					{modalData == 'post' ? '提交' : '保存'}库存单
				</Button>,
			]}>
			<p style={style}>科室：{departmentName || '-'}</p>
			<p style={style}>创建人员：{sessionStorage.useName || '-'}</p>
			<p>盘库时间：{DealDate(Number(stockTimes), 1, '-')}</p>
		</Modal>
	);
};

export default ConfirmModal;
