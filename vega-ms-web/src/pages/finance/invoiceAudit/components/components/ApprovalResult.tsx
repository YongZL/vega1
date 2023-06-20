import SchemaForm from '@/components/SchemaForm';
import type { ProFormColumns } from '@/components/SchemaForm/typings';
import type { ProFormInstance } from '@ant-design/pro-form';
import { Col, Row } from 'antd';
import { ChangeEvent, useRef, useState, useEffect } from 'react';
import styles from '../list/index.less';
type PropsItme = {
	setFormData: (value: {
		auditType: string;
		//  reason: string
	}) => void;
};
type Ele = ChangeEvent<HTMLInputElement>;
const ApprovalResult = ({ setFormData }: PropsItme) => {
	const formRef = useRef<ProFormInstance>();
	const [auditType, setAuditType] = useState<string>('Y');
	// const [reason, setReason] = useState<string>('');
	useEffect(() => {
		setFormData({
			// reason,
			auditType: auditType,
		});
	}, []);
	const auditFormColumn: ProFormColumns = [
		{
			title: '',
			dataIndex: 'info.auditType',
			valueType: 'radio',
			initialValue: 'Y',
			fieldProps: {
				placeholder: '请选择',
				options: [
					{
						label: (
							<div className='auditType'>
								<span>通过</span>
							</div>
						),
						value: 'Y',
					},
					{
						label: (
							<div className='auditType'>
								<span>不通过</span>
							</div>
						),
						value: 'N',
					},
				],
				onChange: (e: Ele) => {
					let value = e.target.value;
					setAuditType(value);
					setFormData({
						// reason,
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
		// {
		//   title: '',
		//   dataIndex: 'info.reason',
		//   valueType: 'textarea',
		//   fieldProps: {
		//     placeholder: '请输入不通过的原因',
		//     onChange: (e: Ele) => {
		//       let value = e.target.value;
		//       setReason(value);
		//       setFormData({
		//         reason: value,
		//         auditType,
		//       });
		//     },
		//   },
		//   hideInForm: auditType == 'Y',
		//   formItemProps: {
		//     style: {
		//       width: 545,
		//     },
		//     rules: [
		//       {
		//         required: true,
		//         message: '请输入不通过的原因',
		//       },
		//     ],
		//   },
		// },
	];

	return (
		<>
			<span className={styles.approvalResult}>
				{/* <div className={styles['approval-result-title']}>审核结果</div> */}
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
