# Compositional Table & Grid Engine

Welcome to the **React Reusable Table Engine**! This is a highly robust, composition-based UI library designed for enterprise applications. It separates your data processing (searching, filtering, sorting, pagination) from your layout rendering (List vs Grid), allowing you to create incredibly powerful, responsive, and customizable dashboards.

---

## ⚡ Key Features
- **Dual Formats**: Render your dataset as a traditional HTML `<Table />` or as a fluid `<GridView />` utilizing custom developer cards.
- **Smart Column Configurations**: Dynamically render cells using strings, functions, or complex JSX.
- **Unified State**: Selections, sorting, and pagination are abstracted so they remain perfectly synchronized regardless of whether you are viewing the Grid or Table.
- **Floating Overlays**: `GridView` automatically wraps your custom cards and dynamically floats Row Actions and Checkboxes over them.
- **Bulk Action Dashboard**: Intelligent Selection tracking that spawns a beautiful indigo action bar when users highlight items.
- **React Portal Intersections**: Dropdowns calculate screen boundaries and prevent overflow traps dynamically!

---

## 🚀 Quick Start Example

The architecture relies on an **Orchestrator approach** (e.g., your `App.jsx`), which maintains the array of data and passes it explicitly to the layout components.

```jsx
import { useState } from 'react';
import { Table, GridView, ViewToggle, Pagination } from './components/table';
import { columns } from './tableData';

const myDataset = [
  { id: 1, name: "Alice", status: "Active", salary: 75000 },
  { id: 2, name: "Bob", status: "Suspended", salary: 62000 }
];

// A basic 'dumb' card to feed into GridView.
const MyCard = ({ row }) => (
  <div style={{ padding: '1rem', border: '1px solid #ccc' }}>
    <h3>{row.name}</h3>
    <p>{row.status}</p>
  </div>
);

export default function MyDashboard() {
  const [viewMode, setViewMode] = useState('list');
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  return (
    <div>
      {/* 1. Controller / Toggle */}
      <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />

      {/* 2. Conditional Rendering of the Data */}
      {viewMode === 'list' ? (
        <Table
          data={myDataset}
          columns={columns}
          getRowId={(row) => row.id}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          currentPage={currentPage}
          pageSize={pageSize}
          showVerticalLines={true}      // Turns on | column separators
          showHorizontalLines={true}    // Toggles the underline row separators
        />
      ) : (
        <GridView
          data={myDataset}
          gridCardComponent={MyCard}
          getRowId={(row) => row.id}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      )}
    </div>
  );
}
```

---

## ⚙️ Advanced Column Configuration

The true power of this table lies in its `columns` configuration array. Following recent upgrades, you have granular control over exactly how data is accessed and formatted.

### Column Anatomy

```javascript
[
  {
    id: "salary",                // A unique identifier for the column.
    header: "Salary",            // The text that renders in the <thead>.
    accessor: "salary",          // How to pull data from the row object.
    sortable: true,              // Enables column-click sorting arrows.
    align: "center",             // Aligns cell contents ("left" | "center" | "right").
    minWidth: "150px",           // Sets CSS block minimum widths dynamically.
    renderCell: (value) => ...   // Returns raw JSX instead of string interpolations!
  }
]
```

### 1. Basic vs Evaluated Accessors
If your data is simple, `accessor` can just be the string key mapping to your JSON (`accessor: "email"`). 
However, you can use **Function Accessors** to construct composite data on the fly before passing it into sorting or rendering:

```javascript
// Combine multiple fields into one column
{
  id: "fullName",
  header: "Full Name",
  accessor: (row) => `${row.title} ${row.name}`,
  sortable: true
}
```

### 2. Complex Cell Rendering (`renderCell`)
Sometimes the `accessor` yields an object or a plain string, but you want to physically render colorful HTML tags (like green Status bubbles or formatted currencies). The `renderCell` property intercepts the assessed value and wraps it inside HTML components.

#### Formatters (Currency & Dates)
```javascript
{
  id: "salary",
  header: "Salary",
  accessor: "salary",
  renderCell: (value) => (
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  )
}
```

#### Conditional Styling (Status Badges)
```javascript
{
  id: "status",
  header: "Status",
  accessor: "status",
  renderCell: (value) => {
    // Dynamically colors text based on its payload
    const color = value === 'Active' ? 'green' : 'red';
    return <span style={{ color, fontWeight: 'bold' }}>{value}</span>;
  }
}
```

#### Complex Object Injection
You can configure the `accessor` to return the entire `row` object! This permits `renderCell` to inject multiple properties (like an avatar next to a user name) inside a single `<td>`.

```javascript
{
  id: "name",
  header: "Name",
  accessor: (row) => row, // Expose the whole object
  minWidth: "200px",
  renderCell: (obj) => (
    <div className="flex-avatar-container">
       <Avatar src={obj.image} />
       <span>{obj.title} {obj.name}</span>
    </div>
  )
}
```

### 3. Row Actions Configuration (`rowActions`)
You can pass a custom array of actions to the `Table` or `GridView` under the `rowActions` prop. These generally manifest as a "three dots" dropdown menu at the end of a row or the top-right of a grid card.

The `show` property accepts a callback so you can dynamically display (or hide) actions based on specific row constraints, like User Roles or Permissions!

