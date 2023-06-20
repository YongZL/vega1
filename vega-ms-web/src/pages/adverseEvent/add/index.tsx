import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import type { ProColumns } from '@/components/ProTable/typings';
import { searchFormItem4 } from '@/constants/formLayout';
import { createAdd, getDetail } from '@/services/adverseEvent';
import { formatStrConnect } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Form, Row } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import FormModal from './formModal';

const AddPage: React.FC<{}> = () => {
	const [form] = Form.useForm();
	const { companyType, id, pageType } = history.location.state as any;
	let disabled = pageType !== 'add' ? true : false;
	const [result, setResult] = useState<AdverseEvent.QueryDetail>({});
	const [rejectlist, setRejectlist] = useState<string>('');
	const { fields } = useModel('fieldsMapping');

	useEffect(() => {
		const detailData = async () => {
			let res: ResponseResult<AdverseEvent.QueryDetail> = await getDetail({ id: id });
			if (res && res.code == 0) {
				let resul = res.data;
				resul.createdBy = resul.createdBy || sessionStorage.useName;
				for (let key in resul) {
					let formValue = resul[key];
					let arr = [
						'adverseDate',
						'productTime',
						'expirationTime',
						'eventTime',
						'findProblemTime',
						'instrumentUseTime',
					];
					if (formValue && arr.includes(key)) {
						formValue = moment(formValue);
					}
					form.setFieldsValue({
						[`${key}`]: formValue,
					});
					if (key == 'auditStatus' && formValue == 2) {
						// let reject = document.getElementById('reject');
						console.log(resul.returnedDescription, resul, 123123);

						// if (resul.returnedDescription) {
						setTimeout(() => {
							setRejectlist(resul.returnedDescription as string);
							// reject.value = resul.returnedDescription;
						}, 400);
						// }
					}
				}
				setTimeout(() => {
					setResult(resul);
				}, 300);
			}
		};
		if (id) detailData();
	}, [id]);

	if (pageType && pageType == 'add') {
		form.setFieldsValue({
			adverseCode: '-',
			adverseDate: moment(new Date()),
			createdBy: sessionStorage.useName,
			companyName: sessionStorage.hospital_name,
		});
	}

	const getSelectTableRow = (record: any) => {
		const { name, registrationNum, model, specification, materialCategory, goodsGroupType } =
			record;
		form.setFieldsValue({
			model: model || undefined,
			productName: name,
			registrationCode: registrationNum,
			materialCategory: materialCategory,
			specification: specification,
			managementType: goodsGroupType,
		});
	};

	const columns: ProColumns<NewGoodsTypesController.GoodsRecord>[] = [
		{
			title: fields.goodsCode,
			dataIndex: 'materialCode',
			key: 'materialCode',
			width: 150,
			ellipsis: true,
		},
		{
			title: '注册证编号',
			dataIndex: 'registrationNum',
			key: 'registrationNum',
			width: 150,
			ellipsis: true,
		},
		{
			title: '产品名称',
			dataIndex: 'name',
			key: 'name',
			width: 150,
			ellipsis: true,
		},
		{
			title: '通用名',
			dataIndex: 'commonName',
			key: 'commonName',
			width: 150,
			hideInSearch: true,
			render: (text) => <span>{text || '-'}</span>,
		},
		{
			title: '规格/型号',
			dataIndex: 'specification',
			key: 'specification',
			ellipsis: true,
			width: 150,
			hideInSearch: true,
			render: (text, record) => {
				return <span>{formatStrConnect(record, ['specification', 'model'])}</span>;
			},
		},
		{
			title: '生产厂家',
			dataIndex: 'manufacturerName',
			key: 'manufacturerName',
			width: 150,
			ellipsis: true,
			hideInSearch: true,
		},
		{
			title: fields.distributor,
			dataIndex: 'custodianName',
			key: 'custodianName',
			width: 150,
			ellipsis: true,
			hideInSearch: true,
		},
	];

	const onFinish = async (value: any) => {
		22;
		const {
			adverseDate,
			productTime,
			expirationTime,
			eventTime,
			findProblemTime,
			instrumentUseTime,
			createdBy,
			auditStatus,
		} = value;
		if (createdBy) {
			value.createdBy = Number(sessionStorage.userId);
		}
		if (adverseDate) {
			value.adverseDate = moment(adverseDate).valueOf();
		}

		if (productTime) {
			value.productTime = moment(productTime).valueOf();
		}

		if (expirationTime) {
			value.expirationTime = moment(expirationTime).valueOf();
		}

		if (eventTime) {
			value.eventTime = moment(eventTime).valueOf();
		}

		if (findProblemTime) {
			value.findProblemTime = moment(findProblemTime).valueOf();
		}

		if (instrumentUseTime) {
			value.instrumentUseTime = moment(instrumentUseTime).valueOf();
		}
		if (auditStatus == 2) {
			value.returnedDescription = document.getElementById('reject')?.value;
		}
		let res = await createAdd(value);
		if (res && res.code == 0) {
			notification.success('成功');
			history.goBack();
		}
	};

	//设置禁用日期
	const disabledDate = (current: any) => {
		return current.valueOf() > Number(moment().startOf('day')) + 24 * 60 * 60 * 1000;
	};

	let pageObj = {
		company: {
			title: pageType !== 'add' && '使用单位、经营企业和个人医疗器械不良事件报告表',
			breadCrumbTitle: '单位/企业上报',
		},
		personal: {
			title: '上市许可持有人医疗器械不良事件报告表',
			breadCrumbTitle: '持有人上报',
		},
	};
	const baseInfoColumn = [
		{
			type: 'input',
			name: 'adverseCode',
			label: '报告编码',
			// required:true,
			disabled: true,
			result: result.adverseCode || '-',
			pattern: new RegExp(/^.{0,120}$/),
			message: '长度不可超过120个字符',
		},
		{
			type: 'datePicker',
			name: 'adverseDate',
			label: ' 提交报告日期',
			isOffset: true,
			disabledDate: disabledDate,
			result: result.adverseDate,
			disabled,
		},
		{
			type: 'input',
			name: 'createdBy',
			label: '报告人',
			disabled: disabled,
			result: result.createdBy,
			pattern: new RegExp(/^.{0,30}$/),
			message: '长度不可超过30个字符',
			// required:true,
		},
		{
			type: 'input',
			name: 'companyName',
			label: '单位名称',
			disabled: disabled,
			result: result.companyName,
			pattern: new RegExp(/^.{0,30}$/),
			message: '长度不可超过30个字符',
		},
		{
			type: 'input',
			name: 'companyAddress',
			label: '联系地址',
			//required:true,
			disabled: disabled,
			result: result.companyAddress,
			pattern: new RegExp(/^.{0,120}$/),
			message: '长度不可超过120个字符',
		},
		{
			type: 'input',
			name: 'name',
			label: '联系人',
			disabled: disabled,
			result: result.name,
			pattern: new RegExp(/^.{0,20}$/),
			message: '长度不可超过20个字符',
		},
		{
			type: 'input',
			name: 'phone',
			label: '联系电话',
			//required:true,
			disabled: disabled,
			result: result.phone,
			pattern: new RegExp(/^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/),
			message: '请输入正确的手机号格式',
		},
		{
			type: 'radioGroup',
			label: ' 发生地点',
			data: [
				{ value: '境内', text: '境内' },
				{ value: '境外', text: '境外' },
			],
			reportType: 'personal',
			disabled,
		},
		{
			type: 'input',
			label: '发生地',
			name: 'adverseLocality',
			reportType: 'company',
			disabled: disabled,
			result: result.adverseLocality,
			pattern: new RegExp(/^.{0,120}$/),
			message: '长度不可超过120个字符',
		},
	];

	const medicalTreatmentColumn = [
		{
			type: 'selectTable',
			name: 'productName',
			label: '产品名称',
			required: !disabled,
			getSelectTableRow: getSelectTableRow,
			columns: columns,
			disabled: disabled,
			result: result.productName,
		},
		{
			type: 'input',
			name: 'registrationCode',
			label: '注册证编号',
			disabled: disabled,
			result: result.registrationCode,
			pattern: new RegExp(/^.{0,120}$/),
			message: '长度不可超过120个字符',
		},
		{
			type: 'input',
			name: 'model',
			label: '型号',
			//required:true,
			disabled: disabled,
			result: result.model,
			pattern: new RegExp(/^.{0,120}$/),
			message: '长度不可超过120个字符',
		},
		{
			type: 'input',
			name: 'specification',
			label: '规格',
			//required:true,
			disabled: disabled,
			result: result.specification,
			pattern: new RegExp(/^.{0,120}$/),
			message: '长度不可超过120个字符',
		},
		{
			type: 'radioGroup',
			label: ' 产地',
			name: 'localityOfGrowth',
			data: [
				{ value: 0, text: '进口' },
				{ value: 1, text: '国产' },
				{ value: 2, text: '港澳台' },
			],
			disabled,
			isButton: true,
			result: result.localityOfGrowth,
		},
		{
			type: 'radioGroup',
			label: ' 管理类别',
			name: 'managementType',
			data: [
				{ value: 'Ⅲ', text: 'III类' },
				{ value: 'Ⅱ', text: 'II类' },
				{ value: 'Ⅰ', text: 'I类' },
			],
			disabled,
			isButton: true,
			result: result.managementType,
		},
		{
			type: 'radioGroup',
			name: 'productType',
			label: '产品类别',
			data: [
				{ value: 1, text: '有源' },
				{ value: 2, text: '无源' },
				{ value: 3, text: '体外诊断试剂' },
			],
			disabled,
			isButton: true,
			result: result.productType,
		},
		{
			type: 'input',
			name: 'productNumber',
			label: '产品批号',
			disabled: disabled,
			result: result.productNumber,
			pattern: new RegExp(/^.{0,16}$/),
			message: '长度不可超过16个字符',
		},
		{
			type: 'input',
			name: 'productCode',
			label: '产品编号',
			disabled: disabled,
			max: 120,
			//required:true,
			result: result.productCode,
			pattern: new RegExp(/^[^\u4e00-\u9fa5 | （）]+$/),
			message: '产品编号格式错误',
		},
		{
			type: 'input',
			name: 'udi',
			label: 'UDI',
			disabled: disabled,
			max: 120,
			//required:true,
			result: result.udi,
			pattern: new RegExp(/^[^\u4e00-\u9fa5 | （）]+$/),
			message: 'UDI格式不正确 ',
		},
		{
			type: 'datePicker',
			name: 'productTime',
			label: ' 生产日期',
			disabled,
			//required:true,
		},
		{
			type: 'datePicker',
			name: 'expirationTime',
			label: ' 有效期至',
			disabled,
		},
		{
			type: 'input',
			name: 'approvalName',
			label: '上市许可持有人名称',
			reportType: 'company',
			disabled: disabled,
			result: result.approvalName,
			pattern: new RegExp(/^.{0,20}$/),
			message: '长度不可超过20个字符',
		},
	];

	//不良事件情况
	let adverseEventColumn = [
		{
			type: 'datePicker',
			name: 'eventTime',
			label: ' 事件发生日期',
			required: !disabled,
			disabledDate: disabledDate,
			disabled,
			result: result.eventTime,
		},
		{
			type: 'datePicker',
			name: 'findProblemTime',
			label: '发现或获知日期',
			disabled,
			result: result.findProblemTime,
		},
		{
			type: 'radioGroup',
			name: 'causeHurt',
			label: '伤害',
			data: [
				{ value: 1, text: '死亡' },
				{ value: 2, text: '严重伤害' },
				{ value: 3, text: '其他' },
			],
			disabled,
		},
		{
			type: 'input',
			name: 'hurtPhenomenon',
			label: '伤害表现',
			disabled: disabled,
			result: result.hurtPhenomenon,
			pattern: new RegExp(/^.{0,120}$/),
			message: '长度不可超过120个字符',
		},
		{
			type: 'input',
			name: 'instrumentPhenomenon',
			label: '器械故障表现',
			disabled: disabled,
			result: result.instrumentPhenomenon,
			pattern: new RegExp(/^.{0,120}$/),
			message: '长度不可超过120个字符',
		},
		{
			type: 'input',
			name: 'hurtName',
			label: '姓名',
			//required:true,
			disabled: disabled,
			result: result.hurtName,
			pattern: new RegExp(/^.{0,30}$/),
			message: '长度不可超过30个字符',
		},
		{
			type: 'input',
			name: 'hurtAge',
			label: '年龄',
			//required:true,
			disabled: disabled,
			result: result.hurtAge,
			pattern: new RegExp(/^((1[0-5])|[1-9])?\d$/),
			message: '年龄格式错误',
		},
		{
			type: 'radioGroup',
			name: 'hurtSex',
			label: '性别',
			data: [
				{ value: '男', text: '男' },
				{ value: '女', text: '女' },
			],
			disabled,
		},
		{
			type: 'input',
			name: 'medicalNum',
			label: '病历号',
			disabled: disabled,
			result: result.medicalNum,
			pattern: new RegExp(/^.{0,120}$/),
			message: '长度不可超过120个字符',
			//required:true,
		},
		{
			type: 'input',
			name: 'medicalHistory',
			label: '既往病史',
			disabled: disabled,
			result: result.medicalHistory,
			pattern: new RegExp(/^.{0,120}$/),
			message: '长度不可超过120个字符',
		},
		// {
		//   type:'input',
		//   name:'',
		//   label:'器械故障表现',
		//   reportType:'company',
		// }
	];
	//使用情况
	let useColumn = [
		{
			type: 'input',
			name: 'drugAction',
			label: '预期治疗疾病或作用',
			disabled: disabled,
			result: result.drugAction,
			pattern: new RegExp(/^.{0,120}$/),
			message: '长度不可超过120个字符',
		},
		{
			type: 'datePicker',
			name: 'instrumentUseTime',
			label: '器械使用日期',
			disabled,
			result: result.instrumentUseTime,
			//required:true,
		},
		{
			type: 'radioGroup',
			label: '使用场所',
			name: 'useSite',
			data: [
				{ value: 1, text: '医疗机构' },
				{ value: 2, text: '家庭' },
				{ value: 3, text: '其他' },
			],
			//required:true,
			disabled,
			result: result.useSite,
		},
		{
			type: 'input',
			name: 'useProcess',
			label: ' 使用过程',
			disabled: disabled,
			result: result.useProcess,
			pattern: new RegExp(/^.{0,120}$/),
			message: '长度不可超过120个字符',
		},
		{
			type: 'input',
			name: 'useCondition',
			label: ' 合并用药/械情况',
			disabled: disabled,
			result: result.useCondition,
			pattern: new RegExp(/^.{0,120}$/),
			message: '长度不可超过120个字符',
		},
	];

	//事件调查
	let eventColumn = [
		{
			type: 'radioGroup',
			label: '是否开展调查',
			data: [
				{ value: '是', text: '是' },
				{ value: '否', text: '否' },
			],
			disabled,
		},
		{
			type: 'input',
			label: ' 若是，调查情况',
		},
	];

	//评价结果
	let appraisetColumn = [
		{
			type: 'radioGroup',
			label: '关联性评价',
			data: [
				{ value: '与产品有关', text: '与产品有关' },
				{ value: '与产品无关', text: '与产品无关' },
				{ value: '无法确定', text: '无法确定' },
			],
			disabled,
		},
		{
			name: 'reason',
			type: 'input',
			label: '事件原因分析',
			//required:true,
			disabled: disabled,
		},
		{
			type: 'radioGroup',
			label: ' 是否开展风险评价',
			data: [
				{ value: true, text: '是' },
				{ value: false, text: '否' },
			],
			disabled,
		},
	];
	//控制措施
	let controlColumn = [
		{
			type: 'radioGroup',
			label: '采取控制措施',
			data: [
				{ value: true, text: '是' },
				{ value: false, text: '否' },
			],
			disabled,
		},
		{
			type: 'input',
			label: '若是，控制措施',
			disabled: disabled,
		},
		{
			type: 'input',
			label: ' 若是，原因',
			disabled: disabled,
		},
	];
	//错误误报
	let errorColumn = [
		{
			type: 'radioGroup',
			label: '错误误报',
			data: [
				{ value: true, text: '是' },
				{ value: false, text: '否' },
			],
			disabled,
		},
	];
	//报告合并
	let reportColumn = [
		{
			type: 'radioGroup',
			label: '报告合并',
			data: [
				{ value: true, text: '是' },
				{ value: false, text: '否' },
			],
			disabled,
		},
	];
	//报告审核情况
	let auditingColumn = [
		{
			type: 'radioInputGroup',
			label: '持有人所在地级市中心审核意见',
			data: [
				{ value: true, text: '同意', marginRight: '20%' },
				{ value: false, text: '退回' },
			],
			disabled,
		},
		{
			type: 'radioInputGroup',
			label: '持有人所在地省级中心评价结果审核意见',
			data: [
				{ value: true, text: '同意', marginRight: '20%' },
				{ value: false, text: '退回' },
			],
			disabled,
		},
		{
			type: 'radioInputGroup',
			label: '国家中心复核意见',
			data: [
				{ value: true, text: '同意', marginRight: '20%' },
				{ value: false, text: '退回' },
			],
			disabled,
		},
	];
	let eventReasonColumn = [
		{
			type: 'radioGroup',
			label: '采取控制措施',
			name: 'eventCause',
			data: [
				{ value: 1, text: '产品原因（包括说明书等） ' },
				{ value: 2, text: '操作原因' },
				{ value: 3, text: '患者自身原因' },
				{ value: 4, text: '无法确定' },
			],
			span: 24,
			disabled,
			result: result.eventCause,
		},
		{
			type: 'textArea',
			name: 'eventDescription',
			label: ' 事件原因分析描述',
			disabled: disabled,
			result: result.eventDescription,
			pattern: new RegExp(/^.{0,120}$/),
			message: '长度不可超过120个字符',
			span: 13,
		},
		{
			type: 'input',
			name: 'initialDisposition',
			label: ' 初步处置情况',
			disabled: disabled,
			result: result.initialDisposition,
			pattern: new RegExp(/^.{0,120}$/),
			message: '长度不可超过120个字符',
			span: 13,
		},
	];
	//形式审核
	let modalityAuditingColumn = [
		{
			type: 'radioInputGroup',
			label: '上报地设区的地级中心形式审核意见',
			name: 'auditStatus',
			data: [
				{ value: 1, text: '同意', marginRight: '20%', id: 'agree', display: 'none' },
				{ value: 2, text: '退回', id: 'reject' },
			],
			disabled,
			rejectlist,
			sapn: 13,
			result: result.auditStatus,
			returnedDescription: result.returnedDescription,
		},
	];

	useEffect(() => {
		return () => {
			// 组件卸载
			let state = history.location.state;
			history.location.state = { ...state, url: '/adverseEvent/report' };
		};
	}, []);

	return (
		<div className='main-page'>
			<div>
				<Breadcrumb
					config={[
						'',
						['', { pathname: '/adverseEvent/report' }],
						`${pageObj[companyType].breadCrumbTitle}`,
					]}
				/>
			</div>
			<div
				{...searchFormItem4}
				style={{ background: CONFIG_LESS['@bgc_title'], marginBottom: disabled ? 40 : '' }}>
				<Row>
					<Form
						form={form}
						onFinish={onFinish}
						layout={pageType === 'add' && 'vertical'}>
						<div>
							<h1
								style={{
									background: CONFIG_LESS['@bgc_table'],
									textAlign: 'center',
									fontSize: 25,
									paddingTop: 8,
									marginBottom: 0,
									marginTop: 2,
								}}>
								{pageObj[companyType].title}
							</h1>
							<FormModal
								formColumn={baseInfoColumn}
								modalTitle='基础信息'
								companyType={companyType}
								form={form}
								span={6}
							/>
							<FormModal
								formColumn={medicalTreatmentColumn}
								modalTitle='医疗器械情况'
								companyType={companyType}
								span={6}
							/>
							<FormModal
								formColumn={adverseEventColumn}
								modalTitle='不良事件情况'
								companyType={companyType}
								span={6}
							/>
							<FormModal
								formColumn={useColumn}
								modalTitle='使用情况'
								companyType={companyType}
								span={6}
							/>
							{companyType == 'personal' && (
								<>
									<FormModal
										formColumn={eventColumn}
										modalTitle='事件调查'
									/>
									<FormModal
										formColumn={appraisetColumn}
										modalTitle='评价结果'
									/>
									<FormModal
										formColumn={controlColumn}
										modalTitle='控制措施'
									/>
									<FormModal
										formColumn={errorColumn}
										modalTitle='错误误报'
									/>
									<FormModal
										formColumn={reportColumn}
										modalTitle='报告合并'
									/>
									<FormModal
										formColumn={auditingColumn}
										modalTitle='报告审核情况'
										span={24}
									/>
								</>
							)}

							{companyType == 'company' && (
								<>
									<FormModal
										formColumn={eventReasonColumn}
										modalTitle='事件初步原因分析与处置'
										span={8}
									/>
									<FormModal
										formColumn={modalityAuditingColumn}
										modalTitle='形式审核'
										span={24}
									/>
								</>
							)}
						</div>
						{!id && (
							<FooterToolbar>
								<Button
									onClick={() => {
										history.goBack();
									}}
									style={{ width: 80, height: 40 }}>
									返回
								</Button>

								<Button
									onClick={() => {
										form.submit();
									}}
									style={{ width: 128, height: 40 }}
									type='primary'
									// loading={loading}
								>
									确认操作
								</Button>
							</FooterToolbar>
						)}
					</Form>
				</Row>
			</div>
		</div>
	);
};

export default AddPage;
