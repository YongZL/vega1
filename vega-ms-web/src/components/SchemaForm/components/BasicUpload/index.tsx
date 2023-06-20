// import type { FC } from 'react';
// import type { UploadFile, UploadChangeParam, RcFile } from 'antd/es/upload/interface';
// import type { UploadProps } from './typings';

// import { useState, useEffect, useCallback } from 'react';
// import { Upload, message } from 'antd';
// import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
// // import { uploadImageApi } from '@/services/upload';
// import { get } from 'lodash';
// // import { useFormFieldPropsMap } from '../../hooks';

// // 自定义基础上传，只允许单个文件
// const BasicUpload: FC<UploadProps> = ({
//   errorText,
//   successText,
//   onChange,
//   onRemove,
//   beforeUpload,
//   disabled,
//   name,
//   listType,
//   accept,
//   action,
//   headers,
//   resultUrlField,
//   successCodeField,
//   successCode,
//   msgField,
//   // formKey,
//   fileList: initFileList,
//   ...props
// }) => {
//   // const { fieldProps, updateFieldProps } = useFormFieldPropsMap(formKey);
//   const [uploading, setUploading] = useState<boolean>(false);
//   const [fileList, setFileList] = useState<UploadFile[]>(initFileList || []);

//   const handleOnChange = useCallback((fList) => {
//     if (typeof onChange === 'function') {
//       onChange(fList);
//     }
//   }, [onChange]);

//   useEffect(() => {
//     if (typeof onChange === 'function') {
//       onChange(fileList as any);
//     }
//   }, [fileList, onChange]);

//   useEffect(() => {
//     setFileList(initFileList || []);
//   }, [initFileList]);

//   // useEffect(() => {
//   //   if (formKey) {
//   //     updateFieldProps('fileList', fileList);
//   //   }
//   // }, [fileList, formKey, updateFieldProps]);

//   // useEffect(() => {
//   //   if (formKey) {
//   //     updateFieldProps('uploading', uploading);
//   //   }
//   // }, [formKey, uploading, updateFieldProps]);

//   const handleRemove = useCallback(() => {
//     setFileList([]);
//     handleOnChange([]);
//   }, [handleOnChange]);

//   const handleBeforeUpload = useCallback((file: RcFile, fList: RcFile[]) => {
//     if (typeof beforeUpload === 'function') {
//       const res = beforeUpload(file, fList);
//       if (res !== undefined) {
//         if (res) {
//           setFileList([file]);
//           handleOnChange([file]);
//         }
//         return res;
//       }
//     } else {
//       setFileList([file]);
//       handleOnChange([file]);
//     }
//     return true;
//   }, [beforeUpload, handleOnChange]);

//   const handleChange = useCallback((uploadData: UploadChangeParam) => {
//     // uploading done error removed
//     const { status, response: res } = uploadData.file;
//     if (status === 'uploading') {
//       setUploading(true);
//     } else {
//       setUploading(false);
//       if (status === 'done') {
//         const msg = get(res, msgField || 'msg');
//         const resCode = get(res, successCodeField || 'code');
//         const sucCode = typeof successCode !== 'undefined' ? successCode : 0;
//         if (resCode === sucCode) {
//           message.success(successText || '上传成功！');
//           const url = get(res, resultUrlField || 'data.urlName');
//           const currentFileList = [{ ...fileList[0], url }];
//           setFileList(currentFileList);
//           handleOnChange(currentFileList);
//         } else {
//           message.error(msg, 3);
//           setFileList([]);
//           handleOnChange([]);
//         }
//       }
//       if (status === 'error') {
//         message.error(errorText || '上传失败，请重试！', 3);
//         setFileList([]);
//         handleOnChange([]);
//       }
//     }
//   }, [errorText, fileList, handleOnChange, msgField, resultUrlField, successCode, successCodeField, successText]);

//   const token = sessionStorage.getItem('x-auth-token') || '';

//   return (
//     <>
//       <Upload
//         {...props}
//         fileList={fileList}
//         showUploadList={typeof props.showUploadList === 'boolean' ? props.showUploadList : false}
//         headers={{ 'x-auth-token': token, ...(typeof headers === 'object' ? headers : {}) }}
//         action={action || uploadImageApi}
//         name={name || 'file'}
//         listType={listType || 'picture-card'}
//         accept={accept || '.png,.jpg,.jpeg'}
//         multiple={false}
//         maxCount={1}
//         disabled={(typeof disabled === 'boolean' && disabled) || uploading}
//         onRemove={handleRemove}
//         beforeUpload={handleBeforeUpload}
//         onChange={handleChange}
//       >
//         {uploading ? <LoadingOutlined /> : <PlusOutlined />}
//       </Upload>
//     </>
//   );
// };

// export default BasicUpload;
