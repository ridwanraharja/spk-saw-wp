// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "user";
}

// Navigation types
export interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  path: string;
  children?: NavigationItem[];
}

// Metric types
export interface MetricData {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: "increase" | "decrease";
  icon: string;
}

// Chart types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
  }[];
}

// Table types
export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

export interface TableData<T> {
  columns: TableColumn<T>[];
  data: T[];
  pageSize?: number;
  totalItems?: number;
}

// Theme types
export interface Theme {
  mode: "light" | "dark";
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: "success" | "error";
  message?: string;
}

// Filter types
export interface FilterOption {
  label: string;
  value: string | number;
}

export interface FilterConfig {
  field: string;
  label: string;
  type: "select" | "date" | "text";
  options?: FilterOption[];
}
