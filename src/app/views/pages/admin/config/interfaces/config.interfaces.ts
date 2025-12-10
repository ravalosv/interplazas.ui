export interface TreeNode {
  id: number;
  name: string;
  disabled?: boolean;
  children?: TreeNode[];
}

export interface FlatNode {
  id: number;
  expandable: boolean;
  name: string;
  level: number;
  disabled: boolean;
}
