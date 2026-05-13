import { mergeCells, splitCell, toggleHeaderColumn, toggleHeaderRow } from 'prosemirror-tables'

import { TableToolbarProps } from './TableToolbarProps'

export const TableToolbar = (props: TableToolbarProps) => {
    const { editor, canMerge, canSplit, onClose } = props

    const handleMerge = () => {
        editor._tiptapEditor
            .chain()
            .command(({ state, dispatch }) => mergeCells(state, dispatch))
            .run()
        onClose()
    }

    const handleSplit = () => {
        editor._tiptapEditor
            .chain()
            .command(({ state, dispatch }) => splitCell(state, dispatch))
            .run()
        onClose()
    }

    const handleToggleHeaderRow = () => {
        editor._tiptapEditor
            .chain()
            .command(({ state, dispatch }) => toggleHeaderRow(state, dispatch))
            .run()
        onClose()
    }

    const handleToggleHeaderColumn = () => {
        editor._tiptapEditor
            .chain()
            .command(({ state, dispatch }) => toggleHeaderColumn(state, dispatch))
            .run()
        onClose()
    }

    return (
        <div className="bn-toolbar bn-formatting-toolbar" style={{ display: 'flex', gap: '2px', padding: '4px' }}>
            {canMerge && (
                <button
                    className="bn-button"
                    onClick={handleMerge}
                    title="合并单元格"
                    style={{
                        padding: '4px 8px',
                        cursor: 'pointer',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '4px',
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                    }}
                >
                    合并
                </button>
            )}
            {canSplit && (
                <button
                    className="bn-button"
                    onClick={handleSplit}
                    title="拆分单元格"
                    style={{
                        padding: '4px 8px',
                        cursor: 'pointer',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '4px',
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                    }}
                >
                    拆分
                </button>
            )}
            <button
                className="bn-button"
                onClick={handleToggleHeaderRow}
                title="切换表头行"
                style={{
                    padding: '4px 8px',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: '4px',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                }}
            >
                表头行
            </button>
            <button
                className="bn-button"
                onClick={handleToggleHeaderColumn}
                title="切换表头列"
                style={{
                    padding: '4px 8px',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: '4px',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                }}
            >
                表头列
            </button>
        </div>
    )
}
