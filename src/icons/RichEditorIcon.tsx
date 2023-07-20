import React from 'react'
import audioBlock from './assets/audioBlock.svg'
import bold from './assets/bold.svg'
import boldPrimary from './assets/boldPrimary.svg'
import codeBlock from './assets/codeBlock.svg'
import deleteImgIcon from './assets/deleteIcon.svg'
import dragMenu from './assets/dragMenu.svg'
import duplicate from './assets/duplicate.svg'
import header1 from './assets/header1.svg'
import header1Primary from './assets/header1Primary.svg'
import header2 from './assets/header2.svg'
import header2Primary from './assets/header2Primary.svg'
import header3 from './assets/header3.svg'
import header3Primary from './assets/header3Primary.svg'
import headingBlock from './assets/headingBlock.svg'
import highlight from './assets/highlight.svg'
import highlightPrimary from './assets/highlightPrimary.svg'
import imageBlock from './assets/imageBlock.svg'
import italic from './assets/italic.svg'
import italicPrimary from './assets/italicPrimary.svg'
import link from './assets/link.svg'
import linkPrimary from './assets/linkPrimary.svg'
import listBulletedBlock from './assets/listBulletedBlock.svg'
import listNumberedBlock from './assets/listNumberedBlock.svg'
import mathBlock from './assets/mathBlock.svg'
import menuDelete from './assets/menuDelete.svg'
import strikeThrough from './assets/strikeThrough.svg'
import strikeThroughPrimary from './assets/strikeThroughPrimary.svg'
import tableBlock from './assets/tableBlock.svg'
import text from './assets/text.svg'
import textBlock from './assets/textBlock.svg'
import textPrimary from './assets/textPrimary.svg'
import underline from './assets/underline.svg'
import underlinePrimary from './assets/underlinePrimary.svg'
import uploadError from './assets/uploadError.svg'
import videoBlock from './assets/videoBlock.svg'
import zoomIn from './assets/zoomIn.svg'

const icons = {
    audioBlock,
    bold,
    boldPrimary,
    codeBlock,
    deleteImgIcon,
    dragMenu,
    duplicate,
    header1,
    header1Primary,
    header2,
    header2Primary,
    header3,
    header3Primary,
    headingBlock,
    highlight,
    highlightPrimary,
    imageBlock,
    italic,
    italicPrimary,
    link,
    linkPrimary,
    listBulletedBlock,
    listNumberedBlock,
    mathBlock,
    menuDelete,
    strikeThrough,
    strikeThroughPrimary,
    tableBlock,
    text,
    textBlock,
    textPrimary,
    underline,
    underlinePrimary,
    uploadError,
    videoBlock,
    zoomIn,
}

export type RichEditorIconType = keyof typeof icons

interface Props {
    icon: RichEditorIconType
    style?: React.CSSProperties
}

export default React.memo(RichEditorIcon)

function RichEditorIcon(props: Props): JSX.Element {
    const { icon, style } = props

    const iconSrc = icons[icon] || textBlock

    return <img style={style} src={iconSrc} />
}
