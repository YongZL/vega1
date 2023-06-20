import { notification } from '@/utils/ui';
import { LinkOutlined } from '@ant-design/icons';
import { Button, Col, Form, Modal, Row, Select } from 'antd';
import { debounce } from 'lodash';
import { cloneElement, FC, useCallback, useEffect, useState } from 'react';

import { batchBindDept, getRelate } from '@/services/relateDept';

const FormItem = Form.Item;
type RelateRecord = RelateDeptController.RelateRecord;

interface Props {
	trigger: JSX.Element;
	selectList: Record<string, any>[];
	disabled?: boolean;
	update: () => void;
}

const BindModal: FC<Props> = ({ trigger, disabled, selectList, update }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [hisList, setHisList] = useState<RelateRecord[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const [form] = Form.useForm();

	const getSpdList = async (val: string) => {
		const res = await getRelate({
			pageNum: 0,
			pageSize: 9999,
			related: false,
			keyword: val,
		});
		if (res && res.code === 0) {
			const result = res.data as unknown as { rows: RelateRecord[] };
			setHisList(result.rows);
		}
	};

	// 关闭弹窗
	const handleCancel = () => {
		form.resetFields(['deptId']);
		setVisible(false);
	};

	// 提交
	const handleSubmit = () => {
		if (loading) return;
		form.validateFields(['deptId']).then(async (values) => {
			let params = {
				hisDeptId: selectList.map((item) => item.hisDeptId),
				deptId: values.deptId,
			};
			setLoading(true);
			try {
				const res = await batchBindDept(params);
				if (res && res.code === 0) {
					notification.success('操作成功');
					update();
					handleCancel();
				}
			} finally {
				setLoading(false);
			}
		});
	};
	// 防抖
	const spdSearch = useCallback(
		debounce((val) => getSpdList(val), 500),
		[],
	);
	useEffect(() => {
		if (visible) {
			getSpdList('');
		}
	}, [visible]);

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
			<div onClick={(e) => e.stopPropagation()}>
				<Modal
					visible={visible}
					width={800}
					title='HIS科室对照'
					bodyStyle={{ width: '800px !important' }}
					maskClosable={false}
					onCancel={handleCancel}
					className='ant-fixed-width-detail-modal'
					footer={[
						<Button onClick={handleCancel}>取消</Button>,
						<Button
							type='primary'
							loading={loading}
							onClick={handleSubmit}>
							确认
						</Button>,
					]}>
					<Form form={form}>
						<Row>
							<Col
								span={12}
								style={{ lineHeight: '30px' }}>
								{selectList.map((item) => {
									return (
										<div key={item.hisDeptId}>
											{item.hisDeptCode} - {item.hisDeptName}
										</div>
									);
								})}
							</Col>
							<Col span={12}>
								<FormItem
									label={<LinkOutlined />}
									required={false}
									colon={false}
									name='deptId'
									rules={[{ required: true, message: '请选择SPD科室' }]}>
									<Select
										placeholder='请选择SPD科室'
										showSearch
										onSearch={(val) => spdSearch(val)}
										getPopupContainer={(node) => node.parentNode}
										filterOption={false}>
										{(hisList || []).map((item) => (
											<Select.Option
												value={item.deptId}
												key={item.deptId}>
												{item.deptId + ' - ' + item.deptName}
											</Select.Option>
										))}
									</Select>
								</FormItem>
							</Col>
						</Row>
					</Form>
				</Modal>
			</div>
		</>
	);
};

export default BindModal;
