interface Args {
    elm: HTMLDivElement
    position?: 'start' | 'end' | 'allContent'
    specificNode?: number
    specificLetter?: number
}

export default function focusElement(args: Args) {
    const { elm, position = 'end', specificNode, specificLetter } = args

    const range = document.createRange()
    const selection = window.getSelection()

    if (selection) {
        if (position === 'allContent') {
            range.selectNodeContents(elm)
        } else {
            if (specificNode !== undefined) {
                const node = elm.childNodes[specificNode]

                const hasPosition = specificLetter !== undefined

                const defaultPosition = position === 'start' ? 0 : node.textContent?.length || 0

                range.setStart(node, hasPosition ? specificLetter! : defaultPosition)
                range.collapse(true)
            }

            if (specificNode === undefined) {
                if (position === 'start') {
                    range.setStart(elm, 0)
                    range.collapse(true)
                }

                if (position === 'end') {
                    range.setStart(elm, elm.childNodes.length)
                    range.collapse(false)
                }
            }
        }

        selection.removeAllRanges()
        selection.addRange(range)
    }

    elm?.focus()
}
