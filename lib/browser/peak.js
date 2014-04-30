var socket = io.connect();
socket.on('refresh',
  function () {
    location.reload();
  }
)
