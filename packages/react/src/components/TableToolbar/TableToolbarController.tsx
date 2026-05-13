import { posToDOMRect } from '@tiptap/core'
import { useCallback, useMemo, useRef, useState } from 'react'

import { useEditorContentOrSelectionChange } from '../../hooks/useEditorContentOrSelectionChange'
import { useMiaomaDocEditor } from '../../hooks/useMiaomaDocEditor'
import { useUIElementPositioning } from '../../hooks/useUIElementPositioning'
import { mergeRefs } from '../../util/mergeRefs'
import { TableToolbar } from './TableToolbar'

function isCellSelection(selection: unknown): selection is { $anchorCell: any; $headCell: any; ranges: any[] } {
    return (
        typeof selection === 'object' &&
        selection !== null &&
        '$anchorCell' in selection &&
        '$headCell' in selection &&
        'ranges' in selection
    )
}

type TableToolbarState = {
    show: boolean
    referencePos: DOMRect | null
    canMerge: boolean
    canSplit: boolean
}

export const TableToolbarController = () => {
    const editor = useMiaomaDocEditor()
    const divRef = useRef<HTMLDivElement>(null)
    const [state, setState] = useState<TableToolbarState>({
        show: false,
        referencePos: null,
        canMerge: false,
        canSplit: false,
    })

    const updateToolbarState = useCallback(() => {
        const { selection } = editor._tiptapEditor.state
        const view = editor._tiptapEditor.view

        if (!isCellSelection(selection)) {
            setState(prev => ({ ...prev, show: false }))
            return
        }

        const { ranges } = selection
        const from = Math.min(...ranges.map((range: any) => range.$from.pos))
        const to = Math.max(...ranges.map((range: any) => range.$to.pos))

        const referencePos = posToDOMRect(view, from, to)

        const $cell = selection.$anchorCell
        const node = $cell.node()
        const canSplit = (node.attrs.colspan || 1) > 1 || (node.attrs.rowspan || 1) > 1
        const canMerge = true

        setState({ show: true, referencePos, canMerge, canSplit })
    }, [editor])

    useEditorContentOrSelectionChange(updateToolbarState, editor)

    const { isMounted, ref, style, getFloatingProps } = useUIElementPositioning(state.show, state.referencePos, 3000, {
        placement: 'top',
    })

    const combinedRef = useMemo(() => mergeRefs([divRef, ref]), [divRef, ref])

    if (!isMounted || !state.show) {
        return null
    }

    return (
        <div ref={combinedRef} style={style} {...getFloatingProps()}>
            <TableToolbar
                editor={editor}
                canMerge={state.canMerge}
                canSplit={state.canSplit}
                onClose={() => editor.formattingToolbar.closeMenu()}
            />
        </div>
    )
}
