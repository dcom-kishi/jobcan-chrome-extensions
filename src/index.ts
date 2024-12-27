function loadProjectAndTaskForInputElementValue() {
    const callback = chrome.runtime.sendMessage({ action: 'GetProjectAndTask' })
    callback.then(response => {
        const projectInput = document.getElementById(
            'project-input',
        ) as HTMLInputElement
        if (response.project !== undefined) {
            projectInput.value = response.project
        }

        const taskInput = document.getElementById(
            'task-input',
        ) as HTMLInputElement
        if (response.task !== undefined) {
            taskInput.value = response.task
        }
    }, console.log)
}

function saveProjectAndTaskForInputElementValue() {
    const projectInput = document.getElementById(
        'project-input',
    ) as HTMLInputElement
    const project = projectInput.value

    const taskInput = document.getElementById('task-input') as HTMLInputElement
    const task = taskInput.value

    chrome.runtime.sendMessage({
        action: 'SetProjectAndTask',
        project: project,
        task: task,
    })
    alert(`Project: ${project}, Task: ${task} has been saved`)
}

function setSaveButtonClickEvent() {
    const saveButton = document.getElementById('save-btn') as HTMLButtonElement
    saveButton.addEventListener('click', saveProjectAndTaskForInputElementValue)
}

window.addEventListener('DOMContentLoaded', () => {
    loadProjectAndTaskForInputElementValue()
    setSaveButtonClickEvent()
})
