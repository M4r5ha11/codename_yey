const { VoiceChannel } = require("eris");

module.exports = {
  name: "modlogs",
  group: "settingsGroup",
  description: "modlogsDescription",
  usage: "modlogsUsage",
  requiredPermissions: "manageGuild",
  guildOnly: true,
  async run(client, msg, args, prefix, lang) {
    let channel = args[0];
    const modlogChannel = await db.modlogs.findOrCreate({ where: { server: msg.guild.id } })
      .then(i => i[0].channel ? client.getChannel(i[0].channel) : undefined);

    if (!channel) {
      let description;
      if (modlogChannel) {
        description = lang.modlogsEnabled(modlogChannel.mention);
      } else {
        description = lang.modlogsDisabled;
      }

      const embed = {
        title: lang.modlogs,
        description,
        color: Math.round(Math.random() * 16777216) * 1,
        footer: {
          text: lang.modlogsTip(prefix),
        },
      };

      return msg.channel.createMessage({ embed });
    } else {
      if (channel === "disable") {
        await db.modlogs.update(
          { channel: null },
          { where: { server: msg.guild.id } }
        );

        return msg.channel.createMessage(lang.modlogsDisableSuccess);
      } else {
        if (channel.startsWith("<#")) {
          channel = channel.replace("<#", "").replace(">", "");
        }

        const ch = msg.guild.channels.find(c => c.id === channel || c.name === channel);
        if (!ch || (ch && ch.type > 0)) {
          return msg.channel.createMessage(lang.invalidChannel);
        }
        if (!ch.memberHasPermission(msg.guild.me, "sendMessages") || !ch.memberHasPermission(msg.guild.me, "embedLinks")) {
          const embed = {
            title: lang.modlogsDontHavePerms,
            description: lang.modlogsDontHavePermsDesc,
            color: 3066993,
          };
          return msg.channel.createMessage({ embed });
        }

        await db.modlogs.update(
          { channel: ch.id },
          { where: { server: msg.guild.id } },
        );

        return msg.channel.createMessage(lang.modlogsSuccess(ch.name));
      }
    }
  }
};
