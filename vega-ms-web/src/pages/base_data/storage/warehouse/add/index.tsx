import type { FC } from 'react';

import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import { colItem3 } from '@/constants/formLayout';
import { useWarehouseListAll } from '@/hooks/useWarehouseList';
import { getChildren, getParentPaths, getProvincesList } from '@/services/districts';
import { getDetail, itemAdd, itemEdit } from '@/services/storageAreas';
import { transformSBCtoDBC } from '@/utils';
import { notification } from '@/utils/ui';
import { Button, Card, Cascader, Form, Input } from 'antd';
import { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import { ProFormColumns } from '@/components/SchemaForm';
import { BetaSchemaForm as SchemaForm } from '@ant-design/pro-form';
import { yesOrNo } from '@/constants/dictionary';
interface Props {
	match: {
		params: {
			handleType: string;
			id: string;
		};
	};
}

const AddList: FC<Props> = (props) => {
	const { fields } = useModel('fieldsMapping');
	const handleType = props?.match?.params?.id ? 'edit' : 'add';
	const dictionary = JSON.parse(sessionStorage.getItem('dictionary') || '{}');
	const transitionStorageAreaName = (name: string) => {
		return dictionary.storage_area_type.filter((item: { text: string }) => item.text === name)[0]
			.value;
	};
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [options, setOptions] = useState<DistrictController.ProvincesList[]>([]);
	const [mergerName, setMergerName] = useState<string | undefined>('');
	const [lastMergeCode, setLastMergeCode] = useState<string | undefined>();
	const [detail, setDetail] = useState<StorageAreasController.GetDetailRuleParams>({});
	const [storageAreaType, setStorageAreaType] = useState<string>(
		transitionStorageAreaName('合格区'),
	);
	const [form] = Form.useForm();
	const warehouseList = useWarehouseListAll(true);

	// 省
	const getProvinces = async () => {
		const res = await getProvincesList();
		if (res && res.code === 0) {
			const op = res.data.map((el) => ({
				label: el.name,
				value: el.areaCode,
				mergerName: el.mergerName,
				isLeaf: el.isLeaf,
			}));
			setOptions(op);
		}
	};

	// 加载区域数据
	const loadData = async (
		selectedOptions: Record<string, any>[],
		cb: (res: Record<string, any>) => void,
	) => {
		const targetOption = selectedOptions[selectedOptions.length - 1];
		targetOption.loading = true;
		const res = await getChildren({ areaCode: targetOption.value });
		targetOption.loading = false;
		if (res && res.code === 0) {
			const optionChildren = res.data.map((el) => ({
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
	const onChangeAreaCode = (value: any, selectedOptions: Record<string, any>[]) => {
		if (!selectedOptions || selectedOptions.length <= 0) {
			form.setFieldsValue({
				mergerName: null,
			});
			setMergerName('');
			return;
		}
		const mergeData = selectedOptions[selectedOptions.length - 1];
		setMergerName(mergeData.mergerName);
		setLastMergeCode(mergeData.value);
		form.setFieldsValue({
			mergerName: value,
		});
	};

	// 提交
	const listSubmit = () => {
		form.validateFields().then(async (values) => {
			setSubmitLoading(true);
			try {
				values.mergerName = mergerName;
				if (handleType === 'edit') {
					values.id = props.match.params.id;
					const res = await itemEdit(transformSBCtoDBC(values));
					if (res && res.code === 0) {
						notification.success('编辑成功！');
						history.push({ pathname: `/base_data/storage`, state: { key: '1' } });
					}
				} else {
					const res = await itemAdd(transformSBCtoDBC(values));
					if (res && res.code === 0) {
						notification.success('新增成功！');
						history.push(`/base_data/storage`);
					}
				}
			} finally {
				setSubmitLoading(false);
			}
		});
	};

	// 循环回填所在地区
	const backfillArea = (selectedAreaCodes: Record<string, any>[]) => {
		const selectedOptions: Record<string, any>[] = [];
		const loop = (data: Record<string, any>) =>
			data.map((item: Record<string, any>) => {
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
	const getDistrictParentPaths = async (areaCode: string) => {
		const res = await getParentPaths({ areaCode });
		if (res && res.code === 0) {
			const selectedAreaCodes: Record<string, any> | string = [];
			if (res.data.length) {
				const data = res.data.reverse();
				data.map((el: DistrictController.ProvincesList) => {
					selectedAreaCodes.push(el.areaCode);
				});
				backfillArea(selectedAreaCodes.slice(0, selectedAreaCodes.length));
			} else {
				options.forEach((province: Record<string, any>) => {
					if (province.value === areaCode) {
						selectedAreaCodes.push(areaCode);
					}
				});
			}
			selectedAreaCodes.push(areaCode);
			// 数组去重避免渲染AreaCode问题
			let newCodeList: any = [];
			selectedAreaCodes.forEach((item: string) => {
				if (!newCodeList.includes(item)) {
					newCodeList.push(item);
				}
			});
			form.setFieldsValue({
				mergerName: newCodeList,
			});
		}
	};

	// 详情
	const getDetailInfo = async () => {
		const res = await getDetail(props.match.params.id);
		if (res && res.code === 0) {
			const data: StorageAreasController.GetDetailRuleParams = res.data;
			form.setFieldsValue({
				name: data.name,
				warehouseId: data.warehouseId,
				storageAreaType: data.storageAreaType,
				code: data.code,
				contact: data.contact,
				phone: data.phone,
				address: data.address,
				hasSmartCabinet: data.hasSmartCabinet,
				highValueSupported: data.highValueSupported,
				lowValueSupported: data.lowValueSupported,
				receivedGoods: data.receivedGoods,
				priorityLevel: data.priorityLevel === null ? 1 : data.priorityLevel,
				remark: data.remark,
			});
			setDetail(data);
			setMergerName(data.mergerName as string);
			setLastMergeCode(data.districtCode);
			setStorageAreaType(data.storageAreaType as string);
		}
	};

	useEffect(() => {
		getProvinces();
		if (handleType === 'edit') {
			getDetailInfo();
		}
	}, [handleType]);

	// 联动回显
	useEffect(() => {
		if (detail.districtCode && options.length > 0) {
			getDistrictParentPaths(lastMergeCode || detail.districtCode);
		}
	}, [detail, options]);

	const goBack = () => {
		history.push({ pathname: `/base_data/storage`, state: { key: '1' } });
	};

	const columns: ProFormColumns = [
		{
			title: '库房名称',
			dataIndex: 'name',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
				rules: [{ required: true, message: '请输入库房名称' }],
			},
			fieldProps: {
				placeholder: '请输入库房名称',
				maxLength: 30,
			},
		},
		{
			title: '所属仓库',
			dataIndex: 'warehouseId',
			valueType: 'select',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
				rules: [{ required: true, message: '请选择所属仓库' }],
			},
			fieldProps: {
				disabled: handleType === 'edit',
				optionFilterProp: 'children',
				filterOption: (input: string, option: Record<string, any>) =>
					option?.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
				options: warehouseList || [],
				showSearch: true,
				fieldNames: {
					label: 'name',
					value: 'id',
				},
			},
		},
		{
			title: '库房类型',
			dataIndex: 'storageAreaType',
			valueType: 'select',
			colProps: colItem3,
			formItemProps: {
				initialValue: transitionStorageAreaName('合格区'),
				labelCol: {
					flex: '120px',
				},
				rules: [{ required: true, message: '请选择库房类型' }],
			},
			fieldProps: {
				onChange: (value: string) => setStorageAreaType(value),
				options: dictionary.storage_area_type || [],
				fieldNames: {
					label: 'text',
					value: 'value',
				},
			},
		},
		{
			title: '库房编码',
			dataIndex: 'code',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
				rules: [{ required: true, message: '请输入库房编码' }],
			},
			fieldProps: {
				placeholder: '请输入库房编码',
				maxLength: 30,
			},
		},
		{
			title: '联系人员',
			dataIndex: 'contact',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
			},
			fieldProps: {
				placeholder: '请输入联系人员',
				maxLength: 30,
			},
		},
		{
			title: '联系电话',
			dataIndex: 'phone',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
				rules: [
					{
						pattern: /^((\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14})|(1[3,4,5,7,8]\d{9})$/,
						message: '请输入正确联系电话',
					},
				],
			},
			fieldProps: {
				placeholder: '请输入联系电话',
				maxLength: 30,
			},
		},
		{
			title: '所属地区',
			dataIndex: 'mergerName',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
				rules: [{ required: false, message: '请选择所属地区' }],
			},
			renderFormItem: () => (
				<Cascader
					placeholder='请选择所属地区'
					options={options || []}
					loadData={loadData as any}
					onChange={onChangeAreaCode}
					changeOnSelect
					getPopupContainer={(node) => node.parentNode}
				/>
			),
		},
		{
			title: '详细地址',
			dataIndex: 'address',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
				rules: [{ required: false, message: '请输入详细地址' }],
			},
			fieldProps: {
				placeholder: '请输入详细地址',
				maxLength: 100,
			},
		},
		{
			title: '推送优先级',
			dataIndex: 'priorityLevel',
			valueType: 'select',
			colProps: colItem3,
			hideInForm: storageAreaType !== transitionStorageAreaName('合格区'),
			formItemProps: {
				initialValue: 1,
				labelCol: {
					flex: '120px',
				},
				rules: [{ required: true, message: '请选择推送优先级' }],
				extra: (
					<span
						style={{ color: CONFIG_LESS['@c_hint'], fontSize: '12px', margin: '0 12px 0 24px' }}>
						*设置库房为科室配货/推送的优先级，默认为1，9为最高，0为不能配货推送
					</span>
				),
			},
			fieldProps: {
				options: [...Array(10).keys()].map((item) => ({
					label: item,
					value: item,
				})),
			},
		},
		{
			title: '包含智能货架',
			dataIndex: 'hasSmartCabinet',
			valueType: 'radio',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
				rules: [{ required: true, message: '请选择是否包含智能货架' }],
			},
			fieldProps: {
				options: yesOrNo,
			},
		},
		{
			title: '支持高值',
			dataIndex: 'highValueSupported',
			valueType: 'radio',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
				rules: [{ required: true, message: `请选择是否支持高值${fields.goods}` }],
			},
			fieldProps: {
				options: yesOrNo,
			},
		},
		{
			title: '支持低值',
			dataIndex: 'lowValueSupported',
			valueType: 'radio',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
				rules: [{ required: true, message: `请选择是否支持低值${fields.goods}` }],
			},
			fieldProps: {
				options: yesOrNo,
			},
		},
		{
			title: '是否收货库房',
			dataIndex: 'receivedGoods',
			valueType: 'radio',
			colProps: colItem3,
			hideInForm: storageAreaType !== transitionStorageAreaName('合格区'),
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
				rules: [{ required: true, message: '请选择是否收货库房' }],
			},
			fieldProps: {
				options: yesOrNo,
			},
		},
		{
			title: '备注',
			dataIndex: 'remark',
			colProps: colItem3,
			formItemProps: {
				labelCol: {
					flex: '120px',
				},
			},
			renderFormItem: () => (
				<Input.TextArea
					placeholder=''
					maxLength={100}
				/>
			),
		},
	];

	return (
		<div className='detail-page'>
			<div className='detail-breadcrumb'>
				<Breadcrumb
					config={[
						'',
						['', { pathname: '/base_data/storage', state: { key: '1' } }],
						['', { pathname: '/base_data/storage', state: { key: '1' } }],
						``,
					]}
				/>
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
									onClick={goBack}
									className='returnButton'>
									返回
								</Button>
								<Button
									type='primary'
									onClick={listSubmit}
									loading={submitLoading}
									className='verifyButton'>
									确认操作
								</Button>
							</FooterToolbar>
						),
					}}
				/>
			</Card>
		</div>
	);
};

export default AddList;
