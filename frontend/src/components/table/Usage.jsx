import React, { useState, useEffect, useMemo } from 'react'
import Table from './Table.jsx'
import FilterBar from './FilterBar.jsx';
import ColumnSelector from './ColumnSelector.jsx';
import TableFilters from './TableFilters.jsx';
import GridView from './GridView.jsx';
import ViewToggle from './ViewToggle.jsx';
import BulkActionsBar from './BulkActionsBar.jsx';
import { FiTrash2, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { data, columns as defaultColumns, rowActions, filterOptions } from "./tableData.jsx";

const EmployeeCard = ({ row, isSelected }) => {
  return (
    <div style={{
      padding: '1.5rem',
      border: `2px solid ${isSelected ? '#2563eb' : '#e5e7eb'}`,
      borderRadius: '0.5rem',
      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      height: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontWeight: 'bold' }}>
          {row.name.charAt(0)}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#111827' }}>{row.name}</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{row.email}</p>
        </div>
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.875rem', color: '#4b5563', backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', textTransform: 'capitalize' }}>{row.role}</span>
        <span style={{ fontSize: '0.875rem', color: row.status === 'Active' ? '#047857' : '#b91c1c', fontWeight: '500' }}>• {row.status}</span>
      </div>
    </div>
  );
};

const STORAGE_KEY = "page_name_table_settings";

export default function Usage() {
  // Load initial structural settings from localStorage
  const getInitialSettings = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not load table settings", e);
    }
    return null;
  };

  const initialSettings = getInitialSettings();
  const initialViewMode = initialSettings?.viewMode || 'list';
  const initialOptions = initialViewMode === 'list' ? [5, 10, 25, 50, 100] : [6, 12, 24, 48, 96];

  const initialPageSize = initialSettings?.pageSize && initialOptions.includes(initialSettings.pageSize)
    ? initialSettings.pageSize
    : initialOptions[0];

  // Structural Settings (Persisted)
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortConfig, setSortConfig] = useState(initialSettings?.sortConfig || null);
  const [visibleColumns, setVisibleColumns] = useState(
    initialSettings?.visibleColumns || defaultColumns.map(c => c.id)
  );
  const [viewMode, setViewMode] = useState(initialViewMode);

  // Content Settings (Not Persisted)
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({ role: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState("No data found for this table");

  // Save structural settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      pageSize,
      sortConfig,
      visibleColumns,
      viewMode
    }));
  }, [pageSize, sortConfig, visibleColumns, viewMode]);

  // Handle Event Changes
  const handleSearchChange = (value) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterId, value) => {
    setFilters(prev => ({ ...prev, [filterId]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (columnId, direction) => {
    if (columnId === null) {
      setSortConfig(null);
    } else {
      setSortConfig({ columnId, direction });
    }
  };

  const handleColumnToggle = (columnId) => {
    setVisibleColumns(prev => {
      if (prev.includes(columnId)) {
        return prev.filter(id => id !== columnId);
      }
      return [...prev, columnId];
    });
  };

  const handlePageChange = (page) => setCurrentPage(page);
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Data Processing Pipeline
  const processedData = useMemo(() => {
    let result = [...data];

    // 1. Search Filter
    if (searchValue) {
      const lowerSearch = searchValue.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(lowerSearch)
        )
      );
    }

    // 2. Dropdown Filters
    if (filters.role) {
      result = result.filter(row => row.role?.toLowerCase() === filters.role.toLowerCase());
    }
    if (filters.status) {
      result = result.filter(row => row.status?.toLowerCase() === filters.status.toLowerCase());
    }

    // 3. Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.columnId];
        const valB = b[sortConfig.columnId];

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchValue, filters, sortConfig]);

  // 4. Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // 5. Active Columns
  const activeColumns = useMemo(() => {
    return defaultColumns.filter(col => visibleColumns.includes(col.id));
  }, [visibleColumns]);




  return (
    <div style={{position: "relative"}}> {/* Padding so we can see dropdowns at the bottom safely */}
      <FilterBar
        toggleSearch={true}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        activeFilters={filters}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        actions={
          <>
            <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
            <TableFilters
              filterOptions={filterOptions}
              activeFilters={filters}
              onFilterChange={handleFilterChange}
            />
            <ColumnSelector
              columns={defaultColumns}
              visibleColumns={visibleColumns}
              onColumnToggle={handleColumnToggle}
            />
          </>
        }
        extraActions={
          <button
            style={{ height: '36px', padding: '0 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: '#fff', fontSize: '0.875rem', color: '#374151', cursor: 'pointer', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiRefreshCw size={14} />
              Refresh
            </div>
          </button>
        }
      />

      {selectedRows.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedRows.length}
          onClearSelection={() => setSelectedRows([])}
        >
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '32px', padding: '0 0.75rem', border: '1px solid #d3d3d3', borderRadius: '0.375rem', backgroundColor: '#fff', fontSize: '0.875rem', color: '#393939', cursor: 'pointer' }}><FiDownload size={14} /> Export</button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '32px', padding: '0 0.75rem', border: '1px solid #fecaca', borderRadius: '0.375rem', backgroundColor: '#fef2f2', fontSize: '0.875rem', color: '#dc2626', cursor: 'pointer' }}><FiTrash2 size={14} /> Delete</button>
        </BulkActionsBar>
      )}

      {viewMode === 'list' ? (
        <Table
          data={paginatedData}
          columns={activeColumns}
          getRowId={(row) => row.id}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          sortConfig={sortConfig}
          onSortChange={handleSortChange}
          rowActions={rowActions}
          currentPage={currentPage}
          pageSize={pageSize}
          totalRows={processedData.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showVerticalLines={true}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          pageSizeOptions={initialOptions}
          stickyHeader={true}
        />
      ) : (
        <GridView
          data={paginatedData}
          gridCardComponent={EmployeeCard}
          getRowId={(row) => row.id}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          rowActions={rowActions}
          currentPage={currentPage}
          pageSize={pageSize}
          totalRows={processedData.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          pageSizeOptions={initialOptions}
        />
      )}
    </div>
  )
}
