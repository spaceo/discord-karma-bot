const { default: axios } = require("axios");
const Discord = require("discord.js");
const config = require("./config.json");
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
const prefix = "!";
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || '';
const USERS_JSON = process.env.USERS_JSON || '';

const envCheck = (envName, config) => {
  if (!process.env[envName]) {
    throw `${envName} env variable is missing!`;
  };
};

[
  'BOT_TOKEN',
  'GIPHY_API_KEY',
  'USERS_JSON'
].map((envName) => envCheck(envName));

let karmaStore = JSON.parse(USERS_JSON);
const constructGiphyUrl = ({ url, apiKey, searchTerm }) =>
  `${url}?api_key=${apiKey}&q=${searchTerm}`;

client.on("messageCreate", function(message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase();
  const messageData = [];

  if (command === "karma") {
    message.mentions.users.map((user) => {
      const karma = ++karmaStore[user.username];
      messageData.push(`Yay! ${user} har nu: ${karma} point`);
    });

    axios.get(constructGiphyUrl({...config.giphy, apiKey: GIPHY_API_KEY}))
    .then(function (response) {
      const { data: { data } } = response;

      if (data.length) {
        const gif = data[Math.floor(Math.random() * data.length)];
        messageData.push(gif.url);
      }
    })
    .catch(function (error) {
      console.log(error);
    })
    .then(function (){
      message.reply(messageData.join("\n"));
    });
  }

  if (command === "karma-status") {
    const karmaUsers = Object.keys(karmaStore);
    karmaUsers.forEach((user) => {
      messageData.push(`${user}: ${karmaStore[user]}`);
      message.reply(messageData.join("\n"));
    });
  }

});

client.login(BOT_TOKEN);
