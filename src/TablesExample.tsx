import React, { useCallback, useMemo } from 'react'
import { Slate, Editable, withReact } from 'slate-react'
import { TableChartOutlined, FormatAlignLeft, FormatAlignRight, FormatAlignCenter } from '@mui/icons-material';
// @ts-ignore
import {
    Editor,
    Range,
    Point,
    createEditor,
    Element as SlateElement,
} from 'slate'
import { withHistory } from 'slate-history'
import {Button, ButtonGroup, Menu, Paper, Typography} from "@mui/material";

const TablesExample = () => {
    const renderElement = useCallback((props: any) => <Element {...props} />, [])
    const renderLeaf = useCallback((props: any) => <Leaf {...props} />, [])
    const editor = useMemo(
        () => withTables(withHistory(withReact(createEditor()))),
        []
    )
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    type Dimensions = {row: number; col: number;}
    const [hover, setHover] = React.useState<Dimensions>({row:1, col:1});
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <Slate editor={editor} value={initialValue}>
            <ButtonGroup>
                <Button onClick={handleClick}><TableChartOutlined fontSize={"small"}/></Button>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <Paper sx={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "flex-start",
                        width: "10em",
                        overflow: "hidden",
                        border: "0px none" }} >
                        {range(5).map(row =>
                            range(11).map(col =>
                                <div
                                    style={{
                                        flexBasis: "auto",
                                        height: "5px",
                                        width: "5px",
                                        padding: "5px",
                                        border: "1px solid",
                                        borderColor: hover.row < row || hover.col < col ? "black" : "blue",
                                        margin: "1px"
                                    }}
                                    onMouseOver={()=>setHover({row, col})}
                                    onClick={() => {
                                        editor.insertTable(row+1, col+1)
                                        handleClose();
                                    }}
                                    data-row={row}
                                    data-col={col}
                                >&nbsp;</div>
                            )
                        )}
                        <Typography width={"100%"} align={"center"}>{`${hover.col + 1} x ${hover.row + 1}`}</Typography>
                    </Paper>
                </Menu>
                <Button><FormatAlignLeft fontSize={"small"}/></Button>
                <Button><FormatAlignCenter fontSize={"small"}/></Button>
                <Button><FormatAlignRight fontSize={"small"}/></Button>
            </ButtonGroup>
            <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
        </Slate>
    )
}

const range = (n: number) => Array.from(Array(n).keys())
enum AlignDirection {Left, Right, Center}

const withTables = (editor: any) => {
    const { deleteBackward, deleteForward, insertBreak } = editor

    editor.deleteBackward = (unit: any) => {
        const { selection } = editor

        if (selection && Range.isCollapsed(selection)) {
            const [cell] = Editor.nodes(editor, {
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    (n as any).type === 'table-cell',
            })

            if (cell) {
                const [, cellPath] = cell
                const start = Editor.start(editor, cellPath)

                if (Point.equals(selection.anchor, start)) {
                    return
                }
            }
        }

        deleteBackward(unit)
    }

    editor.deleteForward = (unit: any) => {
        const { selection } = editor

        if (selection && Range.isCollapsed(selection)) {
            const [cell] = Editor.nodes(editor, {
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    (n as any).type === 'table-cell',
            })

            if (cell) {
                const [, cellPath] = cell
                const end = Editor.end(editor, cellPath)

                if (Point.equals(selection.anchor, end)) {
                    return
                }
            }
        }

        deleteForward(unit)
    }

    editor.insertTable = (rows: number, cols: number) => {
        const emptyCell = {
            type: 'table-cell',
            children: [{ text: '' }],
        };

        const node = {
            type: 'table',
            children: range(rows).map(() => ({
                type: "table-row",
                children: range(cols).map(() => emptyCell)
            }))
        }

        editor.insertNode(node);

        return editor
    }

    editor.alignCell = (direction: AlignDirection) => {
        const { selection } = editor


    }

    editor.insertBreak = () => {
        const { selection } = editor

        if (selection) {
            const [table] = Editor.nodes(editor, {
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    (n as any).type === 'table',
            })

            if (table) {
                return
            }
        }

        insertBreak()
    }

    return editor
}

const Element = ({ attributes, children, element }: any) => {
    switch (element.type) {
        case 'table':
            return (
                <table>
                    <tbody {...attributes}>{children}</tbody>
                </table>
            )
        case 'table-row':
            return <tr {...attributes}>{children}</tr>
        case 'table-cell':
            return <td align={element.align?element.align:"left"} {...attributes}>{children}</td>
        default:
            return <p {...attributes}>{children}</p>
    }
}

const Leaf = ({ attributes, children, leaf }: any) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>
    }

    return <span {...attributes}>{children}</span>
}

const initialValue: any = [
    {
        type: 'paragraph',
        children: [
            {
                text:
                    'Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:',
            },
        ],
    },
    {
        type: 'table',
        children: [
            {
                type: 'table-row',
                children: [
                    {
                        type: 'table-cell',
                        children: [{ text: '' }],
                    },
                    {
                        type: 'table-cell',
                        children: [{ text: 'Human', bold: true }],
                    },
                    {
                        type: 'table-cell',
                        children: [{ text: 'Dog', bold: true }],
                    },
                    {
                        type: 'table-cell',
                        children: [{ text: 'Cat', bold: true }],
                    },
                ],
            },
            {
                type: 'table-row',
                children: [
                    {
                        type: 'table-cell',
                        children: [{ text: '# of Feet', bold: true }],
                    },
                    {
                        type: 'table-cell',
                        children: [{ text: '2' }],
                    },
                    {
                        type: 'table-cell',
                        children: [{ text: '4' }],
                    },
                    {
                        type: 'table-cell',
                        children: [{ text: '4' }],
                    },
                ],
            },
            {
                type: 'table-row',
                children: [
                    {
                        type: 'table-cell',
                        children: [{ text: '# of Lives', bold: true }],
                    },
                    {
                        type: 'table-cell',
                        children: [{ text: '1' }],
                    },
                    {
                        type: 'table-cell',
                        children: [{ text: '1' }],
                    },
                    {
                        type: 'table-cell',
                        children: [{ text: '9' }],
                    },
                ],
            },
        ],
    },
    {
        type: 'paragraph',
        children: [
            {
                text:
                    "This table is just a basic example of rendering a table, and it doesn't have fancy functionality. But you could augment it to add support for navigating with arrow keys, displaying table headers, adding column and rows, or even formulas if you wanted to get really crazy!",
            },
        ],
    },
]

export default TablesExample