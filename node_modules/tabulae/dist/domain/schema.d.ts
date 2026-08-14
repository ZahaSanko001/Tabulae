export interface ColumnInfo {
    name: string;
    dataType: string;
    isNullable: boolean;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
}
export interface TableNode {
    schema: string;
    name: string;
    columns: ColumnInfo[];
}
export interface ForeignKeyEdge {
    fromSchema: string;
    fromTable: string;
    fromColumn: string;
    toSchema: string;
    toTable: string;
    toColumn: string;
}
export interface SchemaSnapshot {
    tables: TableNode[];
    relationships: ForeignKeyEdge[];
}
//# sourceMappingURL=schema.d.ts.map