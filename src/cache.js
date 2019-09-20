const get = require("lodash.get")
const JSON5 = require("json5")
const set = require("lodash.set")
const pickBy = require("lodash.pickby")

module.exports = class Cache {
  constructor() {
    this.commitHash = "0000000000000000"
    this.object = {}
    this.files = {}
  }

  async update(commit) {
    if (commit.sha() !== this.commitHash) {
      const fileEntries = await this.getFileEntries(commit)
      const { object, files } = await this.buildData(fileEntries)

      this.commitHash = commit.sha()
      this.object = object
      this.files = files
    }
  }

  async getFileEntries(commit) {
    const tree = await commit.getTree()
    return new Promise((resolve, reject) => {
      const files = []
      tree.walk(true)
        .on("end", () => resolve(files))
        .on("error", error => reject(error))
        .on("entry", entry => {
          if (entry.name().endsWith(".json")) {
            files.push(entry)
          }
        })
        .start()
    })
  }

  async buildData(fileEntries) {
    const object = {}
    const files = {}
    for (const entry of fileEntries) {
      const blob = await entry.getBlob()
      const fileData = JSON5.parse(blob.content())
      const path = entry.path().slice(0, -5)
      files[path] = fileData
      set(object, path.split("/"), fileData)
    }

    return { object, files }
  }

  getCommitHash() {
    return this.commitHash
  }

  getObject(path) {
    if (path) {
      return get(this.object, path.split("/"))
    } else {
      return this.object
    }
  }

  getFiles(path) {
    if (path) {
      return pickBy(this.files, (data, file) => file.startsWith(path))
    } else {
      return this.files
    }
  }
}
