import { Skeleton, Table } from "@heroui/react";

const columns = ["ID", "Title", "Description"];
export default function PendingItems() {
    return (
        <div role="status" aria-label="Loading items">
            <Table>
                <Table.ScrollContainer>
                    <Table.Content aria-label="Loading items">
                        <Table.Header>
                            {columns.map((label, index) => (
                                <Table.Column
                                    key={label}
                                    isRowHeader={index === 0}
                                >
                                    {label}
                                </Table.Column>
                            ))}
                        </Table.Header>
                        <Table.Body>
                            {[0, 1, 2, 3, 4].map((row) => (
                                <Table.Row key={row}>
                                    {columns.map((label) => (
                                        <Table.Cell key={label}>
                                            <Skeleton className="h-4 w-32 rounded" />
                                        </Table.Cell>
                                    ))}
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Content>
                </Table.ScrollContainer>
            </Table>
        </div>
    );
}
