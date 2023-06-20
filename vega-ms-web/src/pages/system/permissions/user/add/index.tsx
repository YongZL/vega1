import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import { useDistributorList } from '@/hooks/useDistributorList';
import { useUserTypeList } from '@/hooks/useUserTypeList';
import { useStoreRoomList } from '@/hooks/useWarehouseList';
import { getTreeData } from '@/services/department';
import { getRoleList } from '@/services/role';
import { uploadFileApi } from '@/services/upload';
import { addUser, eaitUser, queryDetail } from '@/services/users';
import { genTreeData } from '@/utils/dataUtil';
import { beforeUpload } from '@/utils/file';
import { errMsg, patterns } from '@/utils/file/uploadValid';
import { notification } from '@/utils/ui';
import { getUrl } from '@/utils/utils';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Select, TreeSelect, Upload } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';
import { history, useModel } from 'umi';
import DetailModal from '../components/DetailModal';

const FormItem = Form.Item;
const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 6 },
		lg: { span: 6 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 18 },
		lg: { span: 18 },
		md: { span: 14 },
	},
};

const formItemSingle = {
	labelCol: {
		xl: { span: 3 },
		lg: { span: 6 },
	},
	wrapperCol: {
		xl: { span: 17 },
		lg: { span: 17 },
	},
};

const colProps = {
	sm: 24,
	md: 8,
};

