import fs from 'node:fs/promises'
import express from 'express'
import { Transform } from 'node:stream'
import { ViteDevServer } from 'vite'
import { injectConfigToHtml } from './config.js'

// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT ? parseInt(process.env.PORT) : 5173
const base = process.env.BASE || '/'
const ABORT_DELAY = 10000
const DIST_DIR = process.env.DIST_DIR || './dist'
const BIND_ADDRESS = process.env.BIND_ADDRESS || '0.0.0.0'

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile(`${DIST_DIR}/client/index.html`, 'utf-8')
  : ''

// Create http server
const app = express()

// Add Vite or respective production middlewares
let vite: ViteDevServer | null = null
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv(`${DIST_DIR}/client`, { extensions: [] }))
}

// Serve HTML
app.use('*all', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')

    /** @type {string} */
    let template
    /** @type {import('./src/entry-server.ts').render} */
    let render
    if (!isProduction && vite) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
    } else {
      template = templateHtml
      render = (await import(`${DIST_DIR}/server/entry-server.js`)).render
    }

    let didError = false

    const { pipe, abort } = render(url, {
      onShellError() {
        res.status(500)
        res.set({ 'Content-Type': 'text/html' })
        res.send('<h1>Something went wrong</h1>')
      },
      onShellReady() {
        res.status(didError ? 500 : 200)
        res.set({ 'Content-Type': 'text/html' })

        const transformStream = new Transform({
          transform(chunk, encoding, callback) {
            res.write(chunk, encoding)
            callback()
          },
        })

        const [htmlStart, htmlEnd] = template.split(`<!--app-html-->`)

        res.write(htmlStart)

        transformStream.on('finish', () => {
          res.end(injectConfigToHtml(htmlEnd))
        })

        pipe(transformStream)
      },
      onError(error: Error) {
        didError = true
        console.error(error)
      },
    })

    setTimeout(() => {
      abort()
    }, ABORT_DELAY)
  } catch (e) {
    if (e instanceof Error) {
      vite?.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    } else {
      res.status(500).end('Unknown error')
    }
  }
});

// Start http server
app.listen(port, BIND_ADDRESS, () => {
  console.log(`Server started at http://${BIND_ADDRESS}:${port}`)
})
