# @clysema/dhcpcd

[![npm (scoped)](https://img.shields.io/npm/v/@clysema/dhcpcd.svg)](https://www.npmjs.com/package/@clysema/dhcpcd)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/@clysema/dhcpcd.svg)](https://www.npmjs.com/package/@clysema/dhcpcd)

Updates `/etc/dhcpcd.conf` and reboots the device.

## Usage

This module is intended to be used with the `@clysema/http` module in order
to enable a `/dhcpcd` post endpoint.

```bash
npm install @clysema/dhcpcd @clysema/http
```

Use an `http` module config/http.json like this:
```json
"host": "0.0.0.0",
"root": "/home/pi/app/www",
"post": ["dhcpcd"]
}
```

Create an empty config file for the `dhcpcd` module (no config is needed but the
file must exist).
```bash
touch config/dhcpcd.json
```

Then, somewere in the app loop:
```js
try { await app.modules.dhcpcd(app); }
catch (e) { ... }
```

## Test

Using auth (USERNAME=<username> PASSWORD=<password> npm start)
```
curl -d \
'{interface: "eth0", dhcp: true, ip_address: "", routers: "", domain_name_servers: ""}' \
-u <username>:<password> \
-H "Content-Type: application/json" \
-X POST http://<device_ip>:4000/dhcpcd
```

## GUI

You can place a production build of the `dhcpcd-ui` package in the root
configured folder (`/home/pi/app/www` in the above example) to be served by
the app.
