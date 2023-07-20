export default function getCursorPosition(elm: HTMLDivElement | HTMLUListElement | HTMLOListElement) {
    const selection = window.getSelection()

    if (!selection || selection.rangeCount === 0) {
        return {
            position: 'none' as const,
            selected: '',
            beforeCursor: '',
            afterCursor: '',
            text: elm.textContent || '',
            listItem: undefined,
        }
    }

    const range = selection.getRangeAt(0)
    const clonedRange = range.cloneRange()
    clonedRange.selectNodeContents(elm)
    clonedRange.setEnd(range.startContainer, range.startOffset)
    const beforeCursor = clonedRange.toString()
    const selected = range.toString()
    const afterCursor = elm.textContent?.slice(beforeCursor.length + selected.length) || ''

    const position: 'none' | 'start' | 'end' =
        elm.textContent === beforeCursor ? 'end' : elm.textContent === afterCursor ? 'start' : 'none'

    const listItems = Array.from(elm.querySelectorAll('li'))
    const listItem = listItems.findIndex((item) => {
        return item === range.startContainer.parentNode
    })

    return {
        position: position,
        selected: selected,
        beforeCursor: beforeCursor,
        afterCursor: afterCursor,
        text: elm.innerHTML || '',
        listItem: listItem === -1 ? undefined : listItem,
    }
}
