import React, { useState, useEffect } from 'react';
import { PlusOutlined, MinusCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Modal, Upload, message } from 'antd';
import { connect } from 'umi';
import { beforeUpload } from '@/utils/file';
import { notification } from '@/utils/ui';
import { getUrl } from '@/utils/utils';

import api from '@/constants/api';
import styles from './index.less';

const ReceiptModal = ({ loading, settlement, dispatch, ...props }) => {
	const [fileList, setFileList] = useState([]);
	const { modalVisible, setModalVisible, singleSettlementInfo } = props;
	const { receiptList } = settlement;

	useEffect(() => {
		setFileList(receiptList);
	}, [receiptList]);

	const modalSubmit = () => {
		if (fileList.length <= 0) {
			notification.error('请上传发票！');
			return;
		}
		dispatch({
			type: 'settlement/uploadReceipt',
			payload: {
				statementId: singleSettlementInfo.id,
				statementReceiptDtoList: fileList,
			},
			callback: (res) => {
				if (res && res.code === 0) {
					notification.success('操作成功');
					setModalVisible(false);
				}
			},
		});
	};

	const handleChange = (info) => {
		if (info.file.status === 'done') {
			message.success(`${info.file.name}文件上传成功`);
			let data = info.file.response.data;
			fileList.push(data);
			setFileList([...fileList]);
		} else if (info.file.status === 'error') {
			message.error(`${info.file.name} 上传失败`);
		}
	};

	// 删除
	const deleteFile = (index) => {
		fileList.splice(index, 1);
		setFileList([...fileList]);
	};

	// 下载
	const downLoadFile = (item) => {
		window.open(`${getUrl()}${item.urlName}?originName=${item.originName}`);
	};

	const modal = {
		title: '上传发票',
		visible: modalVisible,
		maskClosable: false,
		onCancel: () => setModalVisible(false),
		onOk: () => modalSubmit(),
		footer: false,
		destroyOnClose: true,
	};
	return (
		<Modal
			{...modal}
			className='modalDetails'>
			{fileList.map((item, index) => {
				return (
					<div
						key={index}
						className={styles.receiptList}>
						<div className={styles.fileItem}>
							{item.originName} <DownloadOutlined onClick={() => downLoadFile(item)} />
						</div>
						<MinusCircleOutlined
							className={styles.deleteIcon}
							onClick={() => deleteFile(index)}
						/>
					</div>
				);
			})}
			<Upload
				name='file'
				showUploadList={false}
				action={`${getUrl()}${api.upload}/upload_file`}
				onChange={handleChange}
				beforeUpload={beforeUpload}
				withCredentials={true}
				listType='text'
				className={styles.upload}
				headers={{ 'X-AUTH-TOKEN': sessionStorage.getItem('x_auth_token') || '' }}>
				<Button>
					请上传发票 <PlusOutlined />
				</Button>
			</Upload>

			<Button
				type='primary'
				onClick={() => modalSubmit()}
				className={styles.submitBtn}>
				保存
			</Button>
		</Modal>
	);
};

export default connect(
	({ loading, settlement }: { settlement; loading: { effects: { [key: string]: boolean } } }) => ({
		settlement,
		loading: loading.effects['settlement/querySettlementDetails'],
	}),
)(ReceiptModal);
