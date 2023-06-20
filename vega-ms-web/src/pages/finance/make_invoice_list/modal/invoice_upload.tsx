import InputUnit from '@/components/InputUnit';
import { getDay, getScrollX } from '@/utils';
import { submitPrice } from '@/utils/format';
import { notification } from '@/utils/ui';
import { Button, Form, message, Modal, Table } from 'antd';
import { FC, useEffect, useState } from 'react';
import InvoiceInfo from '../component/info';

import { useModel } from 'umi';
import { billModalColumns, salesModalColumns } from '../columns';
import { salesUpload, waybillUpload } from '../service';

const UploadModal: FC<{}> = ({ visible, setVisible, list, updateList, activeTab }) => {
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const [loading, setLoading] = useState<boolean>(false);
	const [submitList, setSubmitList] = useState([]);
	const [totalPrice, setTotalPrice] = useState(0);
	const [invoice, setInvoice] = useState([]);
	const [invoiceDetail, setInvoiceDetail] = useState([]);

	//提交
	const handleSubmit = async () => {
		form.validateFields().then(async (values) => {
			if (totalPrice === 0) {
				notification.error('含税金额不可为0');
				return;
			}
			const invoiceStateDetailDtoList = submitList.map((item) => {
				return { goodsItemId: item.goodsItemId, quantity: item.num, statementId: item.statementId };
			});
			const invoiceDetailDtoList = submitList.map((item) => {
				return { shippingOrderItemId: item.shippingOrderItemId, quantity: item.num };
			});
			const invoiceUrl = invoice[0].response.data.urlName;
			const invoiceDetailUrl = invoiceDetail.map((item) => {
				return item.response.data.urlName;
			});
			const invoiceUploadDto = {
				...values,
				releaseDate: getDay(values.releaseDate),
				invoiceDetailUrl: invoiceDetailUrl.join(','),
				invoiceUrl,
				totalAmount: submitPrice(values.totalAmount),
			};
			const query = activeTab === 'sales' ? salesUpload : waybillUpload;
			const params =
				activeTab === 'sales'
					? { invoiceStateDetailDtoList, invoiceUploadDto }
					: { invoiceDetailDtoList, invoiceUploadDto };

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
				item.totalAmount = item.price * Number(value);
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
		setVisible(false);
		setInvoice([]);
		setInvoiceDetail([]);
		form.resetFields();
	};

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

	let columns = activeTab === 'sales' ? salesModalColumns() : billModalColumns();
	columns.splice(5, 0, {
		title: '开票数量',
		dataIndex: 'num',
		key: 'num',
		width: 120,
		render: (text, record) => {
			return (
				<InputUnit
					value={text}
					min={1}
					max={record.remainQuantity}
					onChange={(value: number) => {
						changeNum(record, value);
					}}
				/>
			);
		},
	});

	useEffect(() => {
		if (visible) {
			let price = 0;
			const newList = list.map((item) => {
				item.num = item.remainQuantity;
				item.totalAmount = item.price * item.remainQuantity;
				price += item.totalAmount;
				return item;
			});
			setTotalPrice(price);
			setSubmitList(newList);
		}
	}, [visible]);

	return (
		<div>
			<Modal
				destroyOnClose
				maskClosable={false}
				forceRender
				visible={visible}
				width={'94%'}
				title='上传发票'
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
					handleType='add'
				/>
				<Table
					title={() => <h3>{fields.baseGoods}明细</h3>}
					size='small'
					rowKey={(record, index) =>
						activeTab === 'waybill'
							? record.goodsItemId
							: `${record.goodsItemId}${record.statementId}`
					}
					pagination={false}
					columns={columns}
					dataSource={submitList}
					scroll={{
						y: submitList.length > 6 ? 300 : undefined,
						x: getScrollX(columns, true),
					}}
				/>
			</Modal>
		</div>
	);
};
export default UploadModal;
