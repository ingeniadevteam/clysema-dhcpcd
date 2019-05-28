"use strict";

const fs = require('fs');
const spawnSync = require('child_process').spawnSync;

module.exports = async function () {
  return async (app) => {
    // get the /etc/dhcpcd.conf file content
    let config, configArray, paramsArray, keyArray;

    if (!app.dhcpcd) return;

    // get the actual data
    try {
      config = (await fs.readFileSync("/etc/dhcpcd.conf")).toString();
    } catch (e) {
      delete app.dhcpcd;
      throw e;
    }

    // create an array to manage the config
    configArray = config.split('\n');

    keyArray = [
      `interface ${app.dhcpcd.interface}`,
      `profile static_${app.dhcpcd.interface}`,
      `static ip_address`,
      `static ip6_address`,
      `static routers`,
      `static domain_name_servers`,
      `fallback static_${app.dhcpcd.interface}`
    ];

    paramsArray = [
      `interface ${app.dhcpcd.interface}`,
      `static ip_address=${app.dhcpcd.ip_address}`,
      `static routers=${app.dhcpcd.routers}`,
      `static domain_name_servers=${app.dhcpcd.domain_name_servers}`,
    ];

    // comment out all key parameters
    for (let index in configArray) {
      for (let param of keyArray) {
        if (configArray[index].includes(param)) {
          // is commented out?
          if (configArray[index][0] !== '#') {
            // comment out
            configArray[index] = `#${configArray[index]}`
          }
        }
      }
    }

    // push the new config if we want static ip
    if (!app.dhcpcd.dhcp) {
      for (let param of paramsArray) {
        configArray.push(param);
      }
    }

    // append a new line at the end
    configArray.push('\n');

    // create a string managing multiple new lines
    const output = configArray.join('\n').replace(new RegExp("\n{2,}", "g"), "\n");
    // save the string into /tmp/dhcpcd.conf
    await fs.writeFileSync("/tmp/dhcpcd.conf", output);

    // remove current config
    delete app.dhcpcd;

    // copy it to /boot as root
    if (!app.modules.env.isDevelopment) {
      await spawnSync('sudo', ['cp', '/tmp/dhcpcd.conf', '/etc']);
      setTimeout(() => spawnSync('sudo', ['reboot']), 500);
    }

    app.modules.logger.log("warn", "dhcpcd.conf changed. Will reboot!");
  };
};