const CheckModal: FC<{ match: { params: { id: number } } }> = ({ match }) => {
	const { params } = match;
	const id = params.id;
	const isEdit = !!params.id;
	const [form] = Form.useForm();
	const distributorOption = useDistributorList();
	const [loading, setLoading] = useState<boolean>(false);
	const [currentSelectedType, setCurrentSelectedType] = useState<string>('');
	const [details, setDetails] = useState<Partial<UsersController.UserDateItem>>({});
	const [treeData, setTreeData] = useState<DepartmentController.DepartmentTreeList[]>([]);
	const [centerDepartmentIds, setCenterDepartmentIds] = useState<number[]>([]);
	const [roles, setRoles] = useState<RoleController.RoleRecord[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const [backPassword, setBackPassword] = useState<string>('');
	const { fields } = useModel('fieldsMapping');
	const [departmentIds, setDepartmentIds] = useState<number[]>([]);
	const { storeRoomList, getStorageAreas } = useStoreRoomList();
	const { roleType, roleTypeTextMap } = useUserTypeList();

	useEffect(() => {
		function getCenterDepartmentIds(list: DepartmentController.DepartmentTreeList[]): number[] {
			if (!list || !list.length) {
				return [];
			}
			return list.reduce((prev: number[], next) => {
				let cIds: number[] = [];
				if (next.children && next.children.length > 0) {
					cIds = getCenterDepartmentIds(next.children);
				}
				const currentIds: number[] = next.isCenterWarehouse ? [next.id as number] : [];
				return [...prev, ...currentIds, ...cIds];
			}, []);
		}

		const getDepartmentsTreeData = async () => {
			let res = await getTreeData();
			if (res && res.code === 0) {
				const ids: number[] = getCenterDepartmentIds(res.data);
				const result: DepartmentController.DepartmentTreeList[] = genTreeData(res.data);
				result.map((item) => {
					item.disabled = true;
					return item;
				});
				setCenterDepartmentIds(ids);
				setTreeData(result);
			}
		};
		getDepartmentsTreeData();
		getStorageAreas({ isCenterWarehouse: true });
	}, []);

	useEffect(() => {
		if (WEB_PLATFORM === 'DS' && currentSelectedType !== 'distributor') {
			form.resetFields([`${currentSelectedType}StorageAreaIds`]);
		}
	}, [currentSelectedType]);

	useEffect(() => {
		const getDetail = async (id: number) => {
			let res = await queryDetail(id);
			if (res && res.code === 0) {
				let detail: UsersController.UserDateItem = res.data || {};
				let rolesText = '';
				let roleIds: any[number] = [];
				detail.roles.map((el: { name: string; id: number }, index: number) => {
					if (index + 1 === detail.roles.length) {
						rolesText = `${rolesText}${el.name}`;
					} else {
						rolesText = `${rolesText}${el.name}、`;
					}
					roleIds.push(el.id);
				});
				detail.roleIds = roleIds;
				detail.rolesText = rolesText;
				setDetails(detail);
				setCurrentSelectedType(detail.type as string);
				form.resetFields();

				if (detail.type === 'operator') {
					form.setFieldsValue({ operatorStorageAreaIds: detail.storageAreaIds || [] });
				} else if (detail.type === 'hospital') {
					setDepartmentIds(detail.contactIds || []);
					form.setFieldsValue({ hospitalStorageAreaIds: detail.storageAreaIds || [] });
				}
				if (isEdit) {
					onChangeType(detail.type as string, true);
				}
			}
			setLoading(false);
		};
		if (match.params.id) {
			setLoading(true);
			getDetail(match.params.id);
		}
	}, [match.params.id]);

	const onFinish = async (
		values: UsersController.AddUserRuleParams & {
			operatorStorageAreaIds?: number[];
			hospitalStorageAreaIds?: number[];
		},
	) => {
		if (loading) {
			return;
		}
		setLoading(true);
		try {
			values.profileImg = details.profileImg;
			if (values.type === 'operator') {
				// 共享服务类型没有contactId
				delete values.contactId;
			} else {
				values.contactId = Array.isArray(values.contactId) ? values.contactId : [values.contactId];
			}

			if (WEB_PLATFORM === 'DS') {
				const storageAreaIds = values.operatorStorageAreaIds || values.hospitalStorageAreaIds;

				if (storageAreaIds && storageAreaIds.length > 0) {
					delete values.operatorStorageAreaIds;
					delete values.hospitalStorageAreaIds;
					values.storageAreaIds = storageAreaIds;
				}
			}
			if (isEdit) {
				let res = await eaitUser(id, values);
				if (res && res.code === 0) {
					notification.success('编辑成功');
					history.push(`/system/permissions/user`);
				}
			} else {
				const res = await addUser(values);
				if (res && res.code == 0) {
					notification.success('新增成功');
					setBackPassword(res.data || '');
					setVisible(true);
				}
			}
		} finally {
			setLoading(false);
		}
	};
	const onChangeType = async (value: string, isFirst: boolean) => {
		let res = await getRoleList({ type: value, pageSize: 999, pageNum: 0, status: true });
		if (res && res.code === 0) {
			setRoles(res.data.rows);
			setCurrentSelectedType(value);
			// 取消contactId选中状态
			if (!isFirst) {
				form.setFieldsValue({
					contactId: undefined,
					roleIds: [],
				});
			}
		}
	};

	/** 上传图片回调 */
	const handleImageChange = (prop: string, uploadLoading: string, info: Record<string, any>) => {
		let file = info.file;
		let status = file.status;
		let obj = {};
		if (status === 'uploading') {
			setLoading(true);
		}

		if (patterns.test(file.name)) {
			notification.error(errMsg);
			return;
		}

		if (status === 'done') {
			if (file.response) {
				if (typeof file.response === 'object') {
					if (file.response.code === 0) {
						let detail = { ...details };
						detail[prop] = file.response.data ? file.response.data.urlName : file.response;
						setDetails(detail);
						setLoading(false);
					} else {
						notification.error(file.response.msg);
						setLoading(false);
					}
				} else {
					let detail = { ...details };
					detail[prop] = file.response.data ? file.response.data.urlName : file.response;
					setDetails(detail);
					obj[uploadLoading] = false;
					setLoading(false);
				}
			}
		}
	};

	const getStorageAreaItem = (type: 'hospital' | 'operator' = 'operator') => (
		<Col {...colProps}>
			<FormItem
				label='所属库房'
				rules={[{ required: true, message: '请选择所属库房' }]}
				name={`${type}StorageAreaIds`}>
				<Select
					placeholder='请选择库房'
					getPopupContainer={(node) => node.parentNode}
					showSearch
					mode='multiple'
					filterOption={(input, option: any) =>
						option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
					}
					options={storeRoomList}></Select>
			</FormItem>
		</Col>
	);

	const isHasCenterDepartment = useMemo(() => {
		if (!centerDepartmentIds.length || !departmentIds.length) {
			return false;
		}
		for (const id of departmentIds) {
			if (centerDepartmentIds.includes(id)) {
				return true;
			}
		}
		return false;
	}, [centerDepartmentIds, departmentIds]);

	return (
		<div style={{ margin: ' -20px -28px', padding: ' 0 4px 8px' }}>
			<div style={{ background: CONFIG_LESS['@bgc_table'] }}>
				<Breadcrumb config={['', ['', '/system/permissions/user'], '']} />
			</div>
			<Card
				bordered={false}
				style={{ marginTop: 2 }}>
				<Form
					form={form}
					onFinish={onFinish}
					{...formItemLayout}>
					<Row style={{ width: '75%', float: 'left' }}>
						{isEdit && (
							<Col {...colProps}>
								<FormItem
									label='用户类型'
									style={{ margin: 0 }}>
									<span>{roleTypeTextMap[details.type as string]}</span>
								</FormItem>
							</Col>
						)}
						{!isEdit && (
							<Col {...colProps}>
								<FormItem
									label='用户类型'
									rules={[{ required: true, message: '请选择用户类型' }]}
									name='type'
									initialValue={details.type}>
									<Select
										placeholder='请选择用户类型'
										getPopupContainer={(node) => node.parentNode}
										onChange={(value) => onChangeType(value, false)}
										options={roleType}
									/>
								</FormItem>
							</Col>
						)}
						{/* 用户类型为共享服务时，所属库房展示 */}
						{WEB_PLATFORM === 'DS' && currentSelectedType === 'operator' && getStorageAreaItem()}
						{currentSelectedType === 'distributor' && (
							<Col {...colProps}>
								<FormItem
									label={fields.distributor}
									rules={[{ required: true, message: `请选择${fields.distributor}` }]}
									name='contactId'
									initialValue={isEdit && details.contactIds}>
									<Select
										placeholder={`请选择${fields.distributor}`}
										getPopupContainer={(node) => node.parentNode}
										showSearch
										filterOption={(input, option: any) =>
											option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										options={distributorOption}
										showArrow
										mode='multiple'></Select>
								</FormItem>
							</Col>
						)}
						{['hospital'].includes(currentSelectedType) && (
							<Col {...colProps}>
								<FormItem
									label='所属科室'
									rules={[{ required: true, message: '请选择所属科室' }]}
									name='contactId'
									initialValue={details.contactIds}>
									<TreeSelect
										dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
										treeData={treeData}
										treeDataSimpleMode={false}
										treeNodeFilterProp='title'
										placeholder='请选择所属科室'
										allowClear
										showSearch
										multiple
										onChange={(value) => setDepartmentIds(value)}
										treeDefaultExpandedKeys={
											treeData.length > 0 ? ([treeData[0].key] as React.Key[]) : []
										}
									/>
								</FormItem>
							</Col>
						)}
						{/* 用户类型为医院并且所属科室有中心库时展示 */}
						{WEB_PLATFORM === 'DS' &&
							currentSelectedType === 'hospital' &&
							isHasCenterDepartment &&
							getStorageAreaItem('hospital')}
						<Col {...colProps}>
							<FormItem
								label='用户权限'
								rules={[{ required: true, message: '请选择用户权限' }]}
								name='roleIds'
								initialValue={details.roleIds}>
								<Select
									disabled={!currentSelectedType}
									mode='multiple'
									placeholder='请选择用户权限'
									getPopupContainer={(node) => node.parentNode}
									filterOption={(input, option: any) =>
										option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
									}
									showSearch
									showArrow>
									{roles.map((el: Record<string, any>) => {
										return (
											<Select.Option
												value={el.id}
												key={el.id}>
												{el.name}
											</Select.Option>
										);
									})}
								</Select>
							</FormItem>
						</Col>
						<Col {...colProps}>
							<FormItem
								label='用户姓名'
								rules={[{ required: true, message: '请输入用户姓名' }]}
								name='name'
								initialValue={details.name}>
								<Input
									placeholder='请输入用户姓名'
									maxLength={20}
								/>
							</FormItem>
						</Col>
						<Col {...colProps}>
							<FormItem
								label='登录账号'
								rules={[{ required: true, message: '请输入登录账号' }]}
								name='loginPhone'
								initialValue={details.loginPhone}>
								<Input
									placeholder='请输入登录账号'
									maxLength={20}
								/>
							</FormItem>
						</Col>
						<Col {...colProps}>
							<FormItem
								label='电子邮箱'
								rules={[
									{ required: false, message: '请输入电子邮箱' },
									{ type: 'email', message: '请输入正确格式！' },
								]}
								name='email'
								initialValue={details.email}>
								<Input placeholder='请输入电子邮箱' />
							</FormItem>
						</Col>
						<Col {...colProps}>
							<FormItem
								label='手机号码'
								rules={[
									{
										pattern: /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/,
										message: '请输入正确格式',
									},
								]}
								name='phoneNumber'
								initialValue={details.phoneNumber}>
								<Input
									placeholder='请输入手机号码'
									maxLength={11}
								/>
							</FormItem>
						</Col>
						<Col
							sm={24}
							md={19}
							style={{ float: 'right' }}>
							<FormItem
								label='备注（选填）'
								name='remark'
								{...formItemSingle}
								initialValue={details.remark}>
								<Input.TextArea
									rows={4}
									maxLength={100}
								/>
							</FormItem>
						</Col>
					</Row>
					<Row style={{ width: '20%', float: 'right' }}>
						<Col style={{ margin: 'auto', borderLeft: ` 1px solid ${CONFIG_LESS['@bd_D9D9D9']}` }}>
							<FormItem
								label='头像'
								name='profileImg'
								initialValue={details.profileImg}
								extra='JPG 或 PNG 建议尺寸为500*500 大小不超过1M'>
								<Upload
									className='avatar-uploader'
									name='file'
									accept='/*'
									showUploadList={false}
									action={`${getUrl()}${uploadFileApi}`}
									onChange={(info) => {
										handleImageChange('profileImg', 'uploadLoading', info);
									}}
									beforeUpload={beforeUpload}
									withCredentials={true}
									headers={{ 'X-AUTH-TOKEN': sessionStorage.getItem('x_auth_token') || '' }}>
									{details.profileImg ? (
										<div style={{ width: 128, height: 128 }}>
											<img
												className='img-upload'
												src={`${getUrl()}${details.profileImg}`}
												alt=' '
											/>
										</div>
									) : (
										<div className='avatar-uploader-trigger'>
											<div style={{ marginLeft: '40%', width: 128, height: 110, marginTop: '18%' }}>
												<PlusOutlined />
												<p style={{ fontSize: 16, marginTop: 5, marginLeft: '-16%' }}>上传图片</p>
											</div>
										</div>
									)}
								</Upload>
							</FormItem>
						</Col>
					</Row>
					<FooterToolbar>
						<Button
							onClick={() => history.goBack()}
							className='returnButton'>
							返回
						</Button>
						<Button
							type='primary'
							htmlType='submit'
							loading={loading}
							className='handleSubmit verifyButton'>
							{loading ? '正在提交...' : '确认操作'}
						</Button>
					</FooterToolbar>
				</Form>
			</Card>
			<DetailModal
				trigger={<a></a>}
				modal={{}}
				backPassword={backPassword}
				visible={visible}
				setVisibles={setVisible}
			/>
		</div>
	);
};
export default CheckModal;
