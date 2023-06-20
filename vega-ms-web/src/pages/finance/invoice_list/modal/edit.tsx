import InputUnit from '@/components/InputUnit';
import TableBox from '@/components/TableBox';
import { getDay, replaceColumItemByData } from '@/utils';
import { getDownloadName } from '@/utils/file';
import { convertImageUrl } from '@/utils/file/image';
import { submitPrice } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Form, message, Modal } from 'antd';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';
import InvoiceInfo from '../../make_invoice_list/component/info';

import { billModalColumns, salesModalColumns } from '../../make_invoice_list/columns';
import {
	billElectronicEdit,
	billManualEdit,
	getDetail,
	reverseManualEdit,
	salesEdit,
} from '../service';

const EditModal: FC<{}> = ({ isOpen, setIsOpen, updateList, orderInfo }) => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState<boolean>(false);
	const [submitList, setSubmitList] = useState([]);
	const [detail, setDetail] = useState({});
	const [totalPrice, setTotalPrice] = useState(0);
	const [invoice, setInvoice] = useState([]);
	const [invoiceDetail, setInvoiceDetail] = useState([]);
	const [initialValues, setInitialValues] = useState({});

	// 获取详情
	const getDetailInfo = async () => {
		setLoading(true);
		const res = await getDetail({ invoiceId: orderInfo.id });
		if (res && res.code === 0) {
			const data = res.data;
			const invoiceInfo = data.invoice;
			setDetail(invoiceInfo);
			const urlInvoice = convertImageUrl(invoiceInfo.invoiceUrl);
			const detailUrl = invoiceInfo.invoiceDetailUrl
				? invoiceInfo.invoiceDetailUrl.split(',').map((item, index) => {
						return {
							uid: index,
							name: getDownloadName(item),
							response: item,
							status: 'done',
						};
				  })
				: undefined;
			setInvoice(urlInvoice);
			setInvoiceDetail(detailUrl);
			let price = 0;
			const newList = (data.detailList || []).map((item) => {
				item.num = item.quantity;
				item.totalAmount =
					invoiceInfo.invoiceType == 'normal'
						? item.price * item.quantity
						: -item.price * item.quantity;
				price += item.totalAmount;
				return item;
			});
			const init = {
				title: invoiceInfo.title,
				releaseType: invoiceInfo.releaseType,
				category: invoiceInfo.category,
				taxRate: String(invoiceInfo.taxRate),
				serialNumber: invoiceInfo.serialNumber,
				serialCode: invoiceInfo.serialCode,
				releaseDate: moment(invoiceInfo.releaseDate),
				invoiceDetailUrl: detailUrl,
				invoiceUrl: urlInvoice.length > 0 ? urlInvoice : undefined,
				sourceInvoiceNumber: invoiceInfo.sourceInvoiceNumber,
			};
			setInitialValues(init);
			setTotalPrice(price);
			setSubmitList(newList);
		}
		setLoading(false);
	};

	// 提交
	const handleSubmit = async () => {
		form.validateFields().then(async (values) => {
			if (totalPrice == 0) {
				notification.error('含税金额不可为0');
				return;
			}
			const updateInvoiceDetailList = submitList.map((item) => {
				return { shippingOrderItemId: item.shippingOrderItemId, quantity: item.num };
				// (orderInfo.invoiceSync) ?
				//   { shippingOrderItemId: item.shippingOrderItemId, quantity: item.num } :
				//   { goodsItemId: item.goodsItemId, quantity: item.num };
			});
			const invoiceUrl = invoice[0].response.data
				? invoice[0].response.data.urlName
				: invoice[0].response;
			const invoiceDetailUrl = (invoiceDetail || []).map((item) => {
				return item.response.data ? item.response.data.urlName : item.response;
			});
			const updateInvoice = {
				...values,
				releaseDate: getDay(values.releaseDate),
				invoiceDetailUrl: invoiceDetailUrl.join(','),
				invoiceUrl,
				totalAmount: submitPrice(values.totalAmount),
				invoiceId: orderInfo.id,
			};
			const query =
				orderInfo.invoiceType === 'reverse'
					? reverseManualEdit
					: orderInfo.invoiceSync
					? orderInfo.releaseType === 'manual_invoice'
						? billManualEdit
						: billElectronicEdit
					: salesEdit;
			const params = { updateInvoiceDetailList, updateInvoice };
			setLoading(true);
			const res = await query(params);
			setLoading(false);
			if (res && res.code === 0) {
				notification.success('提交成功');
				onCancel();
				updateList();
			}
		});
	};

	// 修改数量
	const changeNum = (record: any, value: string) => {
		let price = 0;
		const newList = submitList.map((item) => {
			if (record.goodsItemId && item.goodsItemId === record.goodsItemId) {
				item.num = value;
				item.totalAmount =
					detail.invoiceType == 'normal' ? item.price * Number(value) : -item.price * Number(value);
				price += item.totalAmount;
				return item;
			}
			price += item.totalAmount;
			return item;
		});
		setTotalPrice(price);
		setSubmitList(newList);
		setTimeout(() => {
			form.validateFields(['totalAmount']);
		}, 500);
	};

	// 关闭弹窗
	const onCancel = () => {
		setIsOpen(false);
		setInvoice([]);
		setInvoiceDetail([]);
		form.resetFields();
	};

	const urlHandleChange = (info, key) => {
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

	const urlDetailHandleChange = (info) => {
		if (info.fileList.length > 10) {
			notification.error('最多可上传10个文件');
			return;
		}
		setInvoiceDetail(info.fileList);
		if (info.file.status === 'done') {
			message.success(`${info.file.name}文件上传成功`);
		} else if (info.file.status === 'error') {
			message.error(`${info.file.name} 上传失败`);
		}
	};

	let columns = orderInfo.invoiceSync ? billModalColumns() : salesModalColumns();
	columns = replaceColumItemByData(columns, 'remainQuantity', {
		title: orderInfo.releaseType === 'manual_invoice' ? '可用数量' : '最小开票数',
		dataIndex: 'remainQuantity',
		key: 'remainQuantity',
		width: 120,
	});
	columns.splice(4, 0, {
		title: '原开票数量',
		dataIndex: 'quantity',
		key: 'quantity',
		width: 120,
	});
	columns.splice(6, 0, {
		title: '开票数量',
		dataIndex: 'num',
		key: 'num',
		width: 120,
		render: (text, record) => {
			return (
				<InputUnit
					value={text}
					min={orderInfo.releaseType === 'manual_invoice' ? 0 : record.remainQuantity}
					max={record.quantity}
					onChange={(value: number) => {
						changeNum(record, value);
					}}
				/>
			);
		},
	});

	useEffect(() => {
		if (isOpen) {
			getDetailInfo();
		}
	}, [isOpen]);

	return (
		<div>
			<Modal
				maskClosable={false}
				destroyOnClose={true}
				visible={isOpen}
				width={'94%'}
				title='编辑发票信息'
				onCancel={onCancel}
				footer={[
					<Button
						key='submit'
						type='primary'
						loading={loading}
						onClick={handleSubmit}>
						提交
					</Button>,
					<Button onClick={onCancel}>取消</Button>,
				]}>
				<InvoiceInfo
					urlHandleChange={urlHandleChange}
					urlDetailHandleChange={urlDetailHandleChange}
					totalPrice={totalPrice}
					form={form}
					invoice={invoice}
					invoiceDetail={invoiceDetail}
					handleType='link'
					initialValues={initialValues}
				/>
				<TableBox
					headerTitle={<h3>{fields.baseGoods}明细</h3>}
					size='small'
					pagination={false}
					columns={columns}
					dataSource={submitList}
					options={{ density: false, fullScreen: false, setting: false }}
					scroll={{ x: '100%', y: 300 }}
					tableInfoId='185'
					rowKey='index'
				/>
			</Modal>
		</div>
	);
};
export default EditModal;
