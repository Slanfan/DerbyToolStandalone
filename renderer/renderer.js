const { ipcRenderer } = require('electron');
const qr = require('qrcode');

document.addEventListener('DOMContentLoaded', async () => {
  // Get the local IP address from the main process
  const localIP = await ipcRenderer.invoke('getLocalIP');
  const adminUrl = `http://${localIP}:5001/admin`;
  const clientUrl = `http://${localIP}:5001/client`;

  // Set up the button click event to open the Admin Panel URL
  document.getElementById('open-admin-btn').addEventListener('click', () => {
    console.log('Open the admin panel')
    ipcRenderer.send('open-admin', adminUrl);
  });

  // Generate the QR code for the Client URL
  qr.toDataURL(clientUrl, (err, url) => {
    if (err) {
      console.error('Failed to generate QR code:', err);
      return;
    }
    document.getElementById('qrcode').src = url;
  });

  // Display the client URL
  document.getElementById('client-url').innerText = clientUrl;
});
