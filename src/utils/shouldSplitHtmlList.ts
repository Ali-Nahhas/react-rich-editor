export default function shouldSplitHtmlList(text: string): {
    action: 'nothing' | 'end' | 'two'
    currentList: string
    newList: string
} {
    const regex = /<ul[^>]*>[\s\S]*?<\/ul>|<ol[^>]*>[\s\S]*?<\/ol>/g

    const lists = text.match(regex)
    const numberOfLists = lists ? lists.length : 0

    const endsWithSkip = text.endsWith('<br>')

    if (numberOfLists === 1 && endsWithSkip) {
        return {
            action: 'end',
            currentList: lists ? lists[0] : '',
            newList: '',
        }
    }

    const splits = text.split(regex)

    if (numberOfLists === 2 && splits.length === 3 && splits[1].endsWith('<br>')) {
        return {
            action: 'two',
            currentList: lists ? lists[0] : '',
            newList: lists ? lists[1] : '',
        }
    }

    return {
        action: 'nothing',
        currentList: '',
        newList: '',
    }
}
