import { approve, getDetail } from '@/services/reallocate';
import { notification } from '@/utils/ui';
import { Button, Modal } from 'antd';
import { cloneElement, useEffect, useState } from 'react';
import { useAccess } from 'umi';
import ApprovalResult from './components/ApprovalResult';
import InfoDetail from './components/InfoDetail';
import Goods from './Goods';

interface Props {
	title: string;
	trigger: JSX.Element;
	disabled?: boolean;
	modalType: string;
	Allocation_detail: Record<string, any>;
	getTableList?: () => void;
}

type FormDataItem = {
	auditType: string;
	reason: string;
};
type GoodsRecord = ReallocateController.GoodsListRecord;
const CheckModal: React.FC<Props> = ({ ...props }) => {
	const access = useAccess();
	const [visible, setVisible] = useState(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [FormData, setFormData] = useState<FormDataItem>();
	const [detail, setDetail] = useState<Record<string, any>>({});
	const [tableData, setTableData] = useState<GoodsRecord[]>([]);
	const { Allocation_detail, trigger, disabled, modalType, title, getTableList } = props;

	const handleCancel = () => {
		setVisible(false);
	};

	useEffect(() => {
		let reallocateId = Allocation_detail?.id;
		const getTableData = async () => {
			let res = await getDetail({ reallocateId });
			let result = res.data as ReallocateController.ReallocateDetailRecord;
			if (res.code == 0) {
				setTableData(result?.goodsList);
				setDetail(result?.order);
			}
		};
		if (reallocateId && visible) {
			getTableData();
		}
	}, [visible]);

	const postData = async () => {
		let reason = FormData?.reason;
		let auditType = FormData?.auditType == 'N';
		if (auditType && !reason) {
			notification.warning('不通过的原因不能为空');
			return;
		}
		setLoading(true);
		const params: ReallocateController.ReallocateApprovalParams = {
			reason: reason,
			status: !auditType,
			reallocateId: detail.id,
		};

		try {
			let result = await approve(params);
			if (result?.code == 0) {
				handleCancel();
				if (typeof getTableList == 'function') {
					getTableList();
				}
			}
		} finally {
			setLoading(false);
		}
	};

	let footer = () => {
		return modalType === 'approve' && access.warehouse_request_approval
			? [
					<Button
						type='primary'
						loading={loading}
						onClick={postData}>
						提交
					</Button>,
			  ]
			: false;
	};

	return (
		<>
			{cloneElement(trigger, {
				onClick: () => {
					if (disabled) {
						return;
					}
					setVisible(true);
				},
			})}
			<Modal
				visible={visible}
				width={'80%'}
				title={title}
				onOk={postData}
				destroyOnClose
				maskClosable={false}
				onCancel={handleCancel}
				footer={footer()}
				className='ant-detail-modal'>
				<InfoDetail {...{ detail }} />
				<Goods {...{ tableData, modalType }} />
				{modalType === 'approve' && (
					<div className='operateBorder'>
						<ApprovalResult
							{...{
								modalType,
								setFormData: (value: FormDataItem) => {
									setFormData(value);
								},
							}}
						/>
					</div>
				)}
			</Modal>
		</>
	);
};
export default CheckModal;
