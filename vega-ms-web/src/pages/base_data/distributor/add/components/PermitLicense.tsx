import { convertImageUrl } from '@/utils/file/image';
import {
	Checkbox,
	Col,
	DatePicker,
	Form,
	FormInstance,
	Input,
	Radio,
	RadioChangeEvent,
	Row,
	Tree,
} from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import moment from 'moment';
import React, { useEffect, useImperativeHandle, useState } from 'react';
import { useModel } from 'umi';
import { COL_WIDTH_CONFIG } from './config';
import UpLoadFile from '@/components/UpLoadFile';
import { uploadFileApi } from '@/services/upload';
const { RangePicker } = DatePicker;
type PropsType = {
	form: FormInstance<any>;
	data: ManufacturerController.LicenseManufacturerPermit;
	setIsSuccessfully: React.Dispatch<React.SetStateAction<boolean>>;
	submitPrefix: string;
	goodsCategory12: CategoryController.TypeData[];
	goodsCategory18: CategoryController.TypeData[];
	pRef: React.MutableRefObject<Record<string, any> | undefined>;
	type: string;
	gspEnabled: boolean;
};

const FormItem = Form.Item;
const PermitLicense = ({
	form,
	data,
	setIsSuccessfully,
	submitPrefix,
	goodsCategory12 = [],
	goodsCategory18 = [],
	pRef,
	type,
	gspEnabled,
}: PropsType) => {
	const { fields } = useModel('fieldsMapping');
	const { setFieldsValue, resetFields } = form;
	const [isLongTimeValid, setIsLongTimeValid] = useState(true);
	const [checkedKeys12, setCheckedKeys12] = useState<(string | number)[]>([]);
	const [checkedKeys18, setCheckedKeys18] = useState<(string | number)[]>([]);
	const [isshow, setIsshow] = useState(true);
	const [isshowKeys12, setIsshowKeys12] = useState<boolean>(false);
	const [isshowKeys18, setIsshowKeys18] = useState<boolean>(false);
	const [submitPrefixHasTree, setSubmitPrefixHasTree] = useState(true);
	useImperativeHandle(pRef, () => ({
		getVal: () => {
			return {
				[`${submitPrefix}&std2012CategoryIds`]: checkedKeys12
					? checkedKeys12.filter((item) => String(item).indexOf('parent') < 0)
					: [],
				[`${submitPrefix}&std2018CategoryIds`]: checkedKeys18
					? checkedKeys18.filter((item) => String(item).indexOf('parent') < 0)
					: [],
			};
		},
	}));
	// 「长期有效」和「截止日期」的联动
	useEffect(() => {
		if (data) {
			const timeVal = !data.endTimeIsNull && !data.permitEndTime;
			setIsLongTimeValid(timeVal);
			form.setFieldsValue({
				[`${submitPrefix}&isLongTimeValid_permitEndTime_permitBeginTime`]: timeVal,
			});
		}
	}, [data]);

	const handleLongTimeValidChekBoxChange = (e: CheckboxChangeEvent) => {
		if (e) {
			setIsLongTimeValid(e.target.checked);
		}
		form.setFieldsValue({
			[`${submitPrefix}&permitBeginTime`]: [
				form.getFieldValue(`${submitPrefix}&permitBeginTime`)[0],
				null,
			],
		});
	};
	useEffect(() => {
		if (data.std2018CategoryIds && data.std2018CategoryIds.length > 0) {
			setCheckedKeys18((data.std2018CategoryIds || []).map((item) => String(item)));
			setIsshowKeys18(true);
			// setFieldsValue({
			//   [`${submitPrefix}hasTree`]: true,
			// });
			setSubmitPrefixHasTree(true);
			form.setFieldsValue({
				[`${submitPrefix}&tree18`]: (data.std2018CategoryIds || []).map((item) => String(item)),
			});
		}
		if (data.std2012CategoryIds && data.std2012CategoryIds.length > 0) {
			setCheckedKeys12((data.std2012CategoryIds || []).map((item) => String(item)));
			setIsshowKeys12(true);
			// setFieldsValue({
			//   [`${submitPrefix}hasTree`]: true,
			// });
			setSubmitPrefixHasTree(true);
			form.setFieldsValue({
				[`${submitPrefix}&tree12`]: (data.std2012CategoryIds || []).map((item) => String(item)),
			});
			return;
		}
		if (Object.keys(data).length == 0) {
			// setFieldsValue({
			//   [`${submitPrefix}hasTree`]: gspEnabled ? true : false,
			// });
			setSubmitPrefixHasTree(gspEnabled ? true : false);
			setIsshowKeys12(gspEnabled ? true : false);
			setIsshowKeys18(gspEnabled ? true : false);
			setCheckedKeys18([]);
			setCheckedKeys12([]);
		} else if (
			data.std2012CategoryIds &&
			data.std2012CategoryIds.length == 0 &&
			data.std2018CategoryIds &&
			data.std2018CategoryIds.length == 0
		) {
			// form.setFieldsValue({
			//   [`${submitPrefix}hasTree`]: false,
			// });
			setSubmitPrefixHasTree(false);
			setIsshowKeys12(false);
			setIsshowKeys18(false);
		}
	}, [data.std2018CategoryIds, data.std2012CategoryIds]);

	const selectOnChange = (value: RadioChangeEvent) => {
		setCheckedKeys12([]);
		setCheckedKeys18([]);
		setIsshowKeys12(false);
		setIsshowKeys18(false);
		setSubmitPrefixHasTree(value.target.checked);
		setFieldsValue({
			[`${submitPrefix}hasTree`]: value.target.checked,
			[`${submitPrefix}&tree12`]: undefined,
			[`${submitPrefix}&tree18`]: undefined,
		});
	};

	const renderTreeNodes12 = (nodes: CategoryController.TypeData[]) =>
		nodes.map((item) => {
			if (item.children) {
				return (
					<Tree.TreeNode
						title={item.code}
						key={`parent${item.id}`}>
						{renderTreeNodes12(item.children)}
					</Tree.TreeNode>
				);
			}
			return (
				<Tree.TreeNode
					key={item.id}
					title={item.code}
					className='treeLeaf'
				/>
			);
		});

	const renderTreeNodes18 = (nodes: CategoryController.TypeData[]) =>
		nodes.map((item) => {
			if (item.children) {
				return (
					<Tree.TreeNode
						title={item.code}
						key={`parent${item.id}`}>
						{renderTreeNodes18(item.children)}
					</Tree.TreeNode>
				);
			}
			return (
				<Tree.TreeNode
					key={item.id}
					title={item.code}
					className='treeLeaf'
				/>
			);
		});

	const treeCheck12 = (value: (string | number)[] | {}) => {
		setCheckedKeys12(value as (string | number)[]);
		setFieldsValue({
			[`${submitPrefix}&tree12`]: value,
		});
		resetFields([`${submitPrefix}&tree18`]);
	};

	const treeCheck18 = (value: (string | number)[] | {}) => {
		setCheckedKeys18(value as (string | number)[]);
		setFieldsValue({
			[`${submitPrefix}&tree18`]: value,
		});
		resetFields([`${submitPrefix}&tree12`]);
	};

	return (
		<Row gutter={16}>
			<Col {...COL_WIDTH_CONFIG.D}>
				<Row gutter={16}>
					<Col {...COL_WIDTH_CONFIG.F}>
						<FormItem
							label='许可证号'
							rules={[{ required: gspEnabled, message: '请输入' }]}
							name={`${submitPrefix}&permitNo`}
							initialValue={data.permitNo}>
							<Input
								placeholder='请输入'
								maxLength={100}
							/>
						</FormItem>
					</Col>

					<Col {...COL_WIDTH_CONFIG.F}>
						<FormItem
							label={`${fields.distributor}负责人员`}
							name={`${submitPrefix}&principalName`}
							initialValue={data.principalName}>
							<Input
								placeholder='请输入'
								maxLength={20}
							/>
						</FormItem>
					</Col>

					<Col {...COL_WIDTH_CONFIG.F}>
						<FormItem
							label='法定代表人员'
							name={`${submitPrefix}&legalPerson`}
							initialValue={data.legalPerson}>
							<Input
								placeholder='请输入'
								maxLength={20}
							/>
						</FormItem>
					</Col>

					<Col {...COL_WIDTH_CONFIG.F}>
						<FormItem
							label='生效日期'
							name={`${submitPrefix}&permitBeginTime`}
							rules={[{ required: gspEnabled, message: '请选择' }]}
							initialValue={
								data.permitBeginTime
									? [
											moment(new Date(data.permitBeginTime)),
											data.permitEndTime ? moment(new Date(data.permitEndTime)) : undefined,
									  ]
									: undefined
							}>
							<RangePicker
								style={{ width: '100%' }}
								format={['YYYY-MM-DD', 'YYYY/MM/DD']}
								disabled={[false, isLongTimeValid]}
								placeholder={['生效日期', '截止日期']}
								allowEmpty={[false, isLongTimeValid]}
								// defaultValue={[data?.licenseBeginTime, data?.licenseEndTime]}
							/>
						</FormItem>
					</Col>

					{/* {!isLongTimeValid && (
            <Col {...COL_WIDTH_CONFIG.F}>
              <FormItem
                label="有效期至"
                name={`${submitPrefix}&permitEndTime`}
                rules={[{ required: gspEnabled, message: '请选择' }]}
                initialValue={data.permitEndTime ? moment(new Date(data.permitEndTime)) : undefined}
              >
                <DatePicker style={{ width: '100%' }} format={['YYYY-MM-DD', 'YYYY/MM/DD']} />
              </FormItem>
            </Col>
          )} */}

					<Col {...COL_WIDTH_CONFIG.F}>
						<FormItem
							label='长期有效'
							valuePropName='checked'
							name={`${submitPrefix}&isLongTimeValid_permitEndTime_permitBeginTime`}
							initialValue={isLongTimeValid}>
							<Checkbox onChange={handleLongTimeValidChekBoxChange}></Checkbox>
						</FormItem>
					</Col>

					<Col {...COL_WIDTH_CONFIG.C}>
						<FormItem
							label='注册地址'
							name={`${submitPrefix}&registeredAddress`}
							initialValue={data.registeredAddress}>
							<Input
								placeholder='请输入'
								maxLength={20}
							/>
						</FormItem>
					</Col>

					<Col {...COL_WIDTH_CONFIG.C}>
						<FormItem
							label=''
							name={`${submitPrefix}hasTree`}
							rules={[{ required: gspEnabled, message: '请选择' }]}
							initialValue={submitPrefixHasTree}>
							<Checkbox
								onChange={selectOnChange}
								checked={submitPrefixHasTree}
							/>{' '}
							医疗器械经营范围
							{/* <Radio.Group onChange={selectOnChange}>
                <Radio value={true}>有</Radio>
                <Radio value={false}>无</Radio>
              </Radio.Group> */}
						</FormItem>
					</Col>

					{form.getFieldValue(`${submitPrefix}hasTree`) && submitPrefixHasTree && (
						<>
							<Col {...COL_WIDTH_CONFIG.C}>
								<Tree
									onExpand={(value) => {
										if (value.length) {
											setIsshowKeys12(true);
										} else {
											setIsshowKeys12(false);
										}
									}}
									defaultExpandedKeys={isshowKeys12 ? ['12'] : []}>
									<Tree.TreeNode
										title='12版分类'
										key='12'>
										<Tree.TreeNode
											title=''
											key='1'></Tree.TreeNode>
									</Tree.TreeNode>
								</Tree>
								{isshowKeys12 && (
									<FormItem
										style={{ marginTop: '-30px', marginLeft: '20px' }}
										label=''
										rules={[
											{
												required: gspEnabled ? checkedKeys18 && checkedKeys18.length <= 0 : false,
												message: '请选择',
											},
										]}
										initialValue={checkedKeys12}
										name={`${submitPrefix}&tree12`}>
										<Tree
											checkable
											selectable={false}
											onCheck={treeCheck12}
											checkedKeys={checkedKeys12 || []}
											className='treeBox'>
											{renderTreeNodes12(goodsCategory12)}
										</Tree>
									</FormItem>
								)}
							</Col>
							<Col {...COL_WIDTH_CONFIG.C}>
								<Tree
									onExpand={(value) => {
										if (value.length) {
											setIsshowKeys18(true);
										} else {
											setIsshowKeys18(false);
										}
									}}
									defaultExpandedKeys={isshowKeys18 ? ['18'] : []}>
									<Tree.TreeNode
										title='18版分类'
										key='18'>
										<Tree.TreeNode
											title=''
											key='2'></Tree.TreeNode>
									</Tree.TreeNode>
								</Tree>
								{isshowKeys18 && (
									<FormItem
										style={{ marginTop: '-30px', marginLeft: '20px' }}
										label=''
										rules={[
											{
												required: gspEnabled ? checkedKeys12 && checkedKeys12.length <= 0 : false,
												message: '请选择',
											},
										]}
										initialValue={checkedKeys18}
										name={`${submitPrefix}&tree18`}>
										<Tree
											checkable
											selectable={false}
											onCheck={treeCheck18}
											checkedKeys={checkedKeys18 || []}
											className='treeBox'>
											{renderTreeNodes18(goodsCategory18)}
										</Tree>
									</FormItem>
								)}
							</Col>
						</>
					)}

					<Col {...COL_WIDTH_CONFIG.C}>
						<FormItem
							label='备注'
							initialValue={data.remark}
							name={`${submitPrefix}&remark`}>
							<Input.TextArea
								placeholder='请输入'
								maxLength={100}
								autoSize={{ minRows: 2, maxRows: 5 }}
							/>
						</FormItem>
					</Col>
				</Row>
			</Col>

			<Col {...COL_WIDTH_CONFIG.E}>
				<UpLoadFile
					form={form}
					required={gspEnabled}
					setIsshow={setIsshow}
					uploadApi={uploadFileApi}
					setIsSuccessfully={setIsSuccessfully}
					label={type === 'manufacturer' ? '生产许可证' : '经营许可证'}
					btnTxt={'上传' + (type === 'manufacturer' ? '生产许可证' : '经营许可证')}
					formName={submitPrefix + '&' + 'permitImgList'}
					initialValue={data.permitImgList}
				/>
			</Col>
		</Row>
	);
};

export default PermitLicense;
