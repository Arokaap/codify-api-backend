require('dotenv').config()
require('./mongo')
const Note = require('./models/Note')
const notFound = require('./middleware/notFound.js')
const express = require('express')
const logger = require('./loggerMiddleware')
const cors = require('cors')
const handleErrors = require('./middleware/handleErrors')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const app = express()

app.use(cors())
app.use(express.json())
app.use('/images', express.static('images'))

Sentry.init({
  dsn: 'https://fb564bfcd3ed468a9837e0f13df8c757@o4505096630566912.ingest.sentry.io/4505096645443584',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
    // Automatically instrument Node.js libraries and frameworks
    ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations()
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
})

// RequestHandler creates a separate execution context, so that all
// transactions/spans/breadcrumbs are isolated across requests
app.use(Sentry.Handlers.requestHandler())
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())

app.use(logger)

// const app = http.createServer((request, response) => {
//   response.writeHead(200, { "content-type": "application/json" });
//   response.end(JSON.stringify(notes));
// });

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({})
    .then((notes) => {
      response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  Note.findById(id).then(note => {
    note ? response.json(note) : response.status(400).end()
  }).catch(err => {
    next(err)
  })
})

app.put('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  const note = request.body

  const newNoteInfo = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then(result => {
      response.json(result)
    })
})

app.delete('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  Note.findByIdAndRemove(id).then(result => {
    response.status(204).end()
  }).catch(error => next(error))
})

app.post('/api/notes', (request, response) => {
  const note = request.body

  if (!note || !note.content) {
    return response.status(400).json({
      error: 'note.content is missing'
    })
  }

  const newNote = new Note({
    content: note.content,
    important: note.important !== 'undefined' ? note.important : false,
    date: new Date().toISOString()
  })

  newNote.save().then(savedNote => {
    response.json(savedNote)
  })
})

// The error handler must be before any other error middleware and after all controllers

app.use(notFound)

app.use(Sentry.Handlers.errorHandler())
app.use(handleErrors)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
