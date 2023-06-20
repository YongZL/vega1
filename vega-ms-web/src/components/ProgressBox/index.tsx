import './index.less';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Progress extends Component<{}, { show: boolean }> {
	constructor(props: {}) {
		super(props);
		this.state = { show: false };
	}

	start() {
		// 开始显示
		this.setState({
			show: true,
		});
	}

	done() {
		// 结束隐藏
		this.setState({
			show: false,
		});
	}

	render() {
		return (
			<div
				className='myprogress'
				style={this.state.show ? { display: 'block' } : { display: 'none' }}>
				<div className='bar'>
					<div className='peg' />
				</div>
			</div>
		);
	}
}

// 创建元素追加到body
const div = document.createElement('div');
document.body.appendChild(div);

const ProgressBox = ReactDOM.render(React.createElement(Progress, {}), div);
export default ProgressBox;
