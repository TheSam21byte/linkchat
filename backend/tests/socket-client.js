import { io } from "socket.io-client";
import readline from "readline";

const SERVER_URL = "http://localhost:4000";

const username = process.argv[2] || "UsuarioPrueba";
const channelId = process.argv[3] || "general";

const socket = io(SERVER_URL);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

socket.on("connect", () => {
  console.log("✅ Conectado al servidor");
  console.log("Socket ID:", socket.id);

  socket.emit("join_channel", {
    username,
    channelId
  });

  console.log(`👤 Usuario: ${username}`);
  console.log(`📢 Canal: ${channelId}`);
  console.log("");
  console.log("Comandos disponibles:");
  console.log("/usuarios");
  console.log("/privado SOCKET_ID mensaje");
  console.log("/salir");
  console.log("");
  rl.prompt();
});

socket.on("system_message", (data) => {
  console.log(`\n[${data.hora}] ${data.usuario}: ${data.mensaje}`);
  rl.prompt();
});

socket.on("receive_message", (data) => {
  console.log(`\n[${data.hora}] ${data.usuario}: ${data.mensaje}`);
  rl.prompt();
});

socket.on("users_list", (users) => {
  console.log("\nUsuarios conectados:");
  users.forEach((user) => {
    console.log(`- ${user.username} | socketId: ${user.socketId}`);
  });
  rl.prompt();
});

socket.on("receive_private_message", (data) => {
  console.log(`\n🔒 Privado de ${data.usuario}: ${data.mensaje}`);
  rl.prompt();
});

socket.on("disconnect", () => {
  console.log("\n❌ Desconectado del servidor");
});

rl.on("line", (input) => {
  const message = input.trim();

  if (message === "") {
    rl.prompt();
    return;
  }

  if (message === "/salir") {
    socket.disconnect();
    rl.close();
    process.exit(0);
  }

  if (message === "/usuarios") {
    socket.emit("get_users", {
      channelId
    });
    rl.prompt();
    return;
  }

  if (message.startsWith("/privado ")) {
    const parts = message.split(" ");

    if (parts.length < 3) {
      console.log("Uso correcto: /privado SOCKET_ID mensaje");
      rl.prompt();
      return;
    }

    const toSocketId = parts[1];
    const privateMessage = parts.slice(2).join(" ");

    socket.emit("private_message", {
      toSocketId,
      fromUsername: username,
      message: privateMessage
    });

    rl.prompt();
    return;
  }

  socket.emit("send_message", {
    username,
    channelId,
    message
  });

  rl.prompt();
});