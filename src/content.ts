document.addEventListener('click', (event: MouseEvent) => {
    const targetElement = event.target as HTMLElement
    if (targetElement.classList.value === 'btn jbc-btn-primary') {
        const value = targetElement.getAttribute('onclick')
        if (value === null) {
            return
        }

        if (value.includes('openEditWindow')) {
            const match = value.match(/\((\d+)\)/)
            console.log(`openEditWindow: ${value}`)
            console.log(`openEditWindow: ${match}`)
            if (match) {
                chrome.runtime.sendMessage({
                    action: 'SetYearMonth',
                    epoch: parseInt(match[1]),
                })
            }
        } else if (value.includes('pushSave')) {
            chrome.runtime.sendMessage({
                action: 'UpdateRedirectUrl',
                epoch: undefined,
            })
        }
    }
})
