import SchemaForm from '@/components/SchemaForm';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import type { ProFormInstance } from '@ant-design/pro-form';
import { Col, Row } from 'antd';
import { ChangeEvent, useRef, useState } from 'react';
import styles from '../../style.less';
type Ele = ChangeEvent<HTMLInputElement>;
type valueItem = { auditType: string; reason: string };
const ApprovalResult = ({ setFormData }: { setFormData: (value: valueItem) => void }) => {
	const formRef = useRef<ProFormInstance>();
	const [auditType, setAuditType] = useState<string>('Y');
	const [reason, setReason] = useState<string>('');

	const auditFormColumn: ProFormColumns = [
		{
			title: '',
			dataIndex: 'info.auditType',
			valueType: 'radio',
			initialValue: 'Y',
			fieldProps: {
				placeholder: '请选择',
				options: [
					{ label: '通过', value: 'Y' },
					{ label: '不通过', value: 'N' },
				],
				onChange: (e: Ele) => {
					let value = e.target.value;
					setAuditType(value);
					setFormData({
						reason,
						auditType: value,
					});
				},
			},
			formItemProps: {
				className: 'auditType',
				rules: [
					{
						required: true,
						message: '请选择审核结果',
					},
				],
			},
		},
		{
			title: '',
			dataIndex: 'info.reason',
			valueType: 'textarea',
			fieldProps: {
				placeholder: '请输入不通过的原因',
				onChange: (e: Ele) => {
					let value = e.target.value;
					setReason(value);
					setFormData({
						reason: value,
						auditType,
					});
				},
			},
			hideInForm: auditType == 'Y',
			formItemProps: {
				style: {
					width: 545,
				},
				rules: [
					{
						required: true,
						message: '请输入不通过的原因',
					},
				],
			},
		},
	];

	return (
		<>
			<span className={styles.approvalResult}>
				<div className={styles['approval-result-title']}>审核结果</div>
				<Row>
					<Col span={24}>
						<SchemaForm
							span={13}
							formRef={formRef}
							submitter={{
								render: () => false,
							}}
							columns={auditFormColumn}
						/>
					</Col>
				</Row>
			</span>
		</>
	);
};

export default ApprovalResult;
