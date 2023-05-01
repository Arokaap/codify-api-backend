require('dotenv').config()
require('./mongo')
const notFound = require('./middleware/notFound.js')
const express = require('express')
const logger = require('./loggerMiddleware')
const cors = require('cors')
const handleErrors = require('./middleware/handleErrors')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const app = express()
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const coursesRouter = require('./controllers/courses')
const categoriesRouter = require('./controllers/categories')
const lessonsRouter = require('./controllers/lessons')

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

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

app.use('/api/users', usersRouter)
app.use('/api/courses', coursesRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/lessons', lessonsRouter)
app.use('/api/login', loginRouter)
app.use(notFound)

app.use(Sentry.Handlers.errorHandler())
app.use(handleErrors)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
