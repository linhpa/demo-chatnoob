var socket;

window.onload = function(){
	socket = io.connect();

	$("#gogogo").on('click', (e) => {
		let user = $("#user").val()
		let friend = $("#friend").val()

		$("#msgContainer").show()
		$("#userInfo").hide()
		$("#welcome").html('Welcome, ' + user)

    	socket.emit('setRole2', {
    		user: user,
    		friend: friend
    	})
    })

	socket.on('receiveMsgHistory', (data) => {
		data.msgHistory.forEach((item) => {
			let name = item.name1 == $("#user").val() ? 'You' : item.name1
			let align = item.name1 == $("#user").val() ? 'blue' : 'white'
			$("#msgBox").append('<span style="background: ' + align + '">' + name + ': ' + item.msg + '</span><br>')
		})
	})

	socket.on('receiveMsg', (data) => {
		$("#typing-indicator-container").hide()
		$("#msgBox").append('<span style="background: white">' + data.from + ': ' + data.msg + '</span><br>')
	})

	var typingTimeout

	socket.on('receiveTyping', (data) => {
		if (data.typing) {
			clearTimeout(typingTimeout)
			$("#typing-indicator-container").show()
			typingTimeout = setTimeout(function () {
				$("#typing-indicator-container").hide()
			}, data.dur*1000)
		}		
	})

	$("#inputMsg").on('keyup', function(e){    	
	    if (e.keyCode == 13){
	    	let msg = $("#inputMsg").val()
	    	
	    	msgData = {from: $("#user").val(), to: $("#friend").val(), msg: msg}
	      	socket.emit('sendMsg', msgData)
	      	$("#inputMsg").val('')
	      	$("#msgBox").append('<span style="background: blue">You: ' + msg + '</span><br>');
	    }

	    return
	})

	$("#inputMsg").on('input', (e) => {
		if (e.data != '') {
			let typingData = {from: $("#user").val(), to: $("#friend").val(), typing: true}
			socket.emit('typing', typingData)
		} 
	})
}

