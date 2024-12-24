import { initializeStorage, getStorage } from './common/storage'
import { constants } from './common/constants'
import './common/string-utils'
import './common/date-utils'
import {
    adjustYearMonthByClosingDay,
    convertToDate,
    getYearMonthDay,
} from './common/date-utils'

initializeStorage()

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
    console.log(`redirect url: ${redirectUrl}`)
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
            } else {
                console.log('Rules updated successfully.')
            }
        },
    )
}

function onMessage(message: any): boolean {
    if (message.action === 'SetYearMonth') {
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
        return true
    } else if (message.action === 'UpdateRedirectUrl') {
        updateRedirectUrl(true)
        return true
    }
    return false
}

function onUpdatedTab(
    _: number,
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

chrome.runtime.onInstalled.addListener(_ => {
    updateRedirectUrl()
})
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    const response = onMessage(message)
    sendResponse({ response })
})
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    onUpdatedTab(tabId, changeInfo, tab)
})
