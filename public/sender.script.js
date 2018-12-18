var socket;

window.onload = function() {
	
	socket = io.connect();
	
	socket.emit("setRole","sender");
 
	document.getElementById("fileSelector").addEventListener("change", function(){	
		submitImg();
	});

	socket.on('receiveMsgHistory', (data) => {		
		console.log(data)
		data.msgHistory.forEach((item) => {
			let name = item.name1 == 'sender' ? 'You' : item.name2
			let align = item.name1 == 'sender' ? 'blue' : 'white'
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
	    	let msgData = {from: 'sender', to: 'receiver', msg: msg}
	      	socket.emit('sendMsg', msgData)
	      	$("#inputMsg").val('')
	      	$("#msgBox").append('<span style="background: blue">You: ' + msg + '</span><br>');
	    }
	})

	$("#inputMsg").on('input', (e) => {
		if (e.data != '') {
			let typingData = {from: 'sender', to: 'receiver', typing: true}
			socket.emit('typing', typingData)
		} 
	})


	// $("#stupidBtn").on('click', function(e){  	
	//     if (true){    
	//     	let msg = $("#inputMsg").val()    	
	//     	console.log(msg)
	//     	msgData = {from: 'sender', to: 'receiver', msg: msg}
	//       	socket.emit('sendMsg', msgData)
	//       	$("#inputMsg").val('')
	//       	$("#msgBox").append('<span style="text-align: right">You: ' + msg + '</span>');
	//     }    
	// })
};
 
function submitImg(){
	var selector = document.getElementById("fileSelector");
	var img = document.getElementById("review");
 
	var reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;
            socket.emit("sendImage", {base64:e.target.result});
        }
 reader.readAsDataURL(selector.files[0]);
}

