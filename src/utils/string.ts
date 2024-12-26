declare global {
    interface String {
        format(...args: any[]): string
    }
}

String.prototype.format = function (...args: any[]): string {
    return this.replace(/\{([0-9]|[1-9][0-9]+)\}/g, match => {
        const index = parseInt(match.replace(/\{|\}/g, ''), 10)
        return args[index] !== undefined ? args[index] : match
    })
}

export {}
