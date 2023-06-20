import Breadcrumb from '@/components/Breadcrumb';
import FooterToolbar from '@/components/FooterToolbar';
import InputUnit from '@/components/InputUnit';
import useDebounce from '@/hooks/useDebounce'; // 延迟-- loadash不可用
import { getDay, getScrollX, replaceColumItemByData, transformSBCtoDBC } from '@/utils';
import { getDownloadName } from '@/utils/file';
import { convertImageUrl } from '@/utils/file/image';
import { convertPriceWithDecimal, submitPrice } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Card, Divider, Form, message, Popconfirm, Select, Table } from 'antd';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, history, useModel } from 'umi';
import { billModalColumns, salesModalColumns } from '../columns';
import InvoiceInfo from '../component/info';
import style from '../index.less';
import { electronicUpload, getInvoiceInfo, getInvoiceList, manualUpload } from '../service';

const List: React.FC<{}> = ({ global }) => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [submitLoading, setSubmitLoading] = useState<boolean>(false);
	const [searchList, setSearchList] = useState([]);
	const [totalPrice, setTotalPrice] = useState(0);
	const [detail, getDetail] = useState({});
	const [detailList, setDetailList] = useState([]);
	const [invoice, setInvoice] = useState([]);
	const [invoiceDetail, setInvoiceDetail] = useState([]);
	const [columns, setColumns] = useState([]);
	const [releaseType, setReleaseType] = useState('');
	const [electronicSubmit, setElectronicSubmit] = useState({});
	const [resourceId, setResourceId] = useState(undefined);
	const [searchKey, setSearchKey] = useState('');
	const [step, setStep] = useState('');
	const [allQuantity, setAllQuantity] = useState(false);
	const debouncedSearch = useDebounce(searchKey, 500);

	useEffect(() => {
		if (debouncedSearch) {
			numSearch(searchKey);
		}
	}, [debouncedSearch]);

	const clear = () => {
		form.resetFields();
		setReleaseType('');
		setDetailList([]);
		getDetail({});
		setInvoice([]);
		setInvoiceDetail([]);
	};

	// 修改数量
	const changeNum = (record: any, value: string, list: any) => {
		if (list.length <= 0) {
			return;
		}
		let price = 0;
		const newList = list.map((item) => {
			if (record.shippingOrderItemId && item.shippingOrderItemId === record.shippingOrderItemId) {
				item.num = value;
				item.totalAmount = step == '' ? -item.price * Number(value) : item.price * Number(value);
				price += item.totalAmount;
				return item;
			}
			price += item.totalAmount;
			return item;
		});
		setTotalPrice(price);
		setDetailList(newList);
		setTimeout(() => {
			form.validateFields(['totalAmount']);
		}, 500);
	};

	// 搜索发票
	const numSearch = async (value: string) => {
		if (!value) {
			clear();
			return;
		}
		setLoading(true);
		const res = await getInvoiceList({ serialNumber: value });
		if (res && res.code === 0) {
			setSearchList(res.data);
		}
		setLoading(false);
	};

	// 选择发票
	const selectInvoice = async (id: string) => {
		if (!id) {
			setResourceId(undefined);
			clear();
			return;
		}
		form.resetFields();
		setInvoice([]);
		setInvoiceDetail([]);
		setResourceId(id);
		const res = await getInvoiceInfo({ invoiceId: id });
		if (res && res.code === 0) {
			const data = res.data;
			let price = 0;
			let allPrice = 0;
			const list = (data.detailList || []).map((item) => {
				item.num =
					data.invoiceDto.releaseType === 'manual_invoice'
						? item.remainQuantity
						: item.invoiceQuantity;
				item.totalAmount = -item.price * item.num;
				price += item.totalAmount;
				allPrice += item.remainQuantity;
				return item;
			});
			getDetail({ ...data.invoiceDto });
			setDetailList(list);
			setTotalPrice(price);
			setReleaseType(data.invoiceDto.releaseType);
			let columnsNew = data.invoiceDto.invoiceSync ? billModalColumns() : salesModalColumns();

			// 手工
			if (data.invoiceDto.releaseType === 'manual_invoice') {
				setStep('');
				columnsNew.splice(5, 0, {
					title: '开票数量',
					dataIndex: 'num',
					key: 'num',
					width: 120,
					render: (text, record) => {
						return (
							<InputUnit
								value={text}
								min={0}
								max={record.remainQuantity}
								onChange={(value: string) => {
									changeNum(record, value, list);
								}}
							/>
						);
					},
				});
				columnsNew = replaceColumItemByData(columnsNew, 'remainQuantity', {
					title: '待开票数量',
					dataIndex: 'remainQuantity',
					key: 'remainQuantity',
					width: 120,
				});
			} else {
				// 电子
				setStep('start');
				setAllQuantity(allPrice > 0);
				columnsNew.splice(5, 0, {
					title: '开票数量',
					dataIndex: 'num',
					key: 'num',
					width: 120,
				});
				columnsNew = replaceColumItemByData(columnsNew, 'remainQuantity', {
					title: '最小开票数',
					dataIndex: 'remainQuantity',
					key: 'remainQuantity',
					width: 120,
				});
			}
			columnsNew.splice(4, 0, {
				title: '原开票数量',
				dataIndex: 'invoiceQuantity',
				key: 'invoiceQuantity',
				width: 120,
			});
			setColumns(columnsNew);
		}
	};

	// 上传发票
	const urlHandleChange = (info: any, key: string) => {
		if (info.file.status === 'removed') {
			setInvoice([]);
			form.resetFields([key]);
			return;
		}
		setInvoice([info.file]);
		if (info.file.status === 'done') {
			message.success(`${info.file.name}文件上传成功`);
		} else if (info.file.status === 'error') {
			message.error(`${info.file.name} 上传失败`);
		}
	};

	// 上传发票清单
	const urlDetailHandleChange = (info: any) => {
		if (info.fileList.length > 10) {
			notification.error('最多可上传10个文件');
			return;
		}
		setInvoiceDetail(info.fileList);
		if (info.file.status === 'done') {
			form.setFieldsValue({
				invoiceDetailUrl: info.fileList,
			});
			message.success(`${info.file.name}文件上传成功`);
		} else if (info.file.status === 'error') {
			message.error(`${info.file.name} 上传失败`);
		}
	};

	//提交
	const handleSubmit = () => {
		form.validateFields().then(async (values) => {
			if (totalPrice == 0) {
				notification.error('含税金额不可为0');
				return;
			}
			const invoiceManualDetailUploadDto = detailList.map((item) => {
				return { shippingOrderItemId: item.shippingOrderItemId, quantity: item.num };
			});
			const invoiceUrl = invoice[0].response.data
				? invoice[0].response.data.urlName
				: invoice[0].response;
			const invoiceDetailUrl = (invoiceDetail || []).map((item) => {
				return item.response.data ? item.response.data.urlName : item.response;
			});
			const invoiceUpdateDto = {
				...values,
				releaseDate: getDay(values.releaseDate),
				invoiceDetailUrl: invoiceDetailUrl.join(','),
				invoiceUrl,
				totalAmount: submitPrice(values.totalAmount),
			};
			// 下一步
			if (step === 'start') {
				setElectronicSubmit({
					resourceId,
					reverseInvoiceUploadDto: invoiceUpdateDto,
				});
				form.resetFields([
					'serialNumber',
					'serialCode',
					'releaseDate',
					'totalAmount',
					'invoiceUrl',
					'invoiceDetailUrl',
				]);
				let price = 0;
				const newList = detailList.map((item) => {
					item.num = item.invoiceQuantity;
					item.totalAmount = item.price * item.num;
					price += item.totalAmount;
					return item;
				});
				let newColumns = cloneDeep(columns);
				newColumns = replaceColumItemByData(newColumns, 'num', {
					title: '开票数量',
					dataIndex: 'num',
					key: 'num',
					width: 120,
					render: (text, record) => {
						return (
							<InputUnit
								value={text}
								min={record.remainQuantity}
								max={record.invoiceQuantity}
								onChange={(value: string) => {
									changeNum(record, value, newList);
								}}
							/>
						);
					},
				});
				setTotalPrice(price);
				setDetailList(newList);
				setColumns(newColumns);
				setInvoice([]);
				setInvoiceDetail([]);
				setStep('end');
			} else {
				// 提交
				setSubmitLoading(true);
				const res = await manualUpload({
					invoiceManualDetailUploadDto,
					invoiceUpdateDto,
					sourceId: resourceId,
				});
				setSubmitLoading(false);
				if (res && res.code === 0) {
					notification.success('提交成功');
					clear();
				}
			}
		});
	};

	// 电子红冲提交
	const stepSubmit = () => {
		form.validateFields().then(async (values) => {
			const detailUploadDtoList = detailList.map((item) => {
				return { shippingOrderItemId: item.shippingOrderItemId, quantity: item.num };
			});
			const invoiceUrl = invoice[0].response.data
				? invoice[0].response.data.urlName
				: invoice[0].response;
			const invoiceDetailUrl = (invoiceDetail || []).map((item) => {
				return item.response.data ? item.response.data.urlName : item.response;
			});
			const newInvoiceUploadDto = {
				...values,
				releaseDate: getDay(values.releaseDate),
				invoiceDetailUrl: invoiceDetailUrl.join(','),
				invoiceUrl,
				totalAmount: submitPrice(values.totalAmount),
			};
			const params =
				step === 'start'
					? { reverseInvoiceUploadDto: newInvoiceUploadDto, resourceId }
					: { ...electronicSubmit, detailUploadDtoList, newInvoiceUploadDto, resourceId };
			setSubmitLoading(true);

			const res = await electronicUpload(params);
			setSubmitLoading(false);
			if (res && res.code === 0) {
				notification.success('提交成功');
				clear();
			}
		});
	};

	// 上一步
	const goFirstStep = () => {
		const reversInfo = electronicSubmit.reverseInvoiceUploadDto;
		form.setFieldsValue({
			serialNumber: reversInfo.serialNumber,
			serialCode: reversInfo.serialCode,
			releaseDate: moment(reversInfo.releaseDate),
			totalAmount: convertPriceWithDecimal(reversInfo.totalAmount),
			invoiceUrl: reversInfo.invoiceUrl,
			invoiceDetailUrl: reversInfo.invoiceDetailUrl,
		});
		let price = 0;
		const newList = detailList.map((item) => {
			item.num = item.invoiceQuantity;
			item.totalAmount = -item.price * item.num;
			price += item.totalAmount;
			return item;
		});
		reversInfo.invoiceUrl && setInvoice(convertImageUrl(reversInfo.invoiceUrl));
		const detailUrl = reversInfo.invoiceDetailUrl
			? reversInfo.invoiceDetailUrl.split(',').map((item, index) => {
					return {
						uid: index,
						name: getDownloadName(item),
						response: item,
						status: 'done',
					};
			  })
			: undefined;
		let newColumns = cloneDeep(columns);
		newColumns = replaceColumItemByData(newColumns, 'num', {
			title: '开票数量',
			dataIndex: 'num',
			key: 'num',
			width: 120,
		});
		setColumns(newColumns);
		setInvoiceDetail(detailUrl);
		setTotalPrice(price);
		setDetailList(newList);
		setStep('start');
	};

	return (
		<div>
			<Breadcrumb config={['', ['', '/finance/make_invoice_list'], '']} />
			<Card
				bordered={false}
				title='填写蓝票发票号码'
				className='mb2'>
				<span>发票号码： </span>
				<Select
					showSearch
					allowClear
					placeholder='请输入发票号码'
					filterOption={false}
					getPopupContainer={(node) => node.parentNode}
					loading={loading}
					style={{ width: '500px' }}
					onSearch={(val) => setSearchKey(transformSBCtoDBC(val))}
					onChange={(val) => selectInvoice(val)}
					value={resourceId}
					optionLabelProp='label'>
					{searchList.length > 0 && (
						<Select.Option
							value=''
							key='-1'
							label=''
							disabled>
							<div className={style.invoiceLabel}>
								<span className={style.number} />
								<i />
								<span className={style.titleCode}>发票代码</span>
								<i />
								<span className={style.titleName}>企业名称</span>
							</div>
						</Select.Option>
					)}
					{searchList.map((item) => {
						return (
							<Select.Option
								value={item.invoiceId}
								key={item.invoiceId}
								label={item.serialNumber}>
								<div className={style.invoiceLabel}>
									<span className={style.number}>{item.serialNumber}</span>
									<i> | </i>
									<span className={style.code}>{item.serialCode}</span>
									<i> | </i>
									<span className={style.name}>{item.companyName}</span>
								</div>
							</Select.Option>
						);
					})}
				</Select>
			</Card>

			{releaseType && (
				<>
					<Card
						bordered={false}
						title={
							releaseType === 'electronic_invoice' ? (
								step === 'start' ? (
									<div>
										{`填写红冲发票信息 >`} <span className='cl_C0C4CC'>上传新发票</span>
									</div>
								) : (
									<div>
										<span className='cl_C0C4CC'>填写红冲发票信息</span>
										{` > 上传新发票`}
									</div>
								)
							) : (
								'填写红冲发票信息'
							)
						}>
						<InvoiceInfo
							initialValues={{
								title: detail.title,
								releaseType: detail.releaseType,
								category: detail.category,
								taxRate: String(detail.taxRate),
								sourceInvoiceNumber: detail.serialNumber,
							}}
							urlHandleChange={urlHandleChange}
							urlDetailHandleChange={urlDetailHandleChange}
							totalPrice={totalPrice}
							form={form}
							invoice={invoice}
							invoiceDetail={invoiceDetail}
							handleType='link'
							key='2'
						/>
						<Divider />
						<Table
							title={() => <h3>{fields.baseGoods}明细</h3>}
							rowKey='shippingOrderItemId'
							size='small'
							pagination={false}
							columns={columns}
							dataSource={detailList}
							scroll={{
								y: detailList.length > 6 ? 300 : undefined,
								x: getScrollX(columns, true),
							}}
						/>
					</Card>

					<FooterToolbar>
						{step === 'end' ? (
							<Button onClick={() => goFirstStep()}>上一步</Button>
						) : (
							<Button
								onClick={() => {
									history.push('/finance/make_invoice_list');
								}}>
								返回
							</Button>
						)}
						{step === 'start' && !allQuantity && (
							<Popconfirm
								placement='top'
								title='提交后将不能上传新发票，是否继续提交？'
								onConfirm={() => {
									stepSubmit();
								}}>
								<Button type='primary'>提交</Button>
							</Popconfirm>
						)}
						<Button
							onClick={step === 'end' ? stepSubmit : handleSubmit}
							type='primary'
							loading={submitLoading}>
							{step === 'start' ? '上传新发票' : '提交'}
						</Button>
					</FooterToolbar>
				</>
			)}
		</div>
	);
};

export default connect(({ global }) => ({ global }))(List);
