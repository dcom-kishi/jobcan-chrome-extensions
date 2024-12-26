import { getElement, getInputElement, getSelectElement } from './utils/html'

document.addEventListener('click', (event: MouseEvent) => {
    const element = event.target as HTMLElement
    if (element.className === 'btn jbc-btn-primary') {
        const value = element.getAttribute('onclick')
        if (value === null) {
            return
        }

        // 工数管理編集ボタン
        if (value.includes('openEditWindow')) {
            const match = value.match(/\((\d+)\)/)
            if (match) {
                chrome.runtime.sendMessage({
                    action: 'SetYearMonth',
                    epoch: parseInt(match[1]),
                })
            }
        }
        // 工数管理編集保存ボタン
        else if (value.includes('pushSave')) {
            chrome.runtime.sendMessage({
                action: 'UpdateRedirectUrl',
                epoch: undefined,
            })
        }
    }
})

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.action === 'EditManHourData') {
        // 工数管理編集テーブル
        let element = getElement('#edit-menu-contents > table > tbody')

        // 工数未入力時にレコードを追加
        if (element.querySelectorAll('tr').length < 2) {
            // レコード追加ボタン
            element = getElement(
                '#edit-menu-contents > table > tbody > tr:nth-child(1) > td:nth-child(5) > span',
            )
            if (element.className === 'btn jbc-btn-primary') {
                const value = element.getAttribute('onclick')
                if (value === null) {
                    return
                }
                element.click()
            }

            // プロジェクトに2番目の要素を設定
            let selectElement = getSelectElement(
                `#edit-menu-contents > table > tbody > tr.daily > td:nth-child(2) > select`,
            )
            selectElement.selectedIndex = 1
            selectElement.dispatchEvent(
                new Event('change', { bubbles: true, composed: true }),
            )

            // タスクに2番目の要素を設定
            selectElement = getSelectElement(
                `#edit-menu-contents > table > tbody > tr.daily > td:nth-child(3) > select`,
            )
            selectElement.selectedIndex = 1

            // 工数(時間)に実労働時間を入力
            element = getElement('#edit-menu-title')
            const text = element.textContent as string
            const match = text.match(/(?<=＝)\d{2}:\d{2}/)
            if (match) {
                let inputElement = getInputElement(
                    '#edit-menu-contents > table > tbody > tr.daily > td:nth-child(4) > input.form-control.jbc-form-control.form-control-sm.man-hour-input',
                )
                inputElement.value = match[0]
                inputElement.dispatchEvent(
                    new Event('change', { bubbles: true, composed: true }),
                )
            }
        }
    }
})
