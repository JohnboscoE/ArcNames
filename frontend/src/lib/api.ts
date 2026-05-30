import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export async function checkName(name: string) {
  const res = await api.get(`/api/names/check/${name}`)
  return res.data
}

export async function resolveName(name: string) {
  const res = await api.get(`/api/names/resolve/${name}`)
  return res.data
}

export async function getNameInfo(name: string) {
  const res = await api.get(`/api/names/info/${name}`)
  return res.data
}

export async function getOwnerNames(address: string) {
  const res = await api.get(`/api/names/owner/${address}`)
  return res.data
}

export async function getAllNames() {
  const res = await api.get("/api/names/all")
  return res.data  // returns { total, names }
}

export async function getStats() {
  const res = await api.get("/api/names/stats")
  return res.data
}