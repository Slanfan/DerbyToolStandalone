const socket = new WebSocket(`ws://${window.location.hostname}:5001`);

// Connection opened
socket.addEventListener('open', function (event) {
  console.log('Connected to WebSocket server');
});

// Listen for messages
socket.addEventListener('message', function (event) {
  const data = JSON.parse(event.data)
  if (data.origin === 'admin') {
    console.log('Message from admin:', data);
  }
});

socket.addEventListener('error', function (error) {
  console.error('WebSocket Error:', error);
});

socket.addEventListener('close', function (event) {
  console.log('WebSocket connection closed:', event);
});

function sendMessage() {
  if (socket.readyState === WebSocket.OPEN) {
    const message = {
      type: 'match-result',
      data: {},
      message: '',
      origin: 'client',
    }
    console.log('WebSocket sending message:', message)
    socket.send(JSON.stringify(message))
  } else {
    console.error('WebSocket is not open.');
  }
}
