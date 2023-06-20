import type { UploadProps as UProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';

export type UploadProps = Omit<UProps, 'onChange'> & {
	formKey?: string; // column.proFieldKey + @@ + SchemaForm生成时间戳， SchemaForm自动生成，单独使用时不要手动设置
	errorText?: string; // 失败提示文字
	successText?: string; // 成功提示文字
	msgField?: string; // 获取提示信息的字段，支持用.分割，如data.msg，默认为msg
	successCodeField?: string; // 获取成功状态码的字段，支持用.分割，如data.code，默认为code
	successCode?: string | number; // 成功状态码，默认为0
	resultUrlField?: string; // 获取图片路径字段，支持用.分割，如data.urlName，默认为data.urlName
	// value?: UProps['fileList']; // 不知道是不是BetaSchemaForm的bug，设置valuePropName为fileList无效，所以只能改成value，单独使用的时候也请用value代替fileList
	onChange?: (fileList: UploadFile[]) => void;
};