```javascript
export const rowActions = [
  {
    icon: <FiEdit2 />,
    label: "Edit",
    onClick: (row) => console.log("Editing:", row.id),
    // Always shows
  },
  {
    icon: <FiTrash2 color="red" />,
    label: "Delete",
    onClick: (row) => console.log("Deleting:", row.id),
    // Conditionally hides the Delete button if the user is an Admin!
    show: (row) => row.role !== "Admin"
  }
];
```

---

## 🧩 Component APIs

### `<GridView />`
The Grid operates nearly identical to the Table. It demands only one unique property: `gridCardComponent`.
```jsx
<GridView
   gridCardComponent={MyCustomReactCard}
   data={dataArray}
   getRowId={(row) => row.id} // Essential for tracking checkboxes!
/>
```
**Auto-Overlays**: Notice in `MyCard` (from the Quick Start) there were no checkboxes or action menus programmed! `GridView` generates those features internally via absolute positioning. Your only job is to provide the "Dumb UI Layout" for the center of the card!

### `<BulkActionsBar />`
A conditional highlight toolbar that appears universally. Best paired right under `<FilterBar>`:
```jsx
{selectedRows.length > 0 && (
  <BulkActionsBar 
    selectedCount={selectedRows.length} 
    onClearSelection={() => setSelectedRows([])} // Triggers when user clicks the internal 'X'
  >
    <button onClick={handleDelete}>Delete Permanently</button>
    <button onClick={handleExport}>Download CSV</button>
  </BulkActionsBar>
)}
```

### `<FilterBar />`
The master control bar that orchestrates search, nested action components, and applied filter tags. It leverages React composition slots (`actions` and `extraActions`) to let you decouple standard table tools from standalone page buttons.

```jsx
<FilterBar
  // 1. Search Controls
  toggleSearch={true}
  searchValue={searchValue}        // Value bound to App.jsx state
  onSearchChange={setSearchValue}  // Updates state (consider debouncing this!)
  
  // 2. Active Filters Display Container
  filterOptions={filterOptions} // The array dictating the possible filter keys
  activeFilters={activeFilters} // The App.jsx object e.g. { status: 'Active', role: '' }
  onFilterChange={setFilters}   // Triggers when a user clicks 'X' on an active filter chip

  // 3. Primary Actions (Attached to the left of Search block)
  // Use this slot for View Controls or explicit Table Dropdowns.
  actions={
    <>
      <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
      <TableFilters 
        filterOptions={filterOptions} 
        activeFilters={activeFilters} 
        onFilterChange={setFilters} 
      />
      <ColumnSelector />
    </>
  }
  
  // 4. Extra Actions (Pushed to the far right)
  // Use this slot for global page actions out of the way of the table controls.
  extraActions={
    <button className="primary-export-btn">Export Directory</button>
  }
/>
```

#### How State Works Here:
- `FilterBar` itself is profoundly **stateless**. It doesn't query your data; it just renders your UI!
- `searchValue` tracks what the user is typing. In `App.jsx`, your `useMemo` array processor intercepts `searchValue` and manually filters your dataset.
- `activeFilters` interacts seamlessly with the built-in `<ActiveFilters />` module. If a user drops down `TableFilters` and selects `{ status: 'Active' }`, the `<FilterBar>` immediately reads `activeFilters` and spawns a dismissible blue "Status: Active" chip right inline!

---

## 🎛️ State Management & Handlers (`App.jsx`)

Because this ecosystem follows standard "Lifting State Up" React principles, all of the functions to drive the tables live inside your Orchestrator component. Here are the boilerplate functions that make the ecosystem tick perfectly:

### 1. Persistence & LocalStorage
The orchestrator component intelligently remembers configuration settings so users don't lose them on page refresh:
```jsx
// 1. Fetch initial setup
const parsedSettings = getInitialSettings();

// 2. Set them into state
const [viewMode, setViewMode] = useState(parsedSettings?.viewMode || 'list');
const [pageSize, setPageSize] = useState(parsedSettings?.pageSize || 10);
const [visibleColumns, setVisibleColumns] = useState(defaultColumns.map(c => c.id));

// 3. Keep localStorage synced on changes
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    pageSize,
    visibleColumns,
    viewMode
  }));
}, [pageSize, visibleColumns, viewMode]);
```

### 2. Form Control Handlers
Resetting the paginator back to `1` when a user executes a global system change is critical to prevent array-out-of-bounds rendering crashes:
```jsx
const handleSearchChange = (value) => {
  setSearchValue(value);
  setCurrentPage(1); // Kick user to first page to see new results safely
};

const handleFilterChange = (filterId, value) => {
  setFilters(prev => ({ ...prev, [filterId]: value }));
  setCurrentPage(1); 
};
```

### 3. Array Processing Pipeline
Because the `Table` and `Grid` are "dumb" stateless renderers, your orchestrator processes all the data natively in JS via `useMemo` blocks prior to rendering. It occurs in a strict waterfall sequence:
1. `Search Filter`: Executes a lowercased fuzzy search across all keys.
2. `Dropdown Filters`: Scans for strict exact matches.
3. `Sort Rules`: Flips sorting direction based on numerical or alphabetical value.
4. `Pagination Wrapper`: Slices the heavily-filtered array right before pushing it blindly down into the `<Table>` component.
