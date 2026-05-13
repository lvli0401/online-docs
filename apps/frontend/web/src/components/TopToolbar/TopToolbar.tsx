import { insertOrUpdateBlock, MiaomaDocEditor } from '@miaoma-doc/core'
import { BasicTextStyleButton, ColorStyleButton, TextAlignButton, useMiaomaDocEditor } from '@miaoma-doc/react'
import { Download, Heading1, Heading2, Heading3, List, ListOrdered, Table } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'

function exportToWord(editor: MiaomaDocEditor<any, any, any>) {
    const docEl = editor.domElement

    let title = 'document'
    const firstP = docEl.querySelector('p, h1, h2, h3')
    if (firstP?.textContent) {
        title = firstP.textContent.slice(0, 50)
    }

    const clone = docEl.cloneNode(true) as HTMLElement

    clone.querySelectorAll('.table-widgets-container, .column-resize-handle, .ProseMirror-gapcursor').forEach(el => el.remove())

    const bodyContent = document.createElement('div')
    bodyContent.appendChild(clone)
    processNode(bodyContent)

    const wordHTML = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<style>
body { font-family: Calibri, sans-serif; font-size: 12pt; margin: 72pt; }
table { border-collapse: collapse; width: 100%; }
td, th { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
</style>
</head>
<body>
${bodyContent.innerHTML}
</body>
</html>`

    const blob = new Blob([wordHTML], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.doc`
    a.click()
    URL.revokeObjectURL(url)
}

function processNode(node: HTMLElement) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return

    if (node.hasAttribute('data-text-color')) {
        node.style.color = node.getAttribute('data-text-color')!
        node.removeAttribute('data-text-color')
    }
    if (node.hasAttribute('data-background-color')) {
        node.style.backgroundColor = node.getAttribute('data-background-color')!
        node.removeAttribute('data-background-color')
    }
    if (node.hasAttribute('data-text-alignment')) {
        node.style.textAlign = node.getAttribute('data-text-alignment')!
        node.removeAttribute('data-text-alignment')
    }
    if (node.hasAttribute('data-colwidth')) {
        node.removeAttribute('data-colwidth')
    }

    node.removeAttribute('data-content-type')
    node.removeAttribute('data-id')
    node.removeAttribute('data-node-type')
    node.removeAttribute('data-editable')
    node.removeAttribute('data-index')
    node.removeAttribute('data-file-block')
    node.removeAttribute('data-node-view-wrapper')
    node.classList.forEach(cls => {
        if (cls.startsWith('bn-') || cls === 'tableWrapper' || cls === 'tableWrapper-inner') {
            node.classList.remove(cls)
        }
    })

    const tag = node.tagName.toLowerCase()

    if (tag === 'td' || tag === 'th') {
        node.querySelectorAll('p').forEach(p => {
            p.style.margin = '0'
        })
    }

    let child = node.firstElementChild
    while (child) {
        processNode(child as HTMLElement)
        child = child.nextElementSibling
    }
}

export function TopToolbar() {
    const editor = useMiaomaDocEditor()
    const divRef = useRef<HTMLDivElement>(null)

    const handleExportWord = useCallback(() => {
        exportToWord(editor)
    }, [editor])

    const execCommand = useCallback(
        (command: string) => {
            editor.focus()
            const currentBlock = editor.getTextCursorPosition().block

            if (command === 'heading1') {
                editor.updateBlock(currentBlock, { type: 'heading', props: { level: 1 } })
            } else if (command === 'heading2') {
                editor.updateBlock(currentBlock, { type: 'heading', props: { level: 2 } })
            } else if (command === 'heading3') {
                editor.updateBlock(currentBlock, { type: 'heading', props: { level: 3 } })
            } else if (command === 'bulletList') {
                editor.updateBlock(currentBlock, { type: 'bulletListItem' })
            } else if (command === 'orderedList') {
                editor.updateBlock(currentBlock, { type: 'numberedListItem' })
            } else if (command === 'table') {
                const newBlock = insertOrUpdateBlock(editor, {
                    type: 'table',
                    content: {
                        type: 'tableContent',
                        rows: [{ cells: ['', '', ''] }, { cells: ['', '', ''] }],
                    },
                })
                editor.setTextCursorPosition(newBlock)
            }
        },
        [editor]
    )

    if (!editor) {
        return null
    }

    const toolbar = (
        <div
            ref={divRef}
            className="top-toolbar"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '6px 12px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                flexWrap: 'wrap',
                position: 'fixed',
                top: '52px',
                left: 'var(--sidebar-width, 256px)',
                right: 0,
                zIndex: 50,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <button
                    className="toolbar-btn"
                    onClick={() => execCommand('heading1')}
                    title="标题1"
                    style={{
                        padding: '4px 6px',
                        cursor: 'pointer',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '4px',
                        fontSize: '14px',
                    }}
                >
                    <Heading1 size={18} />
                </button>
                <button
                    className="toolbar-btn"
                    onClick={() => execCommand('heading2')}
                    title="标题2"
                    style={{
                        padding: '4px 6px',
                        cursor: 'pointer',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '4px',
                        fontSize: '14px',
                    }}
                >
                    <Heading2 size={18} />
                </button>
                <button
                    className="toolbar-btn"
                    onClick={() => execCommand('heading3')}
                    title="标题3"
                    style={{
                        padding: '4px 6px',
                        cursor: 'pointer',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '4px',
                        fontSize: '14px',
                    }}
                >
                    <Heading3 size={18} />
                </button>
            </div>

            <div style={{ width: '1px', height: '20px', backgroundColor: '#d1d5db', margin: '0 4px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <button
                    className="toolbar-btn"
                    onClick={() => execCommand('bulletList')}
                    title="无序列表"
                    style={{
                        padding: '4px 6px',
                        cursor: 'pointer',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '4px',
                        fontSize: '14px',
                    }}
                >
                    <List size={18} />
                </button>
                <button
                    className="toolbar-btn"
                    onClick={() => execCommand('orderedList')}
                    title="有序列表"
                    style={{
                        padding: '4px 6px',
                        cursor: 'pointer',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '4px',
                        fontSize: '14px',
                    }}
                >
                    <ListOrdered size={18} />
                </button>
            </div>

            <div style={{ width: '1px', height: '20px', backgroundColor: '#d1d5db', margin: '0 4px' }} />

            <button
                className="toolbar-btn"
                onClick={() => execCommand('table')}
                title="插入表格"
                style={{
                    padding: '4px 6px',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: '4px',
                    fontSize: '14px',
                }}
            >
                <Table size={18} />
            </button>

            <div style={{ width: '1px', height: '20px', backgroundColor: '#d1d5db', margin: '0 4px' }} />

            <BasicTextStyleButton basicTextStyle="bold" />
            <BasicTextStyleButton basicTextStyle="italic" />
            <BasicTextStyleButton basicTextStyle="underline" />
            <BasicTextStyleButton basicTextStyle="strike" />

            <div style={{ width: '1px', height: '20px', backgroundColor: '#d1d5db', margin: '0 4px' }} />

            <TextAlignButton textAlignment="left" />
            <TextAlignButton textAlignment="center" />
            <TextAlignButton textAlignment="right" />

            <div style={{ width: '1px', height: '20px', backgroundColor: '#d1d5db', margin: '0 4px' }} />

            <ColorStyleButton />

            <div style={{ flex: 1 }} />

            <button
                onClick={handleExportWord}
                title="导出为 Word"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#374151',
                }}
            >
                <Download size={16} />
                导出 Word
            </button>
        </div>
    )

    return createPortal(toolbar, document.body)
}
