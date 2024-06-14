import whatsappwebjs from "whatsapp-web.js";
const { Client, LocalAuth, MessageMedia } = whatsappwebjs;
import qrcode from "qrcode-terminal";
import fs from "fs";
import mime from "mime-types";

const client = new Client({
  webVersionCache: {
    type: "remote",
    // remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    remotePath: "https://raw.githubusercontent.com/guigo613/alternative-wa-version/main/html/2.2413.51-beta-alt.html",
  },
  puppeteer: {
    headless: true,
  },
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", (msg) => {
  console.log(msg.body);
  if (msg.body == "oi") {
    msg.reply("ola");
  }
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
  console.error("AUTHENTICATION FAILURE", msg);
});

const main = async () => {
  await client.initialize();

  // await printGrupos();

  await printGroupParticipants("120363165773523865@g.us");

  await client.sendMessage("5519983136930@c.us", "Hello World 1");
  await sendMediaMessage("5519983136930", "./test.png");
  await sendMediaMessage("5519983136930", "./zapmein-high.avi");
  await client.sendMessage("5519983136930@c.us", "Hello World 2");
};

const printGrupos = async () => {
  const chats = await client.getChats();
  const groups = chats.filter((chat) => chat.isGroup);
  groups.forEach((group) => {
    console.log(`- ${group.name} (ID: ${group.id._serialized})`);
  });
};

const printGroupParticipants = async (groupId) => {
  const group = await client.getChatById(groupId);
  const participants = await group.participants;

  console.log(`Group: ${group.name} (ID: ${group.id._serialized})`);
  console.log(`Participants: ${participants.length}`);
  // participants.forEach((participant) => {
  //   console.log(`- (ID: ${participant.id._serialized})`);
  // });
};

const sendMediaMessage = async (phoneNumber, filePath) => {
  try {
    // Lê o arquivo e converte para base64
    const imageData = fs.readFileSync(filePath, { encoding: "base64" });
    const mimetype = mime.lookup(filePath);

    // Cria um objeto MessageMedia com os dados base64
    const media = new MessageMedia(mimetype, imageData);

    // Envia a imagem
    await client.sendMessage(`${phoneNumber}@c.us`, media);

    console.log("Imagem enviada com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar a imagem:", error);
  }
};

main();
