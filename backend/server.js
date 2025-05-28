const express = require('express')
const axios = require('axios')
const cors = require('cors')

const app = express() // ✅ Moved this line up!

app.use(cors({
  origin: 'https://uptime-ui.onrender.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json())

const PORT = 3001
let urls = []
let statusMap = {}

app.post('/track', (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'URL is required' })
  if (!urls.includes(url)) urls.push(url)
  res.json({ message: `Now tracking ${url}` })
})

app.get('/status', (req, res) => {
  res.json(statusMap)
})

setInterval(async () => {
  for (const url of urls) {
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'UptimeBot/1.0' },
        maxRedirects: 5,
        timeout: 5000
      })
      statusMap[url] = response.status >= 200 && response.status < 400 ? 'UP' : 'DOWN'
    } catch {
      statusMap[url] = 'DOWN'
    }
  }
}, 60000)

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
