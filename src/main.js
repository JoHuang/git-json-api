const bodyParser = require("body-parser")
const cors = require("cors")
const express = require("express")

const routes = require("./routes")

const app = express()
const port = process.env.PORT || 3000
const repoUri = process.env.REPO_URI

if (!repoUri) {
  console.error("REPO_URI environment variable must be set")
  process.exit(1)
}

app.use(bodyParser.json({ limit: process.env.BODY_SIZE_LIMIT || "100kb" }))
app.use(cors({ exposedHeaders: ["Git-Commit-Hash"] }))
app.use("/", routes(repoUri))

app.listen(port, () => {
  console.log(`git-json-api running on port ${port}`)
})
