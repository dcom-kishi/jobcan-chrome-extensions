window.addEventListener('DOMContentLoaded', () => {
    const project = localStorage.getItem('project')
    const task = localStorage.getItem('task')

    const projectInput = document.getElementById(
        'project-input',
    ) as HTMLInputElement
    if (project !== null) {
        projectInput.value = project
    }

    const taskInput = document.getElementById('task-input') as HTMLInputElement
    if (task !== null) {
        taskInput.value = task
    }

    const saveButton = document.getElementById('save-btn') as HTMLButtonElement
    saveButton.addEventListener('click', () => {
        const project = projectInput.value
        const task = taskInput.value

        localStorage.setItem('project', project)
        localStorage.setItem('task', task)

        chrome.runtime.sendMessage({
            action: 'SetProjectAndTask',
            project: project,
            task: task,
        })
        alert(`Project: ${project}, Task: ${task} has been saved`)
    })
})
