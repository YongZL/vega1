import { Collapse, Modal, Button } from 'antd';
import ProTable from '@/components/ProTable';
import { ProColumns } from '@ant-design/pro-table/lib/typing';
import style from './index.less';
import { Dispatch } from 'react';
import { SetStateAction } from 'react';
import { Empty } from 'antd';
const { Panel } = Collapse;
interface Proos {
	visible: boolean; // 控制是否展示
	setVisible: Dispatch<SetStateAction<boolean>>; // visible的set方法
	title?: string; // 弹窗的标题
	footer?: JSX.Element[]; // 自定义传入的按钮
	columns: ProColumns<any>[]; // 就是ProTable里的columns,用法一致
	PromptInformation?: string; // 弹窗底部红色提示文字

	// 若只有一张表格data则传入对象格式
	//     {
	//         errorTitle: 'XXXXXX',
	//         errorList: [
	//             {
	//                 XXXX: 'xxxx',
	//                 XXXX: 'xxxx',
	//             },
	//             {
	//                 XXXX: 'xxxx',
	//                 XXXX: 'xxxx',
	//             }
	//         ]
	// }
	// 多张表格暂定为数组包对象的格式，等后续后端实际数据结构出来后调整
	data: any; // 上传错返回的数据
}
const TemplateErrorModal = (props: Proos) => {
	const {
		visible,
		setVisible,
		title = '导入模板错误',
		footer = [],
		columns,
		PromptInformation,
		data,
	} = props;
	return (
		<Modal
			visible={visible}
			title={title}
			onCancel={() => setVisible(false)}
			destroyOnClose={true}
			className={style.templateErrorModal}
			footer={[
				PromptInformation && (
					<span className={style.templateErrorModal_span}>{PromptInformation}</span>
				),
				...footer,
				<Button
					key='submit'
					type='primary'
					onClick={(e: any) => {
						setVisible(false);
					}}
					className='modalSubmit'>
					确认
				</Button>,
			]}>
			{data.length || JSON.stringify(data) !== '{}' ? (
				Object.prototype.toString.call(data) === '[object Object]' ? (
					<div className={style.templateErrorModal_div}>
						<Collapse
							defaultActiveKey={1}
							expandIconPosition='end'>
							<Panel
								header={data.errorTitle}
								key={1}>
								<ProTable
									dataSource={data.errorList}
									columns={columns}
									scroll={{ y: 400 }}
									rowKey={(record, index) => (index || 0) + 1}
									options={{ density: false, fullScreen: false, setting: false }}
									pagination={false}
								/>
							</Panel>
						</Collapse>
					</div>
				) : (
					<div className={style.templateErrorModal_div}>
						<Collapse
							defaultActiveKey={0}
							expandIconPosition='end'>
							{data.map((item: any, index: number) => {
								return (
									<Panel
										header={item?.title}
										key={index}>
										<ProTable
											dataSource={item.data}
											columns={columns}
											scroll={{ y: 400 }}
											options={{ density: false, fullScreen: false, setting: false }}
											rowKey={(record, index) => (index || 0) + 1}
											pagination={false}
										/>
									</Panel>
								);
							})}
						</Collapse>
					</div>
				)
			) : (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description='暂无数据'
				/>
			)}
		</Modal>
	);
};
export default TemplateErrorModal;
