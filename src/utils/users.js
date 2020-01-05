const users = [];

const addUser = ({ id, userName, roomName }) => {
	//Clean the data
	userName = userName.trim().toLowerCase();
	roomName = roomName.trim().toLowerCase();

	//Data validation
	if (!userName || !roomName) return { error: "Username and room are required" }

	//Check for existing user
	const existingUser = users.find((user) => {
		return user.roomName === roomName && user.userName === userName
	})

	//Validate user name
	if (existingUser) return { error: 'Username is in use' }
	//Store user
	const user = { id, userName, roomName }
	users.push(user)
	return { user }
}

const removeUser = (id) => {
	const index = users.findIndex((user) => {
		return user.id === id
	})

	if (index !== -1) {
		return users.splice(index, 1)[0]
	}
}

const getUser = (id) => {
	return users.find((user) => {
		return user.id === id
	})

}

const getUsersByRoom = (roomName) => {
	roomName = roomName.trim().toLowerCase();
	return users.filter((user) => {
		return user.roomName === roomName
	})
}

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersByRoom
}