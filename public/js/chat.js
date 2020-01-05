const socket = io();

//elements
const msgForm = document.querySelector('#msg-form');
const msgInput = document.querySelector('input[name="msg"]');
const msgFormBtn = document.querySelector('.send-btn');
const msgLocBtn = document.querySelector('.send-loc-btn');
const msgDiv = document.querySelector('#msg');
const sideBarDiv = document.querySelector('.chat__sidebar');

//Templates
const msgTemplate = document.querySelector('#message-template').innerHTML;
const locTemplate = document.querySelector('#location-template').innerHTML;
const welcomeTemplate = document.querySelector('#welcome-template').innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { userName, roomName } = Qs.parse(location.search, { ignoreQueryPrefix: true });

//Functions
const toUpperCase = (name) => {
	const upperName = name.replace(/^\w/, function (chr) {
		return chr.toUpperCase();
	});
	return upperName
}

const autoScroll = () => {
	const newMsg = msgDiv.lastElementChild;

	//Height of the new mwssage
	const newMsgStyles = getComputedStyle(newMsg);
	const newMsgMargin = parseInt(newMsgStyles.marginBottom)
	const newMsgHeight = newMsg.offsetHeight + newMsgMargin;

	//Visible Height
	const visibleHeight = msgDiv.offsetHeight;

	//Height of msgs container
	const contentHeight = msgDiv.scrollHeight;

	//Distance of scrolling
	const scrollOffset = msgDiv.scrollTop + visibleHeight;

	if (contentHeight - newMsgHeight <= scrollOffset) {
		msgDiv.scrollTop = msgDiv.scrollHeight;
	}

}


msgInput.addEventListener('keyup', (e) => {
	const input = e.target.value;
	(input === '') ? (msgFormBtn.disabled = true) : (msgFormBtn.disabled = false)
})


////////////////////////////////////////////////////////////////////////////////////////////////////////////


socket.on('chat-message', (message) => {
	const html = Mustache.render(msgTemplate, {
		userName: toUpperCase(message.userName),
		message: message.text,
		msgCreatedAt: moment(message.createdAt).calendar()
	})
	msgDiv.insertAdjacentHTML('beforeend', html);
	autoScroll();
})

socket.on('welcome-message', (welcomeMsg) => {
	console.log(welcomeMsg);
	const html = Mustache.render(welcomeTemplate, {
		welcomeMsg: welcomeMsg.text,
		userName: toUpperCase(welcomeMsg.userName)
	})
	msgDiv.insertAdjacentHTML('beforeend', html)
})

socket.on('join-message', (joinMsg) => {
	console.log(joinMsg);
	const html = Mustache.render(welcomeTemplate, {
		joinMsg: joinMsg.text,
		joinedAt: moment(joinMsg.createdAt).format('h:mm a')
	})
	msgDiv.insertAdjacentHTML('beforeend', html)
})

socket.on('disc-message', (leftMsg) => {
	console.log(leftMsg);
	const html = Mustache.render(welcomeTemplate, {
		leftMsg: leftMsg.text,
		leftAt: moment(leftMsg.createdAt).format('h:mm a')
	})
	msgDiv.insertAdjacentHTML('beforeend', html)
})

msgForm.addEventListener('submit', (e) => {
	e.preventDefault();

	msgFormBtn.setAttribute('disabled', 'disabled')

	let userMsg = e.target.elements.msg.value;

	socket.emit('user-msg', userMsg, (error) => {

		setTimeout(() => {
			msgFormBtn.removeAttribute('disabled');
			msgInput.value = '';
			msgInput.focus();
		}, 500)

		if (error) return console.log(error)

		console.log('The message was delivered')
	})
})

msgLocBtn.addEventListener('click', (e) => {
	if (!navigator.geolocation) return alert('Geolocation is not supported by your browser')

	msgLocBtn.setAttribute('disabled', 'disabled');

	navigator.geolocation.getCurrentPosition((pos) => {
		coordsObj = {
			lat: pos.coords.latitude,
			long: pos.coords.longitude
		}
		socket.emit('send-loc', coordsObj, (locStatus) => {
			setTimeout(() => {
				msgLocBtn.removeAttribute('disabled')
			}, 500)
			console.log('Location shared')
		})
	})

})

socket.on('sendLoc', (url) => {

	const html = Mustache.render(locTemplate, {
		url: url.url,
		createdAt: moment(url.createdAt).calendar(),
		userName: toUpperCase(url.userName)
	})
	msgDiv.insertAdjacentHTML('beforeend', html);
	autoScroll();
})

socket.emit('join', { userName, roomName }, (error) => {
	if (error) {
		alert(error)
		location.href = '/'
	}
})

socket.on('roomData', ({ roomName, users }) => {
	const html = Mustache.render(sideBarTemplate, {
		roomName,
		users
	})
	sideBarDiv.innerHTML = html;
})
