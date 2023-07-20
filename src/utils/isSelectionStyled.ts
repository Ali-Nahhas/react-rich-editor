/* eslint-disable @typescript-eslint/no-explicit-any */

type Style = 'bold' | 'italic' | 'underline' | 'strikeThrough'

export function isSelectionStyled(): string[] {
    let selection
    if (window.getSelection) {
        selection = window.getSelection()
    } else if (document.getSelection) {
        selection = document.getSelection()
    }

    const raw_html = getSelectionAsHtml()

    if (raw_html === '') {
        return []
    }

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = raw_html

    const resultStyles: Style[] = []

    // @ts-ignore
    for (const node of tempDiv.childNodes) {
        let tags = [node.nodeName.toLowerCase()]

        while (tags.includes('#text')) {
            tags = []

            const anchorParent = selection?.anchorNode?.parentNode
            const focusParent = selection?.focusNode?.parentNode

            tags.push(anchorParent?.nodeName.toLowerCase())
            tags.push(focusParent?.nodeName.toLowerCase())

            tags.push(anchorParent?.parentElement?.nodeName.toLowerCase())
            tags.push(focusParent?.parentElement?.nodeName.toLowerCase())

            tags.push(anchorParent?.parentElement?.parentElement?.nodeName.toLowerCase())
            tags.push(focusParent?.parentElement?.parentElement?.nodeName.toLowerCase())

            tags.push(anchorParent?.parentElement?.parentElement?.parentElement?.nodeName.toLowerCase())
            tags.push(focusParent?.parentElement?.parentElement?.parentElement?.nodeName.toLowerCase())
        }

        if (tags.some((tag) => tag === 'b' || tag === 'strong')) {
            resultStyles.push('bold')
        }

        if (tags.some((tag) => tag === 'i' || tag === 'em')) {
            resultStyles.push('italic')
        }

        if (tags.some((tag) => tag === 's' || tag === 'strike')) {
            resultStyles.push('strikeThrough')
        }

        if (tags.some((tag) => tag === 'u')) {
            resultStyles.push('underline')
        }
    }

    return resultStyles
}

function getSelectionAsHtml() {
    let html = ''
    if (typeof window.getSelection !== 'undefined') {
        const selection = window.getSelection()

        if (selection?.rangeCount) {
            const container = document.createElement('div')
            for (let i = 0, len = selection.rangeCount; i < len; ++i) {
                container.appendChild(selection.getRangeAt(i).cloneContents())
            }
            html = container.innerHTML
        }
    } else if (typeof (document as any).selection !== 'undefined') {
        if ((document as any).selection?.type == 'Text') {
            html = (document as any).selection?.createRange().htmlText
        }
    }
    return html
}
