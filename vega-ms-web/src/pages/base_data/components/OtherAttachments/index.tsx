import { Col, Form, FormInstance, Input, Row } from 'antd';
import React, { useEffect, useImperativeHandle, useState } from 'react';
import { COL_WIDTH_CONFIG } from './config';
import UpLoadFile from '@/components/UpLoadFile';
import { uploadFileApi } from '@/services/upload';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
type PropsType = {
	type: string;
	horizontal?: boolean;
	form: FormInstance<any>;
	aRef: React.MutableRefObject<Record<string, any> | undefined>;
	data?: Record<string, any>;
	setIsSuccessfully: React.Dispatch<React.SetStateAction<boolean>>;
};
const formListLayout = {
	labelCol: {
		style: { width: 120 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 15 },
		md: { span: 16 },
		lg: { span: 12 },
		xl: { span: 15 },
		xxl: { span: 16 },
	},
};
const FormItem = Form.Item;
import { colItem3 } from '@/constants/formLayout';
const OtherAttachments = ({ form, data, setIsSuccessfully, aRef, horizontal, type }: PropsType) => {
	const { setFieldsValue, validateFields } = form;
	const [attachmentsData, setAttachmentsData] = useState([
		{ name: '', info: '', id: new Date().getTime() },
	]);
	useImperativeHandle(aRef, () => ({
		getVal: (data: { string: Record<string, any> }) => {
			return handleData(data);
		},
	}));

	useEffect(() => {
		if (data && data.attachments) {
			let result = (JSON.parse(data.attachments) || []).map(
				(item: Record<string, any>, index: number) => {
					return { id: new Date().getTime() + '-' + index, ...item };
				},
			);
			if (result.length) {
				setAttachmentsData(result);
			}
		}
		if (data && data.remark) {
			setFieldsValue({ remark: data.remark });
		}
	}, [data]);

	//删除附件
	const delAttachments = (index: number) => {
		attachmentsData.splice(index, 1);
		setAttachmentsData([...attachmentsData]);
	};

	//添加附件
	const addAttachments = () => {
		if (attachmentsData.length > 4) return;
		attachmentsData.push({ name: '', info: '', id: new Date().getTime() });
		setAttachmentsData([...attachmentsData]);
	};

	//处理获取到的数据
	const handleData = (data: { string: Record<string, any> }) => {
		if (!data) return {};
		let attachmentsObj = {};
		for (let item in data) {
			let key = item.split('_')[0];
			let name = item.split('_')[1];
			attachmentsObj[key] = { ...attachmentsObj[key], [`${name}`]: data[item] };
		}
		let attachmentsArr = [];
		for (let item in attachmentsObj) {
			const { info, name } = attachmentsObj[item];
			if (info || name) {
				attachmentsArr.push(attachmentsObj[item]);
			}
		}
		return JSON.stringify(attachmentsArr);
	};
	const circleIconStyle: Record<string, any> = {
		marginRight: 10,
		marginTop: 6,
		zIndex: 1,
		position: horizontal ? 'absolute' : undefined,
	};
	return (
		<Col {...(horizontal ? COL_WIDTH_CONFIG.A : COL_WIDTH_CONFIG.B)}>
			{attachmentsData.map((item, index) => {
				const { name, id, info } = item;
				let isInfo = info ? true : false;
				let isName = name ? true : false;
				return (
					<Row
						gutter={24}
						style={{ width: '100%' }}>
						<Col {...(horizontal ? colItem3 : COL_WIDTH_CONFIG.D)}>
							<div
								style={{
									display: 'flex',
									alignItems: horizontal ? '' : 'center',
								}}>
								{index === 0 ? (
									<PlusCircleOutlined
										className='fz18'
										style={circleIconStyle}
										onClick={() => addAttachments()}
									/>
								) : (
									<MinusCircleOutlined
										className='fz18'
										style={circleIconStyle}
										onClick={() => delAttachments(index)}
									/>
								)}

								<FormItem
									{...(horizontal ? formListLayout : '')}
									label='附件名称'
									rules={[{ required: isInfo, message: '请输入附件名称' }]}
									name={`${type}&${id}_name`}
									initialValue={name}
									style={{ width: '100%' }}>
									<Input
										onChange={(e) => {
											let val = e.target.value;
											attachmentsData[index].name = val;
											setAttachmentsData([...attachmentsData]);
											if (!val && !isInfo) {
												setTimeout(() => {
													validateFields([`${type}&${id}_info`]);
												}, 300);
											}
										}}
										placeholder='请输入'
										maxLength={100}
									/>
								</FormItem>
							</div>
						</Col>
						<Col {...COL_WIDTH_CONFIG.D}>
							<UpLoadFile
								required={isName}
								form={form}
								uploadApi={uploadFileApi}
								setIsSuccessfully={setIsSuccessfully}
								label='附件信息'
								btnTxt='上传附件信息'
								formName={`${type}&${id}_info`}
								initialValue={info || ''}
								formItemCol={horizontal ? formListLayout : undefined}
								onChange={(val) => {
									let value = val?.fileList.length ? val?.file?.response?.data?.urlName : '';
									attachmentsData[index].info = value;
									setAttachmentsData([...attachmentsData]);
									if (!value && !isName) {
										setTimeout(() => {
											validateFields([`${type}&${id}_name`]);
										}, 300);
									}
								}}
							/>
						</Col>
					</Row>
				);
			})}
			<Row
				gutter={24}
				style={{ width: '100%' }}>
				<Col {...COL_WIDTH_CONFIG.A}>
					<FormItem
						{...(horizontal
							? {
									labelCol: {
										style: { width: 120 },
									},
									wrapperCol: {
										xs: { span: 24 },
										sm: { span: 15 },
										md: { span: 16 },
										lg: { span: 12 },
										xl: { span: 20 },
										xxl: { span: 14 },
									},
							  }
							: '')}
						label='备注'
						name='remark'>
						<Input.TextArea
							placeholder='请输入'
							maxLength={100}
							autoSize={{ minRows: 2, maxRows: 5 }}
						/>
					</FormItem>
				</Col>
			</Row>
		</Col>
	);
};

export default OtherAttachments;
