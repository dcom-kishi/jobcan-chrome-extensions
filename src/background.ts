import { initializeStorage, getStorage } from './common/storage'
import { constants } from './common/constants'
import './utils/string'
import './utils/date'
import {
    adjustYearMonthByClosingDay,
    convertToDate,
    getYearMonthDay,
} from './utils/date'

function updateRedirectUrl(withSchema: boolean = false): void {
    const url = constants.JOBCAN.MAN_HOUR_MANAGE_URL
    let redirectUrl = url
    if (withSchema) {
        const storage = getStorage() as Record<string, any>
        const year = storage[constants.STORAGE_KEY.YEAR]
        const month = storage[constants.STORAGE_KEY.MONTH]
        const schema = `?year=${year}&month=${month}`
        redirectUrl += schema
    }
    chrome.declarativeNetRequest.updateDynamicRules(
        {
            addRules: [
                {
                    id: 1,
                    priority: 1,
                    action: {
                        type: 'redirect' as chrome.declarativeNetRequest.RuleActionType,
                        redirect: {
                            url: redirectUrl,
                        },
                    },
                    condition: {
                        regexFilter:
                            '^https://ssl.jobcan.jp/employee/man-hour-manage$',
                        resourceTypes: [
                            'main_frame',
                        ] as unknown as chrome.declarativeNetRequest.ResourceType[],
                    },
                },
            ],
            removeRuleIds: [1],
        },
        () => {
            if (chrome.runtime.lastError) {
                console.error(
                    'Error updating rules:',
                    chrome.runtime.lastError.message,
                )
            }
        },
    )
}

function onMessage(message: any): any {
    let response = {}
    if (message.action === 'GetProjectAndTask') {
        const storage = getStorage() as Record<string, any>
        const project = storage[constants.STORAGE_KEY.PROJECT]
        const task = storage[constants.STORAGE_KEY.TASK]
        response = { project: project, task: task }
    } else if (message.action === 'SetProjectAndTask') {
        const data: Record<string, any> = {}
        data[constants.STORAGE_KEY.PROJECT] = message.project
        data[constants.STORAGE_KEY.TASK] = message.task
        chrome.storage.local.set(data, () => {})
    } else if (message.action === 'SetYearMonth') {
        const date = getYearMonthDay(convertToDate(message.epoch))
        const adjustedDate = adjustYearMonthByClosingDay(
            date.year,
            date.month,
            date.day,
        )
        const data: Record<string, any> = {}
        data[constants.STORAGE_KEY.YEAR] = adjustedDate.year
        data[constants.STORAGE_KEY.MONTH] = adjustedDate.mouth
        chrome.storage.local.set(data, () => {})
    } else if (message.action === 'UpdateRedirectUrl') {
        updateRedirectUrl(true)
    }
    return response
}

function onUpdatedTab(
    _tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab,
) {
    if (
        changeInfo.status === 'complete' &&
        tab.url &&
        tab.url.startsWith(constants.JOBCAN.MAN_HOUR_MANAGE_URL)
    ) {
        updateRedirectUrl()
    }
}

function onCompleted(_details: chrome.webRequest.WebResponseCacheDetails) {
    const storage = getStorage() as Record<string, any>
    const project = storage[constants.STORAGE_KEY.PROJECT]
    const task = storage[constants.STORAGE_KEY.TASK]
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'EditManHourData',
                project: project,
                task: task,
            })
        }
    })
}

initializeStorage()

chrome.runtime.onInstalled.addListener(_details => {
    updateRedirectUrl()
})
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const response = onMessage(message)
    sendResponse(response)
})
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    onUpdatedTab(tabId, changeInfo, tab)
})
chrome.webRequest.onCompleted.addListener(_details => onCompleted(_details), {
    urls: [`${constants.JOBCAN.GET_MAN_HOUR_DATA_FOR_EDIT_URL}/*`],
})
