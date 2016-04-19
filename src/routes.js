import express from "express"
import path from "path"

import { usingRepo } from "./repo"

export default new express.Router()
  .get("/latest", usingRepo(getMaster))
  .get("/config/:version", usingRepo(getConfig))

async function getMaster(repo, req, res) {
  const commit = await repo.getMasterCommit()
  res.json({ version: commit.sha() })
}

async function getConfig(repo, req, res) {
  try {
    const version = req.params.version
    const commit = await repo.getCommit(version)
    const tree = await commit.getTree()
    const data = await treeToObject(tree)
    res.json(data)
  } catch (error) {
    res.status(404).end()
  }
}

async function treeToObject(tree) {
  const result = {}

  for (const entry of tree.entries()) {
    const key = path.basename(entry.path(), ".json")
    result[key] = await entryToObject(entry)
  }

  return result
}

async function entryToObject(entry) {
  if (entry.isTree()) {
    const subTree = await entry.getTree()
    return treeToObject(subTree)
  } else if (entry.isBlob()) {
    const blob = await entry.getBlob()
    return blob.toString()
  }
}
