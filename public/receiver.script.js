var socket;

window.onload = function(){
	socket = io.connect();
	socket.emit('setRole', 'receiver');
	socket.on('receiveImage', function(data){
		document.getElementById("showPhoto").src = data.path
	});

	socket.on('receiveMsgHistory', (data) => {
		data.msgHistory.forEach((item) => {
			let name = item.name1 == 'receiver' ? 'You' : item.name1
			let align = item.name1 == 'receiver' ? 'blue' : 'white'
			$("#msgBox").append('<span style="background: ' + align + '">' + name + ': ' + item.msg + '</span><br>');	
		})
	})

	socket.on('receiveMsg', (data) => {
		$("#typing-indicator-container").hide()
		$("#msgBox").append('<span style="background: white">' + data.from + ': ' + data.msg + '</span><br>');
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
	    	console.log(msg)
	    	msgData = {from: 'receiver', to: 'sender', msg: msg}
	      	socket.emit('sendMsg', msgData)
	      	$("#inputMsg").val('')
	      	$("#msgBox").append('<span style="background: blue">You: ' + msg + '</span><br>');
	    }

	    return
	})

	$("#inputMsg").on('input', (e) => {
		if (e.data != '') {
			let typingData = {from: 'receiver', to: 'sender', typing: true}
			socket.emit('typing', typingData)
		} 
	})
}

