import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import { colItem3 } from '@/constants/formLayout';
import { departmentAdd, departmentEdit, detailInfo, getTreeData } from '@/services/department';
import { getChildren, getParentPaths, getProvincesList } from '@/services/districts';
import { getCampuss } from '@/services/hospitalCampus';
import { notification } from '@/utils/ui';
import { Button, Card, Cascader, Form, Input, Modal, Select } from 'antd';
import { departmentType } from '@/constants/dictionary';
import { FC, useEffect, useState } from 'react';
import { history } from 'umi';
import { UpdateProps } from '../list/components/TableList';
import { ProFormColumns } from '@/components/SchemaForm';
import { BetaSchemaForm as SchemaForm } from '@ant-design/pro-form';

type province = DistrictController.ProvincesList[];

const AddList: FC<UpdateProps> = ({ global, ...props }) => {
	const handleType = props?.match.params.id ? 'edit' : 'add';
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [hospitalCampus, setHospitalCampus] = useState<HospitalCampusController.HospitalCampus[]>(
		[],
	); // 院区
	const [treeData, setTreeData] = useState<DepartmentController.DepartmentTreeList[]>([]); // 科室
	const [options, setOptions] = useState([]); //
	const [mergeName, setMergeName] = useState<string | undefined>(''); //
	const [lastMergeCode, setLastMergeCode] = useState<string | undefined>(); //
	const [detail, setDetail] = useState<DepartmentController.DepartmentTreeList>({});
	const [isShowModal, setIsShowModal] = useState<boolean>(false);
	const [form] = Form.useForm();

	// 加载区域数据
	const loadData = async (
		selectedOptions: Record<string, any>,
		cb: (res: Record<string, any>) => void,
	) => {
		if (!selectedOptions) return;
		const targetOption = selectedOptions[selectedOptions.length - 1];
		targetOption.loading = true;
		const res = await getChildren({ areaCode: targetOption.value });
		targetOption.loading = false;
		if (res && res.code === 0) {
			const optionChildren: any = res.data.map((el) => ({
				label: el.name,
				value: el.areaCode,
				mergerName: el.mergerName,
				isLeaf: el.isLeaf,
			}));

			targetOption.children = optionChildren;
			setOptions([...options]);
			if (cb) {
				cb(res);
			}
		}
	};

	//  选择区域的回调函数
	const onChangeAreaCode = (_value: any, selectedOptions: Record<string, any>[]) => {
		if (!selectedOptions || selectedOptions.length <= 0) {
			form.setFieldsValue({
				mergeName: null,
			});
			setMergeName('');
			return;
		}
		const mergeData = selectedOptions[selectedOptions.length - 1];
		setMergeName(mergeData.mergerName);
		setLastMergeCode(mergeData.value);
		form.setFieldsValue({
			mergeName: _value,
		});
	};

	// 循环回填所在地区
	const backfillArea = (selectedAreaCodes: province) => {
		let selectedOptions: DistrictController.District[] = [];
		const loop = (data: any[]) =>
			data.map((item: any) => {
				if (item.children) {
					loop(item.children);
					return;
				}
				if (item.value === selectedAreaCodes[selectedOptions.length]) {
					selectedOptions.push(item);
					loadData(selectedOptions, (res) => {
						if (res && res.code === 0) {
							loop(options);
						}
					});
				}
			});
		loop(options);
	};

	// 按顺序返回areaCode父层区域路径
	const getDistrictParentPaths = async (areaCode?: any) => {
		const res = await getParentPaths({ areaCode });
		if (res && res.code === 0) {
			let selectedAreaCodes: DistrictController.ProvincesList[] = [];
			if (res.data.length) {
				let data = res.data.reverse();
				data.map((el: any) => {
					selectedAreaCodes.push(el.areaCode);
				});
				backfillArea(selectedAreaCodes.slice(0, selectedAreaCodes.length));
			} else {
				options.forEach((province: any) => {
					if (province.value === areaCode) {
						selectedAreaCodes.push(areaCode);
					}
				});
			}
			selectedAreaCodes.push(areaCode);
			// 数组去重避免渲染AreaCode问题
			let newCodeList: any = [];
			selectedAreaCodes.forEach((item) => {
				if (!newCodeList.includes(item)) {
					newCodeList.push(item);
				}
			});
			form.setFieldsValue({
				mergeName: newCodeList,
			});
		}
	};

	// 详情
	const getDetail = async () => {
		const res = await detailInfo(props.match.params.id);
		if (res && res.code === 0) {
			const { data } = res;
			setDetail(data);
			form.setFieldsValue({
				name: data.name,
				address: data.address,
				contactName: data.contactName,
				contactPhone: data.contactPhone,
				hospitalCampusId: data.hospitalCampusId,
				parentId: data.parentId ? String(data.parentId) : undefined,
				remark: data.remark,
				deptType: data.deptType,
			});
			setMergeName(data.mergeName);
			setLastMergeCode(data.districtCode);
		}
	};

	// 院区
	const getHospitalCampuss = async () => {
		const res = await getCampuss();
		if (res && res.code === 0) {
			const hospitalList: Record<string, any>[] = res.data || [];
			setHospitalCampus(hospitalList);
			// 只有1个取值时自动选择
			if (hospitalList.length === 1 && handleType === 'add') {
				form.setFieldsValue({
					hospitalCampusId: hospitalList[0] && hospitalList[0].id,
				});
			}
		}
	};
	// 科室
	const getDepartmentTree = async () => {
		const res = await getTreeData();
		if (res && res.code === 0) {
			setTreeData(res.data);
		}
	};

	// 省
	const getProvinces = async () => {
		const res = await getProvincesList();
		if (res && res.code === 0) {
			const op: any = res.data.map((el) => ({
				label: el.name,
				value: el.areaCode,
				mergerName: el.mergerName,
				isLeaf: el.isLeaf,
			}));
			setOptions(op);
		}
	};

	//  提交
	const handleSubmit = () => {
		form.validateFields().then(async (values) => {
			setSubmitLoading(true);
			values.mergeName = mergeName;
			values.areaCode = lastMergeCode;
			if (handleType === 'edit') {
				values.id = props.match.params.id;
				const res = await departmentEdit(values);
				if (res && res.code === 0) {
					notification.success('操作成功');
					history.push(`/base_data/department`);
				}
			}
			if (handleType === 'add') {
				const res = await departmentAdd(values);
				if (res && res.code === 0) {
					notification.success('操作成功');
					if (!form.getFieldsValue()?.parentId) {
						history.push(`/base_data/department`);
						return;
					}
					setIsShowModal(true);
				}
			}
			setSubmitLoading(false);
		});
	};

	const onSwitchTo = () => {
		history.push({
			pathname: `/base_data/warehouse/add`,
			state: { params: form.getFieldsValue()?.name },
		});
	};

	const onCancel = () => {
		setIsShowModal(false);
		history.push(`/base_data/department`);
	};

	useEffect(() => {
		getHospitalCampuss();
		getDepartmentTree();
		getProvinces();
	}, []);

	useEffect(() => {
		if (handleType === 'edit') {
			getDetail();
		}
	}, [handleType]);

	// 联动回显
	useEffect(() => {
		if (detail.districtCode && options.length > 0) {
			getDistrictParentPaths(lastMergeCode || detail.districtCode);
		}
	}, [detail, options]);

	const columns: ProFormColumns = [
		{
			title: '科室名称',
			dataIndex: 'name',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
				rules: [{ required: true, message: '请输入科室名称' }],
			},
			fieldProps: {
				maxLength: 30,
			},
		},
		{
			title: '所属院区',
			dataIndex: 'hospitalCampusId',
			valueType: 'select',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
				rules: [{ required: true, message: '请选择所属院区' }],
			},
			fieldProps: {
				optionFilterProp: 'children',
				filterOption: (input: string, option: Record<string, any>) =>
					(option?.companyName as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0,
				options: hospitalCampus || [],
				showSearch: true,
				fieldNames: {
					label: 'name',
					value: 'id',
				},
			},
		},
		{
			title: '上级科室',
			dataIndex: 'parentId',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
			},
			renderFormItem: () => (
				<Select
					dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
					placeholder='请选择上级科室'
					allowClear
					showSearch
					optionLabelProp='label'
					optionFilterProp='label'>
					{treeData.map((department) => {
						return (
							<Select.Option
								key={department.id}
								label={department.name}
								disabled={department.id == props.match.params.id}>
								{department.name}
							</Select.Option>
						);
					})}
				</Select>
			),
		},
		{
			title: '所在区域',
			dataIndex: 'mergeName',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
				rules: [{ required: false, message: '请选择所在区域' }],
			},
			renderFormItem: () => (
				<Cascader
					placeholder='请选择所在区域'
					options={options || []}
					loadData={loadData as any}
					onChange={onChangeAreaCode}
					changeOnSelect
					getPopupContainer={(node) => node.parentNode}
				/>
			),
		},
		{
			title: '所在地址',
			dataIndex: 'address',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
				rules: [{ required: false, message: '请输入所在地址' }],
			},
			fieldProps: {
				placeholder: '请输入所在地址',
				maxLength: 100,
			},
		},
		{
			title: '联系人员姓名',
			dataIndex: 'contactName',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
			},
			fieldProps: {
				placeholder: '请输入联系人员姓名',
				maxLength: 30,
			},
		},
		{
			title: '联系人员电话',
			dataIndex: 'contactPhone',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
				rules: [
					{
						pattern: /^((\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14})|(1[3,4,5,7,8]\d{9})$/,
						message: '请输入正确格式',
					},
				],
			},
			fieldProps: {
				placeholder: '请输入联系人员电话',
				maxLength: 30,
			},
		},
		{
			title: '科室类型',
			dataIndex: 'deptType',
			valueType: 'select',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
				rules: [{ required: true, message: '请选择科室类型' }],
			},
			fieldProps: {
				labelWidth: 120,
				options: departmentType,
			},
		},
		{
			title: '备注',
			dataIndex: 'remark',
			colProps: {
				span: 24,
			},
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
			},
			renderFormItem: () => (
				<Input.TextArea
					rows={4}
					maxLength={100}
				/>
			),
		},
	];

	return (
		<div className='detail-page'>
			<div className='detail-breadcrumb'>
				<Breadcrumb config={['', ['', '/base_data/department'], '']} />
			</div>
			<Card
				bordered={false}
				className='mb6 card-mt2'>
				<SchemaForm
					layoutType='Form'
					columns={columns as any}
					form={form}
					scrollToFirstError
					grid
					layout='horizontal'
					submitter={{
						render: () => (
							<FooterToolbar>
								<Button
									onClick={() => history.goBack()}
									className='returnButton'>
									返回
								</Button>
								<Button
									type='primary'
									onClick={handleSubmit}
									loading={submitLoading}
									className='verifyButton'>
									确认操作
								</Button>
							</FooterToolbar>
						),
					}}
				/>
				<Modal
					destroyOnClose
					width={390}
					maskClosable={false}
					cancelText='取消'
					okText='确认'
					onOk={onSwitchTo}
					onCancel={onCancel}
					title={<span> </span>}
					visible={isShowModal}>
					<div
						className='content'
						style={{ height: '70px', fontSize: CONFIG_LESS['@font-size-base'] }}>
						科室创建成功，是否跳转页面&创建对应科室仓库？
					</div>
				</Modal>
			</Card>
		</div>
	);
};

export default AddList;
