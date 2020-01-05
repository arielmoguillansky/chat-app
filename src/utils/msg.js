const generateMsg = (userName, text) => {
	return {
		userName,
		text,
		createdAt: new Date().getTime()
	}
}

const generateUrlMsg = (userName, url) => {
	return {
		userName,
		url,
		createdAt: new Date().getTime()
	}
}

module.exports = {
	generateMsg,
	generateUrlMsg
}