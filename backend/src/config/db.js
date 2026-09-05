import dns from 'node:dns'
import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set')
  }

  // Some local setups (VPNs, Cloudflare WARP, etc.) point Node's resolver at
  // a loopback DNS proxy that refuses Node's own lookups even though the OS
  // resolver works fine. Only kicks in if DNS_SERVERS is set.
  if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()))
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  console.log('Connected to MongoDB')
}
