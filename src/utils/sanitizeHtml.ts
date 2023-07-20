import sanitizeHtmlFn from 'sanitize-html'

const sanitizeConf: sanitizeHtmlFn.IOptions = {
    allowedTags: ['b', 'i', 'a', 'p', 'u', 's', 'strike', 'strong', 'em', 'pre', 'br', 'ol', 'ul', 'li'],
    allowedAttributes: { a: ['href'], br: ['style'] },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function sanitizeHtml(innerHTML: any) {
    const res = sanitizeHtmlFn(innerHTML, sanitizeConf)

    if (res === '<br />' || res === '<br>') {
        return ''
    }

    return res
}
