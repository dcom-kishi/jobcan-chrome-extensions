import { getElement, getInputElement, getSelectElement } from './utils/html'

function onButtonClick(button: HTMLElement) {
    if (button.className === 'btn jbc-btn-primary') {
        const value = button.getAttribute('onclick')
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
}

function addManHourRecord() {
    // Record add button
    const element = getElement(
        '#edit-menu-contents > table > tbody > tr:nth-child(1) > td:nth-child(5) > span',
    )
    if (element.className === 'btn jbc-btn-primary') {
        const value = element.getAttribute('onclick')
        if (value === null) {
            return
        }
        element.click()
    }
}

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

function setProject(project: string) {
    // Project select box
    const element = getSelectElement(
        `#edit-menu-contents > table > tbody > tr.daily > td:nth-child(2) > select`,
    )
    const index = searchOptionByText(element, project)
    if (index !== -1) {
        element.selectedIndex = index
        element.dispatchEvent(
            new Event('change', { bubbles: true, composed: true }),
        )
    } else {
        console.log(`'${project}' was not found in the project select box.`)
    }
}

function setTask(task: string) {
    // Task select box
    const element = getSelectElement(
        `#edit-menu-contents > table > tbody > tr.daily > td:nth-child(3) > select`,
    )
    const index = searchOptionByText(element, task)
    if (index !== -1) {
        element.selectedIndex = index
    } else {
        console.log(`'${task}' was not found in the task select box.`)
    }
}

function setManHourTime() {
    // Enter actual working hours into man-hour (time) field
    const element = getElement('#edit-menu-title')
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

function onMessage(message: any): any {
    if (message.action === 'EditManHourData') {
        // Man-hour management edit table
        const element = getElement('#edit-menu-contents > table > tbody')
        const recordCount = element.querySelectorAll('tr').length
        // Add a record if no data is entered
        if (recordCount < 2) {
            addManHourRecord()
            setProject(message.project)
            setTask(message.task)
            setManHourTime()
        }
    }
}

document.addEventListener('click', (event: MouseEvent) =>
    onButtonClick(event.target as HTMLElement),
)

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) =>
    onMessage(message),
)
