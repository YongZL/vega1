import api from '@/constants/api';
import request from '@/utils/request';
import BrowserPrint from '@/libs/BrowserPrint';
import { Select } from 'antd';
import React, { Component } from 'react';
import { cloneDeep } from 'lodash';
import { notification } from '@/utils/ui';

const Option = Select.Option;
class ThermalPrinter extends Component {
	constructor() {
		super();
		this.state = {
			selected_device: {},
			devices: [],
			searchPrinterCount: 0,
			printList: [],
		};
	}
	componentDidMount() {
		const permissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
		permissions.includes('fetch_local_barcode_printer')
			? this.getDeviceInfoOutside()
			: this.getPrintList();
	}
	// 用户可用的打印机
	getPrintList = async () => {
		await request(`${api.public.printerList}`).then((res) => {
			if (res && res.code === 0) {
				this.setState(
					{
						printList: res.data,
					},
					() => {
						this.getDeviceInfo();
					},
				);
			} else {
				notification.error('接口查询可用打印机失败');
			}
		});
	};

	// 获取打印设备信息--院内
	getDeviceInfo = () => {
		let { printList } = this.state;
		let selected_device = {};
		let devices = [];
		BrowserPrint.getLocalDevices({
			a: (device_list) => {
				if (device_list.printer) {
					for (let i = 0; i < printList.length; i++) {
						const deviceMatches = device_list.printer.filter(
							(item) => item.uid === printList[i].ipAddress,
						);
						for (let j = 0; j < deviceMatches.length; j++) {
							if (
								!devices.filter((item) => {
									return item.uid === deviceMatches[j].uid && item.name === deviceMatches[j].name;
								}).length
							) {
								let device = cloneDeep(deviceMatches[j]);
								device.name = printList[i].name;
								device.id = printList[i].id;
								device.uid = printList[i].ipAddress;
								devices.push(device);
							}

							// if (
							//   !devices.filter((item) => {
							//     return item.id === deviceMatches[j].id;
							//   }).length
							// ) {
							//   let device = cloneDeep(deviceMatches[j]);
							//   device.name = printList[i].name;
							//   device.id = printList[i].id;
							//   devices.push(device);
							// }
						}
					}
				}
				if (devices.length > 0) {
					selected_device = devices[0];
				}
				this.setState({ devices, selected_device });
			},
			c: () => {
				notification.error('查询本地打印机设备失败');
			},
		});

		// 上面的方法为异步
		setTimeout(() => {
			let searchPrinterCount = this.state.searchPrinterCount++;
			this.setState({ devices, selected_device, searchPrinterCount });
			if (!selected_device && searchPrinterCount <= 5) {
				// 查找5次
				this.getDeviceInfo();
			}
		}, 100);
	};

	// 获取打印设备信息--院外
	getDeviceInfoOutside = () => {
		let selected_device = {};
		let devices = [];
		BrowserPrint.getLocalDevices({
			a: (device_list) => {
				const printer = device_list.printer;
				if (printer.length > 0) {
					selected_device = device_list.printer[0];
				}
				this.setState({ devices: printer, selected_device });
			},
			c: () => {
				notification.error('查询本地打印机设备失败');
			},
		});

		// 上面的方法为异步
		setTimeout(() => {
			let searchPrinterCount = this.state.searchPrinterCount++;
			this.setState({ devices, selected_device, searchPrinterCount });
			if (!selected_device && searchPrinterCount <= 5) {
				// 查找5次
				this.getDeviceInfoOutside();
			}
		}, 100);
	};

	setCurrentDevice = (value, option) => {
		this.setState({ selected_device: this.state.devices[value] });
	};

	print(data) {
		let { selected_device } = this.state;
		return { xhr: selected_device.send(data), data: data };
	}

	render() {
		return (
			<Select
				style={{ width: 200 }}
				onChange={(value, option) => this.setCurrentDevice(value, option)}
				value={this.state.selected_device ? this.state.selected_device.name : ''}>
				{this.state.devices.map((device, index) => {
					return <Select.Option key={index}>{device.name}</Select.Option>;
				})}
			</Select>
		);
	}
}
export default ThermalPrinter;
