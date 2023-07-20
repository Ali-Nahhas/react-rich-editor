export default function getCleanChildNodes(node: HTMLElement) {
    const res: ChildNode[] = []

    node.childNodes.forEach((child) => {
        if (child.textContent) {
            res.push(child)
        }
    })

    return res
}
