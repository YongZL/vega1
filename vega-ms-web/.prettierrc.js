const fabric = require('@umijs/fabric');

module.exports = {
	...fabric.prettier,
	semi: true, // 在每个语句后加上分号
	singleQuote: true, // 使用单引号，会把双引号转换为单引号(对jsx无效)。
	tabWidth: 2, // 缩进2个空格
	useTabs: true, // 使用制表符进行缩进。
	jsxSingleQuote: true, // 在 jsx 或 tsx文件使用单引号
	/**
	 * 对象属性需要加引号设置 default: "as-needed"
	 * "as-needed" :仅在需要的时候使用
	 * "consistent" : 有一个属性需要引号，就都需要引号
	 * "preserve" :保留用户输入的情况
	 */
	quoteProps: 'as-needed',
	/**
	 * 在多行逗号分隔的语法结构中，尽可能打印尾随逗号 default "es5"
	 * "es5": 在 es5 语法中，数组，对象，属性以分号结尾。TS 不加
	 * "none" : 不需要逗号
	 * "all": 尽可能在后面加上逗号
	 */
	trailingComma: 'all',
	bracketSpacing: true, // 大括号内的首尾需要空格
	bracketSameLine: true, // 标签 > 放在下一行
	/**
	 * 箭头函数 一个参数时是否用括号包裹
	 * "always": 总是用括号包裹
	 * "avoid": 不用括号包裹
	 */
	arrowParens: 'always',
	/**
	 * 在 HTML、Vue 和 JSX 中每行强制执行单个属性
	 *    true: 强制执行，一个属性占一行
	 *    false: 不强制执行一个属性占一行
	 */
	singleAttributePerLine: true,
};
