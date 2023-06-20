import type { ProColumns } from '@/components//ProTable/typings';
import ThermalPrinter from '@/components/print/ThermalPrinter';
import ProTable from '@/components/ProTable';
import { batchThermalPrint, markPrintSuccess, thermalPrint } from '@/services/print';
import { getOrderlDetail, makingOrdinary } from '@/services/processingOrder';
import { accessNameMap, extractOperatorBarcode, retryPrintBarcode } from '@/utils';
import { notification } from '@/utils/ui';
import '@ant-design/compatible/assets/index.css';
import { Badge, Button, Form, Modal } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import UnpackedModal from './Unpacked';

export interface UpdateProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	orderInfo: ProcessingOrderController.GetListRecord;
	getFormList: () => void;
}

const ProcessModal: React.FC<UpdateProps> = (props) => {
	const [list, setList] = useState<ProcessingOrderController.GetOrderlDetailDetails[]>([]);
	const [loading, setLoading] = useState(false);
	const [unpackedVisible, setUnpackedVisible] = useState(false);
	const [printLoading, setPrintLoading] = useState(false);
	const [packageMakeLoading, setPackageMakeLoading] = useState(false); //制作、打印的防抖
	const [form] = Form.useForm();
	const thermalPrinter = useRef<ThermalPrinter>(null);
	const { isOpen, orderInfo, setIsOpen, getFormList } = props;
	const accessName = accessNameMap(); // 权限名称

	// 弹窗详情
	const getDetailInfo = async () => {
		setLoading(true);
		try {
			const res = await getOrderlDetail({ processingOrderId: orderInfo.id! });
			if (res && res.code === 0) {
				setList(res.data.details);
			}
		} finally {
			setLoading(false);
		}
	};

	// 制作
	const packageMake = async (record: any) => {
		if (packageMakeLoading) {
			return;
		}

		const params = {
			ordinaryId: record.ordinaryId,
			processingOrderId: orderInfo.id,
		};

		setPackageMakeLoading(true);
		try {
			const res = await makingOrdinary(params);
			if (res && res.code === 0) {
				notification.success('操作成功！');
				getFormList();
				getDetailInfo();
			}
		} finally {
			setPackageMakeLoading(false);
		}
	};

	//提交某条数据打印成功信息
	const postPrintSuccess = (id: any, type: any) => {
		markPrintSuccess({
			id: id,
			type: type,
		});
	};
	// 赋码
	const printBarCode = async (record: ProcessingOrderController.GetOrderlDetailDetails) => {
		if (packageMakeLoading) {
			return;
		}
		if (!Object.keys(thermalPrinter.current!.state.selected_device).length) {
			notification.warning('请先选择打印机');
			return;
		}
		const params = {
			id: record.ordinaryItemId,
			type: 'package_ordinary',
		};
		setPackageMakeLoading(true);
		try {
			const res = await thermalPrint(params);
			if (res && res.code === 0) {
				let printResult = thermalPrinter.current!.print(res.data);
				printResult.xhr.onreadystatechange = async function () {
					// 当打印结果为500时，修改当前打印条目状态为打印失败
					if (printResult.xhr.readyState === 4 && printResult.xhr.status >= 500) {
						// 当打印失败时重试，默认重试三次
						let result = await retryPrintBarcode(thermalPrinter.current, res.data);
						if (result === 'error') {
							record.printed = false;
						} else if (result === 'success') {
							record.printed = true;
							markPrintSuccess(params);
						}
					} else if (printResult.xhr.readyState === 4 && printResult.xhr.status === 200) {
						record.printed = true;
						markPrintSuccess(params);
					}
					getDetailInfo();
				};
			}
		} finally {
			setPackageMakeLoading(false);
		}
	};

	// 批量打印
	const printAllBarCode = async () => {
		if (!Object.keys(thermalPrinter.current!.state.selected_device).length) {
			notification.warning('请先选择打印机');
			return;
		}
		setPrintLoading(true);
		try {
			const res = await batchThermalPrint({
				ids: list
					.filter((item) => item.ordinaryItemId)
					.map((item) => item.ordinaryItemId)
					.join(','),
				type: 'package_ordinary',
			});

			if (res && res.code === 0) {
				for (let i = 0; i < res.data.length; i++) {
					setTimeout(() => {
						const printResult = thermalPrinter.current!.print(res.data[i]);

						printResult.xhr.onreadystatechange = async function () {
							// 当打印结果为500时，修改当前打印条目状态为打印失败
							const operatorBarCode = extractOperatorBarcode(printResult.data);
							const record = list.filter((item) => item.ordinaryItemCode === operatorBarCode)[0];
							const id = record && record.ordinaryItemId;
							if (printResult.xhr.readyState === 4 && printResult.xhr.status >= 500) {
								const result = await retryPrintBarcode(
									thermalPrinter.current,
									res.data[i],
									0,
									1000 * (i + 1),
								);

								if (result === 'error') {
									record.printed = false;
								} else if (result === 'success') {
									record.printed = true;
									postPrintSuccess(id, 'package_ordinary');
								}
							} else {
								record.printed = true;

								postPrintSuccess(id, 'package_ordinary');
							}

							getDetailInfo();
						};
					}, 1000 * (i + 1));
				}
			}
		} finally {
			setPrintLoading(false);
		}
	};

	useEffect(() => {
		if (isOpen) {
			getDetailInfo();
		}
	}, [isOpen]);

	const columns: ProColumns<ProcessingOrderController.GetOrderlDetailDetails>[] = [
		{
			title: '序号',
			dataIndex: 'index',
			key: 'index',
			align: 'center',
			width: 80,
			renderText: (_text, _record, index) => index + 1,
		},
		{
			title: '打印状态',
			dataIndex: 'printed',
			key: 'printed',
			width: 100,
			render: (printed) => {
				return (
					<Badge
						color={
							printed === true ? CONFIG_LESS['@c_starus_disabled'] : CONFIG_LESS['@c_starus_await']
						}
						text={printed === true ? '已打印' : '待打印'}
					/>
				);
			},
		},
		{
			title: '医耗套包名称',
			dataIndex: 'ordinaryName',
			key: 'ordinaryName',
			width: 150,
			ellipsis: true,
		},
		{
			title: '医耗套包说明',
			dataIndex: 'ordinaryDetailGoodsMessage',
			key: 'ordinaryDetailGoodsMessage',
			width: 200,
			render: (_text, record) => (
				<div
					className='detailGoodsMessage'
					title={record.description ? record.description : record.ordinaryDetailGoodsMessage}>
					{record.description ? record.description : record.ordinaryDetailGoodsMessage}
				</div>
			),
		},
		{
			title: '数量',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 100,
			renderText: (text) => `${text}包`,
		},
		{
			title: '操作',
			dataIndex: 'option',
			key: 'option',
			width: 152,
			fixed: 'right',
			render: (_text, record) => {
				return (
					<div className='operation'>
						{record.ordinaryId && !record.ordinaryItemCode && (
							<span
								className='handleLink'
								onClick={() => packageMake(record)}>
								制作
							</span>
						)}
						{record.ordinaryId && record.ordinaryItemCode && (
							<span
								className='handleLink'
								onClick={() => printBarCode(record)}>
								{record.printed ? '补打' : '打印'}
							</span>
						)}
					</div>
				);
			},
		},
	];

	return (
		<Form form={form}>
			<Modal
				className='ant-detail-modal'
				destroyOnClose
				maskClosable={false}
				visible={isOpen}
				title={orderInfo.status === 'process_done' ? '赋码' : accessName['process_coding']}
				onCancel={() => setIsOpen(false)}
				footer={[
					<Button
						onClick={printAllBarCode}
						type={'primary'}
						style={{ marginLeft: 8 }}
						loading={printLoading}>
						{list.every((item) => item.printed) ? '全部补打' : '全部打印'}
					</Button>,
				]}>
				<div className='modelInfo'>
					<div className='left'>
						选择打印机：
						<ThermalPrinter ref={thermalPrinter} />
					</div>
					{orderInfo.category === 'ordinary_package' && (
						<div className='right'>
							<Button
								onClick={() => setUnpackedVisible(true)}
								type='primary'
								ghost>
								配货详情
							</Button>
						</div>
					)}
				</div>

				<ProTable<ProcessingOrderController.GetOrderlDetailDetails>
					loading={loading}
					columns={columns}
					rowKey='id'
					dataSource={list}
					options={{ density: false, fullScreen: false, setting: false }}
					scroll={{ x: '100%', y: 300 }}
					// tableInfoId={'218'}
					pagination={false}
				/>
			</Modal>

			<UnpackedModal
				isOpen={unpackedVisible}
				setIsOpen={setUnpackedVisible}
				orderId={orderInfo.id!}
			/>
		</Form>
	);
};
export default ProcessModal;
