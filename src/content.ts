import { getElement, getInputElement, getSelectElement } from './utils/html'

function searchOptionByText(
    selectElement: HTMLSelectElement,
    searchText: string,
): number {
    for (let i = 0; i < selectElement.options.length; i++) {
        const optionText = selectElement.options[i].text.toLowerCase()
        if (optionText.includes(searchText.toLowerCase())) {
            return i
        }
    }
    return -1
}

document.addEventListener('click', (event: MouseEvent) => {
    const element = event.target as HTMLElement
    if (element.className === 'btn jbc-btn-primary') {
        const value = element.getAttribute('onclick')
        if (value === null) {
            return
        }

        // Man-hour management edit button
        if (value.includes('openEditWindow')) {
            const match = value.match(/\((\d+)\)/)
            if (match) {
                chrome.runtime.sendMessage({
                    action: 'SetYearMonth',
                    epoch: parseInt(match[1]),
                })
            }
        }
        // Man-hour management save button
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
        // Man-hour management edit table
        let element = getElement('#edit-menu-contents > table > tbody')

        // Add a record if no data is entered
        if (element.querySelectorAll('tr').length < 2) {
            // Record add button
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

            let selectElement = getSelectElement(
                `#edit-menu-contents > table > tbody > tr.daily > td:nth-child(2) > select`,
            )
            let index = searchOptionByText(selectElement, message.projectName)
            if (index !== -1) {
                selectElement.selectedIndex = index
                selectElement.dispatchEvent(
                    new Event('change', { bubbles: true, composed: true }),
                )
            }

            // Set the second element for the task
            selectElement = getSelectElement(
                `#edit-menu-contents > table > tbody > tr.daily > td:nth-child(3) > select`,
            )
            index = searchOptionByText(selectElement, message.taskTitle)
            if (index !== -1) {
                selectElement.selectedIndex = index
            }

            // Enter actual working hours into man-hour (time) field
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
