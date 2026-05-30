import forge from "node-forge"
import https  from "https"

const ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET
const API_KEY       = process.env.CIRCLE_API_KEY

function getPublicKey() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.circle.com",
      path:     "/v1/w3s/config/entity/publicKey",
      method:   "GET",
      headers:  { Authorization: `Bearer ${API_KEY}` },
    }
    https.get(options, (res) => {
      let data = ""
      res.on("data", chunk => data += chunk)
      res.on("end", () => resolve(JSON.parse(data).data.publicKey))
    }).on("error", reject)
  })
}

function encryptEntitySecret(publicKeyPem, entitySecret) {
  const publicKey   = forge.pki.publicKeyFromPem(publicKeyPem)
  const secretBytes = forge.util.hexToBytes(entitySecret)
  const encrypted   = publicKey.encrypt(secretBytes, "RSA-OAEP", {
    md:  forge.md.sha256.create(),
    mgf: forge.mgf.mgf1.create(forge.md.sha256.create()),
  })
  return forge.util.encode64(encrypted)
}

const publicKey  = await getPublicKey()
const ciphertext = encryptEntitySecret(publicKey, ENTITY_SECRET)

console.log("\n✅ Your Entity Secret Ciphertext:\n")
console.log(ciphertext)
console.log("\n👆 Paste this into Circle Console → Wallets → Configurator\n")