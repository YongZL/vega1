const errMsg = '文件名不能包含下列符号：/:?"|<>';
const patterns = /["/\:?|<>]+/;

export { errMsg, patterns };
