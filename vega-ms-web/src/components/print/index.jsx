import ReactToPrint from '@/components/ReactToPrint';
import request from '@/utils/request';
import { Button } from 'antd';
import { useEffect, useRef, useState } from 'react';
import './print.less';

const Print = (TargetComponent) => (props) => {
	const [data, setData] = useState([]);
	const [hospitalName, setHospitalName] = useState('');
	const targetRef = useRef();
	// 获取医院名称
	useEffect(() => {
		setHospitalName(sessionStorage.getItem('hospital_name'));
	}, []);
	const {
		isVertical,
		url,
		params,
		parameters,
		getForm = null,
		printState,
		callbackFunction,
		resultData,
		isBillsInThreeParts, //是否三联打印
		btnName, //按钮名
	} = props;

	// 请求api数据
	const getList = () => {
		return new Promise((resolve) => {
			let data = { ...params };
			if (getForm) {
				data = { ...data, ...getForm() };
			}
			request(url, { params: data })
				.then((res) => {
					if (res && res.code === 0) {
						let result = res.data;
						if (props.data) {
							result = { ...result, ...props.data };
						}
						setData(result);
					} else if (res && res.code == 1) {
						return;
					}
					res && res.code === 0 && setData(res.data);
					// 拿到服务器数据之后延时100ms再resolve掉当前的promise
					// 这100ms的时间是用来让react把数据挂载到组件上
					setTimeout(() => {
						resolve(true);
					}, 100);
				})
				.catch((error) => {
					throw new Error(error);
				});
		});
	};

	// 阻止向上冒泡（因为冒泡会触发表格行的点击事件）
	const handleClick = (e) => {
		e.stopPropagation();
	};
	// 渲染在页面中展示出来的组件
	let renderTrigger = () =>
		props.printType ? (
			<Button
				type='primary'
				disabled={props.printTypeDisabled}
				className='btnOperator'>
				{btnName || '打印'}
			</Button>
		) : (
			<span className='handleLink'> {printState ? '补打' : '打印'}</span>
		);

	// 渲染待打印的目标组件
	const renderContent = () => targetRef.current;
	// 目标组件生成前的钩子
	const onBeforeContentGenerate = () => (resultData ? () => {} : getList());
	let parameterss = { ...parameters };
	if (getForm) {
		parameterss = { ...parameters, ...getForm() };
	}

	return (
		<div
			onClick={handleClick}
			className='dis-ib'>
			<ReactToPrint
				isVertical={isVertical}
				isBillsInThreeParts={isBillsInThreeParts}
				trigger={renderTrigger}
				content={renderContent}
				onBeforeContentGenerate={onBeforeContentGenerate}
				onAfterPrint={() => {
					!printState && callbackFunction && callbackFunction();
				}}
			/>

			<div className='printContent'>
				{/* 待打印目标组件 */}
				<TargetComponent
					ref={targetRef}
					headDataList={props.headDataList}
					data={resultData ? resultData : data}
					columns={props.columns || []}
					hospitalName={hospitalName}
					moduleName={props.moduleName}
					parameters={parameterss}
					isVertical={isVertical}
				/>
			</div>
		</div>
	);
};

export default Print;
