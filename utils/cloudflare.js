const axios = require('axios');

async function getZoneId(token, domain) {
  const res = await axios.get(`https://api.cloudflare.com/client/v4/zones`,  {
    headers: { Authorization: `Bearer ${token}` },
    params: { name: domain }
  });
  return res.data.result[0]?.id || null;
}

async function listDNSRecords(token, zoneId) {
  const res = await axios.get(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,  {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.result;
}

async function createWildcardRecord(token, zoneId, ip) {
  await axios.post(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, 
    {
      type: "A",
      name: `*.example.com`,
      content: ip,
      ttl: 1,
      proxied: false
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

async function deleteDNSRecord(token, zoneId, recordId) {
  await axios.delete(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,  {
    headers: { Authorization: `Bearer ${token}` }
  });
}

module.exports = {
  getZoneId,
  listDNSRecords,
  createWildcardRecord,
  deleteDNSRecord
};