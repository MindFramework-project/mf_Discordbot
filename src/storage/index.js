import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STORAGE_PATH = join(__dirname, '..', '..', 'data', 'settings.json')

let cache = null

function load() {
    if (cache) return cache
    if (!existsSync(STORAGE_PATH)) {
        cache = {}
        return cache
    }
    try {
        const raw = readFileSync(STORAGE_PATH, 'utf-8')
        cache = JSON.parse(raw)
    } catch {
        cache = {}
    }
    return cache
}

function save() {
    const dir = dirname(STORAGE_PATH)
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
    }
    writeFileSync(STORAGE_PATH, JSON.stringify(cache, null, 2), 'utf-8')
}

export function get(key) {
    const data = load()
    return data[key] ?? null
}

export function set(key, value) {
    const data = load()
    data[key] = value
    cache = data
    save()
}

export function remove(key) {
    const data = load()
    delete data[key]
    cache = data
    save()
}

export function getAll() {
    return { ...load() }
}

export function has(key) {
    const data = load()
    return key in data
}
