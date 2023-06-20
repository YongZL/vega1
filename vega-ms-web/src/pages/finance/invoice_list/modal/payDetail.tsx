import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Spin } from 'antd';
import DownloadWithLabel from '@/components/DownloadWithLabel';
import { getDownloadName } from '@/utils/file';
import { convertPriceWithDecimal } from '@/utils/format';
import moment from 'moment';

import '@ant-design/compatible/assets/index.css';
import { payTypeTextMap } from '@/constants/dictionary';
import { orderPayDetail } from '../service';

export interface UpdateProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	handleType?: string;
	orderInfo?: string;
	getFormList?: () => void;
}

const PayDetailModal: React.FC<UpdateProps> = (props) => {
	const [loading, setLoading] = useState(false);
	const [detail, setDetail] = useState({});

	const { isOpen, orderInfo, setIsOpen } = props;

	const getDetailInfo = async () => {
		setLoading(true);
		const res = await orderPayDetail({ invoiceId: orderInfo.id });
		if (res && res.code === 0) {
			setDetail(res.data);
		}
		setLoading(false);
	};

	useEffect(() => {
		if (isOpen) {
			getDetailInfo();
		}
	}, [isOpen]);

	return (
		<Modal
			width='50%'
			destroyOnClose
			maskClosable={false}
			visible={isOpen}
			title='查看转账凭证'
			onCancel={() => setIsOpen(false)}
			footer={false}>
			<Spin spinning={loading}>
				<div className='modelInfo'>
					<Descriptions
						column={{ xs: 1, sm: 2, lg: 3 }}
						size='small'>
						<Descriptions.Item label='付款方'>{detail.title || '-'}</Descriptions.Item>
						<Descriptions.Item label='收款方'>{detail.enterprise || '-'}</Descriptions.Item>
						<Descriptions.Item label='转账方式'>
							{payTypeTextMap[detail.paymentType] || '-'}
						</Descriptions.Item>
						<Descriptions.Item label='转账金额'>
							{detail.paymentAmount ? '￥' + convertPriceWithDecimal(detail.paymentAmount) : '-'}
						</Descriptions.Item>
						<Descriptions.Item label='转账日期'>
							{detail.paymentDate ? moment(detail.paymentDate).format('YYYY/MM/DD') : '-'}
						</Descriptions.Item>
						<br />
						<Descriptions.Item label='关联发票'>
							{detail.invoiceSerialNumberList
								? (detail.invoiceSerialNumberList || []).map((item, index) => {
										return (
											<>
												{item}
												<br />
											</>
										);
								  })
								: '-'}
						</Descriptions.Item>
						<Descriptions.Item label='转账凭证'>
							{detail.paymentUrl
								? (detail.paymentUrl.split(',') || []).map((item, index) => {
										return (
											<DownloadWithLabel
												label={getDownloadName(item)}
												url={item}
											/>
										);
								  })
								: '-'}
						</Descriptions.Item>
					</Descriptions>
				</div>
			</Spin>
		</Modal>
	);
};

export default PayDetailModal;
