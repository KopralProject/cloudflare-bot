const axios = require('axios');
const { getZoneId, listDNSRecords } = require('../utils/cloudflare');

// Dapatkan IP publik server
async function getPublicIP() {
  const res = await axios.get('https://api.ipify.org?format=json');
  return res.data.ip;
}

// Update DNS A Record di Cloudflare
async function updateDNSRecord(cfToken, zoneId, recordId, name, newIP) {
  await axios.put(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
    {
      type: "A",
      name,
      content: newIP,
      ttl: 1,
      proxied: false
    },
    {
      headers: {
        'Authorization': `Bearer ${cfToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

// Periksa dan update jika IP berubah
async function checkAndUpdateIP(cfToken, zoneId, domain, recordName) {
  try {
    const currentIP = await getPublicIP();
    const records = await listDNSRecords(cfToken, zoneId);

    const record = records.find(r => r.name === `${recordName}.${domain}` || r.name === recordName);
    if (!record) throw new Error("DNS record tidak ditemukan");

    if (record.content !== currentIP) {
      console.log(`IP berubah. Mengupdate ${record.name} dari ${record.content} ke ${currentIP}`);
      await updateDNSRecord(cfToken, zoneId, record.id, record.name, currentIP);
      return { changed: true, oldIP: record.content, newIP: currentIP };
    }

    return { changed: false, ip: currentIP };
  } catch (error) {
    console.error("Gagal memeriksa atau mengupdate IP:", error.message);
    return { error: error.message };
  }
}

module.exports = { checkAndUpdateIP, getPublicIP };