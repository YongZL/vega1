import Images from '@/components/Images';
import { beforeUpload } from '@/utils/file';
import { convertImageUrl } from '@/utils/file/image';
import { errMsg, patterns } from '@/utils/file/uploadValid';
import request from '@/utils/request';
import { getUrl } from '@/utils/utils';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Form, FormInstance, message, notification, Upload } from 'antd';
import { UploadChangeParam } from 'antd/es/upload';
import { UploadFile } from 'antd/es/upload/interface';
import { RcFile } from 'antd/lib/upload';
import { useEffect, useRef } from 'react';
import styles from './index.less';

type PropsType = {
	form: FormInstance<any>;
	label: string;
	btnTxt: string;
	formName: string;
	isleft?: boolean;
	required?: boolean;
	setIsSuccessfully: React.Dispatch<React.SetStateAction<boolean>>; // 判断文件是否上传完成
	notice?: any;
	setIsshow?: React.Dispatch<React.SetStateAction<boolean>>; // 是否上传过
	uploadApi: string; //上传的地址
	initialValue?: string[] | string; // 初始化值，只需要传文件地址
	onChange?: (value: UploadChangeParam<UploadFile<any>>) => void;
	formItemCol?: Record<string, any>;
};

const FormItem = Form.Item;
export const formItemModal = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 8, offset: 1 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 13 },
	},
};
const UpLoadFile = ({
	form,
	label,
	btnTxt,
	formName,
	isleft = false,
	required = true,
	setIsSuccessfully,
	notice,
	setIsshow,
	uploadApi,
	initialValue = [],
	onChange = () => {},
	formItemCol,
	...props
}: PropsType) => {
	const UploadNumRef = useRef(0);
	const handleChange = (info: UploadChangeParam<UploadFile<any>>) => {
		onChange(info);
		if (info.fileList.length == 0) {
			setIsshow && setIsshow(false);
		}
		if (info.file.status === 'done') {
			message.success(`${info.file.name}上传成功`);
		}
		if (info.file.status === 'error') {
			message.error(`${info.file.name} 上传失败`);
		}
		setIsSuccessfully(
			!info.fileList.some((item) => item.status === 'error' || item.status === 'uploading'),
		);
	};
	const customRequestfn = async (info: Record<string, any>) => {
		let res = undefined;
		if (info.file.name.length <= 80) {
			const formData = new FormData();
			formData.append('file', info.file);
			res = await request(uploadApi, {
				method: 'POST',
				data: formData,
			});
		}
		info.onSuccess!(res, info.file); //解决上传后loading一直旋转问题
		if (res.data.urlName) {
			setIsshow && setIsshow(false);
		}
	};
	// 上传事件回调
	const normFile = (e: Record<string, any>) => {
		let fileList = e.fileList;
		if (e.file.name.length > 80) {
			notification.error({ message: '文件上传名称长度不得超过80个字符' });
			fileList.splice(
				fileList.findIndex((item) => item.name.length > 80),
				1,
			);
		}
		if (!e.file.status || e.file.status == 'error') {
			return [];
		} else {
			form.setFieldsValue({
				[formName]: fileList,
			});
			return fileList;
		}
	};
	const downLoadFile = (item: { urlName: string; originName: string }) => {
		window.open(`${getUrl()}${item.urlName}?originName=${item.originName}`);
	};

	const beforeUpload = (file: File) => {
		if (patterns.test(file.name)) {
			notification.error({ message: errMsg });
			return;
		}
		const isLt1M = file.size / 1024 / 1024 < 21;
		if (!isLt1M) {
			notification.error({ message: '文件必须小于20M' });
		}
		UploadNumRef.current += 1;
		const originalUpload = (form && form.getFieldValue(formName)) || [];
		if (originalUpload.length + UploadNumRef.current > 5) {
			notification.error({ message: '最多上传5个文件' });
		}
		return isLt1M;
	};

	useEffect(() => {
		UploadNumRef.current = 0;
	}, [form && form.getFieldValue(formName) && form.getFieldValue(formName).length]);
	return (
		<>
			<FormItem
				label={label}
				{...(formItemCol || formItemModal)}
				initialValue={
					typeof initialValue === 'string'
						? convertImageUrl(initialValue || '')
						: (initialValue || []).map((item, index) => {
								const file = convertImageUrl(item || '')[0] || {};
								file.uid = String(Date.now() + index);
								file.key = String(Date.now() + index);
								return file;
						  })
				}
				rules={[{ required, message: notice || `请上传${label}` }]}
				name={formName}
				valuePropName='fileList'
				getValueFromEvent={normFile}
				className={styles.formItem}>
				<Upload
					name='file'
					multiple={true}
					showUploadList={true}
					onChange={handleChange}
					customRequest={customRequestfn}
					beforeUpload={beforeUpload}
					withCredentials={true}
					maxCount={5}
					onDownload={(file: any) => {
						downLoadFile(file);
					}}
					itemRender={(originNode, file, _FileList, actions) => {
						return (
							<div>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
										}}>
										{file.response && file.response.data ? (
											file.response.data.urlName && <Images url={file.response.data.urlName} />
										) : file.response ? (
											<Images url={file.response} />
										) : (
											originNode.props &&
											originNode.props.children[0].props.children.props.children[0]
										)}
										<div
											style={{
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												width: 120,
											}}>
											{file.name}
										</div>
									</div>
									<DeleteOutlined
										onClick={() => {
											UploadNumRef.current = 0;
											actions.remove();
										}}
									/>
								</div>
								{/* {originNode.props && originNode.props.children[2]} // 上传进度条 */}
							</div>
						);
					}}
					listType='text'
					className={styles.upload}
					{...props}
					headers={{ 'X-AUTH-TOKEN': sessionStorage.getItem('x_auth_token') || '' }}>
					<Button>
						<UploadOutlined /> {btnTxt}
					</Button>
				</Upload>
			</FormItem>
		</>
	);
};

export default UpLoadFile;
