import whatsappwebjs from "whatsapp-web.js";
const { Client, LocalAuth, MessageMedia } = whatsappwebjs;
import qrcode from "qrcode-terminal";
import fs from "fs";
import mime from "mime-types";
import { setTimeout as sleep } from "timers/promises";

const clientsAuth = {
  matheus: "Matheus",
  zapmein: "ZapMeIn",
};

const client = new Client({
  // webVersion: "2.2412.54v2",
  // webVersion: "2.2412.54",
  webVersionCache: { type: "none" },
  puppeteer: {
    headless: false,
    executablePath: "/usr/bin/google-chrome",
  },
  authStrategy: new LocalAuth({ clientId: clientsAuth.zapmein }),
});

client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("Client is ready!");

  try {
    const data = fs.readFileSync("participants.txt", "utf8");
    const phoneNumbers = data.split("\n");
    console.log(phoneNumbers);
    for (const phone of phoneNumbers) {
      const phoneNumber = phone.trim();
      if (phoneNumber) {
        await performAction(phoneNumber);
        console.log("Action performed for:", phoneNumber);
      }
    }

    console.log("File processed and saved successfully.");
  } catch (err) {
    console.error("Error processing the file:", err);
  }

  // await printGrupos();

  // await printGroupParticipants("120363165773523865@g.us");

  // await client.sendStateTyping(); // Simulando Digitação
  // await sleep(1000); // Espera 1 segundp
  // await client.sendMessage(
  //   "5519997732969@c.us",
  //   "*Gilberto*\nOlá, seja muito bem-vindo a nossa Casa!\n 💙💛Diz aí, qual é o nosso desafio de hoje?\n 😄Nosso especialista irá garantir a atenção que você merece.\n Digite abaixo o assunto que vamos falar primeiro:\n 1  Orçamentos\n 2  Solicitação Retirada de Equipamento (Alugado)\n 3  Financeiro4  Dúvida após locação"
  // ); // Envia
  // await sendMediaMessage("5519997732969", "./test.png"); // Envia foto
  // await client.sendMessage("5519997732969@c.us", "oii");
  // await sendMediaMessage("5519983136930", "./zapmein-low.mp4"); // Envia video
  // await sleep(1000); // Espera 1 segundp
  // await sendMediaMessage("553498326866", "./audio.mp3");
});

client.on("message", async (msg) => {
  // console.log(msg);
  // await client.sendMessage("5519983136930@c.us", `Você tem uma nova mensagem: ${msg.body}`);
  // if (msg.body == "oi") {
  //   msg.reply("ola");
  // }
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
  console.error("AUTHENTICATION FAILURE", msg);
});

const main = async () => {
  await client.initialize();
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
  participants.forEach((participant) => {
    console.log(`- (ID: ${participant.id._serialized})`);
    fs.writeFileSync(`participants.txt`, participant.id._serialized + "\n", { flag: "a" });
  });
};

const sendMediaMessage = async (phoneNumber, filePath, asUser = true) => {
  try {
    const imageData = fs.readFileSync(filePath, { encoding: "base64" });
    const mimetype = mime.lookup(filePath);

    const media = new MessageMedia(mimetype, imageData);

    await client.sendMessage(phoneNumber, media, {
      sendMediaAsDocument: false,
      sendAudioAsVoice: asUser,
    });

    console.log("Arquivo enviado com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar o arquivo:", error);
  }
};

async function performAction(phoneNumber) {
  try {
    // await sendMediaMessage(phoneNumber, "./zapmein-low.mp4"); // Envia video
    // await sleep(500); // Espera 0.5 segund0
    await client.sendMessage(
      phoneNumber,
      `Olá, vi que você está no grupo de inglês, e gostaria de te apresentar o *Zap Me In!* 🚀 \n\nQue tal ter um companheiro de estudos para praticar inglês? 📖`
    );
    // await sleep(1000 * 60); // Espera 1 minuto
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

main();
