interface Args {
    text: string
}

export default function updateListElement(args: Args): string {
    const { text } = args

    let res = text

    const lastLiIndex = res.lastIndexOf('</li>')

    if (lastLiIndex !== -1) {
        res = res.slice(0, lastLiIndex + 5) + '<li></li>' + res.slice(lastLiIndex + 5)
    } else {
        res = res.slice(0, -5) + '<li></li>' + res.slice(-5)
    }

    return res
}
