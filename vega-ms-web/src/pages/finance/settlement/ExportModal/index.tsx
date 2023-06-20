import api from '@/constants/api';
import { useCustodianList } from '@/hooks/useCustodianList';
import { getUrl } from '@/utils/utils';
import { Button, DatePicker, Form, Modal, Select } from 'antd';
import { connect, useModel } from 'umi';

const FormItem = Form.Item;
const MonthPicker = DatePicker.MonthPicker;

const ExportModal = ({ settlement, submitLoading, dispatch, ...props }) => {
	const { modalVisible, setModalVisible } = props;
	const [form] = Form.useForm();
	const { fields } = useModel('fieldsMapping');
	const custodianList = useCustodianList({ isIncludeVirtual: true });
	const exportSettlement = () => {
		form.validateFields().then((values) => {
			dispatch({
				type: 'settlement/exportCutodianSettlement',
				payload: {
					custodianId: values.custodianId,
					name: values.name.format('YYYY[年]MM[月]'),
				},
				callback: (res) => {
					if (res && res.code === 0) {
						window.open(`${getUrl()}${api.common.download}?filename=${res.data}`);
						setModalVisible(false);
						form.resetFields();
					}
				},
			});
		});
	};

	const handleCancel = () => {
		setModalVisible(false);
		form.resetFields();
	};

	const modal = {
		title: '导出结算单',
		visible: modalVisible,
		maskClosable: false,
		onCancel: handleCancel,
		footer: [
			<Button
				key='cancel'
				disabled={submitLoading}
				onClick={handleCancel}>
				取消
			</Button>,
			<Button
				type='primary'
				key='confirm'
				onClick={exportSettlement}
				loading={submitLoading}>
				确定
			</Button>,
		],
		destroyOnClose: true,
	};
	return (
		<Modal
			{...modal}
			className='modalDetails'>
			<Form form={form}>
				<FormItem
					name='name'
					label='导出报表周期'
					rules={[{ required: true, message: '请选择报表周期' }]}
					{...{
						labelCol: {
							xs: { span: 24 },
							sm: { span: 7 },
							md: { span: 6 },
							lg: { span: 10 },
							xl: { span: 7 },
							xxl: { span: 6 },
						},
						wrapperCol: {
							xs: { span: 24 },
							sm: { span: 15 },
							md: { span: 16 },
							lg: { span: 12 },
							xl: { span: 15 },
							xxl: { span: 17 },
						},
					}}>
					<MonthPicker
						placeholder='请选择'
						style={{ width: 270 }}
						format={'YYYY/MM'}
						autoComplete={'off'}
					/>
				</FormItem>
				<FormItem
					name='custodianId'
					label={`一级${fields.distributor}`}
					rules={[{ required: true, message: `请选择${fields.distributor}` }]}
					{...{
						labelCol: {
							xs: { span: 24 },
							sm: { span: 7 },
							md: { span: 6 },
							lg: { span: 10 },
							xl: { span: 7 },
							xxl: { span: 6 },
						},
						wrapperCol: {
							xs: { span: 24 },
							sm: { span: 15 },
							md: { span: 16 },
							lg: { span: 12 },
							xl: { span: 15 },
							xxl: { span: 17 },
						},
					}}>
					<Select
						filterOption={(input, option) => {
							return option.children.toLowerCase().trim().indexOf(input.toLowerCase().trim()) >= 0;
						}}
						placeholder='请选择'
						style={{ width: 270 }}
						showSearch>
						{custodianList.map((item) => {
							return (
								<Select.Option
									value={item.id}
									key={item.id}>
									{item.id === 1 ? '-' : item.companyName}
								</Select.Option>
							);
						})}
					</Select>
				</FormItem>
			</Form>
		</Modal>
	);
};

export default connect(
	({ loading, settlement }: { settlement; loading: { effects: { [key: string]: boolean } } }) => ({
		settlement,
		submitLoading: loading.effects['settlement/exportCutodianSettlement'],
	}),
)(ExportModal);
