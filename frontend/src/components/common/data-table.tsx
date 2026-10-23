import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "@gravity-ui/icons";
import { Button, Label, ListBox, Select, Table, Tooltip } from "@heroui/react";
import { type ReactNode, useState } from "react";

export type DataColumn<T> = {
    id: string;
    header: ReactNode;
    cell: (row: T) => ReactNode;
};
export function DataTable<T extends { id: string }>({
    columns,
    data,
}: {
    columns: DataColumn<T>[];
    data: T[];
}) {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
    const page = Math.min(pageIndex, pageCount - 1);
    const rows = data.slice(page * pageSize, (page + 1) * pageSize);
    const controls = [
        {
            label: "Go to first page",
            icon: ChevronsLeft,
            target: 0,
            disabled: page === 0,
        },
        {
            label: "Go to previous page",
            icon: ChevronLeft,
            target: page - 1,
            disabled: page === 0,
        },
        {
            label: "Go to next page",
            icon: ChevronRight,
            target: page + 1,
            disabled: page === pageCount - 1,
        },
        {
            label: "Go to last page",
            icon: ChevronsRight,
            target: pageCount - 1,
            disabled: page === pageCount - 1,
        },
    ];
    return (
        <div className="flex flex-col gap-4">
            <Table>
                <Table.ScrollContainer>
                    <Table.Content aria-label="Records" className="min-w-160">
                        <Table.Header>
                            {columns.map((column, index) => (
                                <Table.Column
                                    key={column.id}
                                    id={column.id}
                                    isRowHeader={index === 0}
                                >
                                    {column.header}
                                </Table.Column>
                            ))}
                        </Table.Header>
                        <Table.Body
                            renderEmptyState={() => (
                                <p className="text-muted p-8 text-center">
                                    No results found.
                                </p>
                            )}
                        >
                            {rows.map((row) => (
                                <Table.Row key={row.id} id={row.id}>
                                    {columns.map((column) => (
                                        <Table.Cell key={column.id}>
                                            {column.cell(row)}
                                        </Table.Cell>
                                    ))}
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Content>
                </Table.ScrollContainer>
            </Table>
            {data.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                    <p className="text-muted">
                        Showing {page * pageSize + 1} to{" "}
                        {Math.min((page + 1) * pageSize, data.length)} of{" "}
                        {data.length} entries
                    </p>
                    <Select
                        className="w-32"
                        value={String(pageSize)}
                        onChange={(key) => {
                            setPageSize(Number(key));
                            setPageIndex(0);
                        }}
                    >
                        <Label>Rows per page</Label>
                        <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                {[5, 10, 25, 50].map((size) => (
                                    <ListBox.Item
                                        key={size}
                                        id={String(size)}
                                        textValue={String(size)}
                                    >
                                        {size}
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                    <div className="flex items-center gap-2">
                        <span className="text-muted mr-2">
                            Page {page + 1} of {pageCount}
                        </span>
                        {controls.map((control) => (
                            <Tooltip key={control.label}>
                                <Button
                                    variant="outline"
                                    isIconOnly
                                    size="sm"
                                    aria-label={control.label}
                                    isDisabled={control.disabled}
                                    onPress={() => setPageIndex(control.target)}
                                >
                                    <control.icon />
                                </Button>
                                <Tooltip.Content>
                                    {control.label}
                                </Tooltip.Content>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
