// ---------- SHARED NETWORKING HELPERS ----------

function ipToOctets(str) {
  const parts = (str || '').trim().split('.').map(s => parseInt(s, 10));
  if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) return null;
  return parts;
}
function octetsToIp(octets) { return octets.join('.'); }
function octetToBinary(n) { return n.toString(2).padStart(8, '0'); }
function octetsToBinary(octets) { return octets.map(octetToBinary); }
function binaryToOctet(bin) { return parseInt(bin, 2); }

// 32-bit arithmetic is done via a plain number (not bitwise <<) for the top
// octet, since JS's << treats operands as signed 32-bit and 255<<24
// overflows into a negative number.
function octetsToInt(o) {
  return (o[0] * 16777216 + o[1] * 65536 + o[2] * 256 + o[3]) >>> 0;
}
function intToOctets(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
}
function prefixToMaskInt(prefix) {
  if (prefix <= 0) return 0;
  if (prefix >= 32) return 0xFFFFFFFF >>> 0;
  return (0xFFFFFFFF << (32 - prefix)) >>> 0;
}
function prefixToMaskOctets(prefix) { return intToOctets(prefixToMaskInt(prefix)); }
