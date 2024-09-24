const socket = new WebSocket(`ws://${window.location.hostname}:5001`);

// Connection opened
socket.addEventListener('open', function (event) {
  console.log('Connected to WebSocket server');
  
  // Example: Send a message when connected
  socket.send(JSON.stringify({
      type: 'init',
      data: {},
      message: 'Hello from Admin'
  }));
});

// Listen for messages
socket.addEventListener('message', function (event) {
  const data = JSON.parse(event.data)
  if (data.origin === 'client') {
    console.log('Message from client:', data);
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
      type: 'pairings',
      data: {},
      message: '',
      origin: 'admin',
    }
    console.log('WebSocket sending message:', message)
    socket.send(JSON.stringify(message))
  } else {
    console.error('WebSocket is not open.');
  }
}
