import { approval, approvalReview, getDetail, getDetailById } from '@/services/goodsRequest';
import { notification } from '@/utils/ui';
import { Button, Modal, Form } from 'antd';
import { cloneElement, useEffect, useRef, useState } from 'react';
import ApprovalResult from './components/ApprovalResult';
import InfoDetail from './components/InfoDetail';
import Goods from './Goods';
import Ordinary from './Ordinary';

interface Props {
	title: string;
	trigger: JSX.Element;
	disabled?: boolean;
	modalType: string;
	apply_detail: Record<string, any>;
	getTableList?: () => void;
	modalVisible?: () => void;
}

type FormDataItem = {
	auditType: string;
	reason: string;
};

const quantityType = {
	audit: 'approvalQuantity',
	review: 'approvalReviewQuantity',
};

const reasonType = {
	audit: 'approvalReason',
	review: 'approvalReviewReason',
};

type RefType = { getTableData: () => Record<string, any>[] };

const CheckModal: React.FC<Props> = ({ ...props }) => {
	const [form] = Form.useForm();
	const goodsRef = useRef<RefType>();
	const ordinaryRef = useRef<RefType>();
	const [visible, setVisible] = useState(false);
	const [goodsType, setGoodsType] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [issubmt, setIssubmt] = useState<boolean>(false);
	const [FormData, setFormData] = useState<FormDataItem>();
	const [detail, setDetail] = useState<Record<string, any>>({});
	const [tableData, setTableData] = useState<Record<string, any>[]>([]);

	const { apply_detail, trigger, disabled, modalType, title, getTableList, modalVisible } = props;

	const handleCancel = () => {
		if (typeof modalVisible == 'function') {
			modalVisible();
		}
		setVisible(false);
	};

	const getDetailByIdData = async (id: number) => {
		const res = await getDetailById({ id });
		if (res.code === 0) {
			setDetail(res.data);
		}
	};

	useEffect(() => {
		let id = apply_detail?.id;
		const getTableData = async (goodsRequestId: number) => {
			let res = await getDetail({ goodsRequestId });
			if (res.code == 0) {
				let typeValue = Array.isArray(res.data) ? 'goods' : 'ordinary';
				setTableData(res.data);
				setGoodsType(typeValue);
			}
		};

		if (id && visible) {
			getTableData(id);
			getDetailByIdData(id);
		}
	}, [visible]);

	const handleOk = async () => {
		form
			.validateFields()
			.then(async () => {
				let reason = FormData?.reason;
				let auditType = FormData?.auditType == 'N';
				if (issubmt && !auditType) {
					notification.warning(modalType == 'audit' ? '审核数量不可以为 0' : '复核数量不可以为 0');
					return;
				}
				if (auditType && !reason) {
					notification.warning('不通过的原因不能为空');
					return;
				}
				setLoading(true);
				let newStatus: string = '';
				if (modalType == 'audit') {
					newStatus = auditType ? 'approval_failure' : 'approval_review_pending';
				}
				if (modalType == 'review') {
					newStatus = auditType ? 'approval_review_failure' : 'approval_review_success';
				}
				const params: GoodsRequestController.ApprovalParams = {
					items: [],
					id: detail.id,
					status: newStatus,
					reason: reason,
				};

				let postTableData =
					goodsType == 'goods'
						? goodsRef?.current?.getTableData()
						: ordinaryRef?.current?.getTableData();

				params.items = [...(postTableData || [])].map((item) => ({
					id: item.requestItemId || item.id,
					quantity:
						item[quantityType[modalType]] ||
						Number(item.approvalReviewQuantity || 0) ||
						Number(item.approvalQuantity || 0) ||
						item.requestNum,
					reason: item[reasonType[modalType]] || '',
				}));

				try {
					let result;
					if (modalType == 'audit') {
						result = await approval(params);
					} else if (modalType == 'review') {
						result = await approvalReview(params);
					}

					if (result?.code == 0) {
						handleCancel();
						if (typeof getTableList == 'function') {
							getTableList();
						}
					}
				} finally {
					setLoading(false);
				}
			})
			.catch((error) => {});
	};

	const modalProps = {
		...props,
		detail,
		tableData,
		handleCancel,
		reasonType,
		quantityType,
		setIssubmtFn: (value: boolean) => {
			setIssubmt(value);
		},
	};

	let footer = () => {
		return (
			((modalType == 'audit' || modalType == 'review') && [
				<Button
					key='back'
					onClick={handleCancel}>
					取消
				</Button>,
				<Button
					key='submit'
					type='primary'
					loading={loading}
					onClick={handleOk}>
					提交
				</Button>,
			]) ||
			[]
		);
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
				width={'80%'}
				title={title}
				onOk={handleOk}
				destroyOnClose
				visible={visible}
				maskClosable={false}
				onCancel={handleCancel}
				footer={footer()}
				className='ant-detail-modal'>
				<InfoDetail {...{ detail, goodsType, tableData, modalType }} />
				<Form form={form}>
					{goodsType == 'goods' && (
						<Goods
							{...modalProps}
							goodsRef={goodsRef}
						/>
					)}
					{goodsType == 'ordinary' && (
						<Ordinary
							{...modalProps}
							ordinaryRef={ordinaryRef}
						/>
					)}
				</Form>
				{(modalType === 'audit' || modalType === 'review') && (
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
