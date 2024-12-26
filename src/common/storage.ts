import { constants } from './constants'

interface Storage {
    [key: string]: any
}

const storage: Storage = {}

export function initializeStorage(): void {
    const now = new Date()
    storage[constants.STORAGE_KEY.YEAR] = now.getFullYear().toString()
    storage[constants.STORAGE_KEY.MONTH] = (now.getMonth() + 1).toString()

    const storageKeys: string[] = Object.values(constants.STORAGE_KEY)

    chrome.storage.local.get(storageKeys, data => {
        Object.keys(data).forEach(key => {
            storage[key] = data[key]
        })
    })

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            Object.keys(changes).forEach(key => {
                if (changes[key].newValue !== undefined) {
                    storage[key] = changes[key].newValue as string
                }
            })
        }
    })
}

export function getStorage(): Record<string, any> {
    return JSON.parse(JSON.stringify(storage))
}

export function setStorage(key: string, value: any): void {
    if (storage[key] === value) {
        return
    }
    const data: Record<string, any> = {}
    data[key] = value
    chrome.storage.local.set(data, console.log)
}
