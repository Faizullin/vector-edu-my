import React, { memo, useEffect, useMemo, useState } from 'react';
import { Button, Dropdown, Form, Pagination, Spinner, Table } from 'react-bootstrap';
import { debounce } from 'lodash';
import dayjs from 'dayjs';

/**
 * Formats an ISO date string into 'DD/MM/YYYY HH:mm' format
 * @param {string} dateString - The ISO date string
 * @returns {string} - Formatted date string or original value if invalid
 */
const formatDateTime = (dateString) => {
  return dayjs(dateString, { format: 'YYYY-MM-DDTHH:mm:ssZ', strict: true }).isValid()
    ? dayjs(dateString).format('DD/MM/YYYY HH:mm')
    : dateString;
};

/**
 * Fills empty cells in a dataset by pasting content from the row above
 * @param {Array} data - Array of table rows
 * @returns {Array} - Modified array with filled empty cells
 */
const fillEmptyCells = (data) => {
  return data.map((row, rowIndex) => {
    if (rowIndex === 0) return row; // Skip the first row

    return Object.keys(row).reduce((newRow, key) => {
      newRow[key] = row[key] !== '' && row[key] !== null ? row[key] : data[rowIndex - 1][key];
      return newRow;
    }, {});
  });
};

const DataTable = memo(
  ({
    control,
    columns,
    data: defaultData,
    loading: defaultLoading,
    onFilterChange,
    extraActions,
    totalPages: defaultTotalPages,
    onEdit,
    onDelete
  }) => {
    const [filters, setFilters] = useState({});
    const [sortKey, setSortKey] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showFilterDropdown, setShowFilterDropdown] = useState(null);

    const { totalPages, loading } = useMemo(() => {
      if (control) {
        return {
          totalPages: control.totalPages,
          loading: control.loading
        };
      } else {
        return {
          totalPages: defaultTotalPages,
          loading: defaultLoading
        };
      }
    }, [control, defaultTotalPages, defaultLoading]);

    const data = useMemo(() => {
      if (control) {
        return control.data || [];
      } else {
        return defaultData || [];
      }
    }, [control, defaultData]);

    // Debounced API call
    const fetchData = useMemo(
      () =>
        debounce(() => {
          onFilterChange({
            ...filters,
            ordering: sortKey ? (sortOrder === 'asc' ? sortKey : `-${sortKey}`) : null,
            page: currentPage,
            page_size: pageSize
          });
        }, 500),
      [filters, sortKey, sortOrder, currentPage, pageSize]
    );

    useEffect(() => {
      fetchData();
    }, [filters, sortKey, sortOrder, currentPage, pageSize]);

    // Handle sorting
    const handleSort = (key) => {
      if (sortKey === key) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortKey(key);
        setSortOrder('asc');
      }
    };

    // Handle column filtering
    const handleColumnFilterChange = (key, value) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    };

    const renderRow = (col, row) => {
      if (col.dataType === 'datetime') {
        return formatDateTime(row[col.key]);
      } else if (col.render) {
        return col.render(row);
      } else {
        return row[col.key];
      }
    };

    // Filtered Data - Apply local filtering before rendering
    const filteredData = useMemo(() => {
      return data.filter((row) => {
        return Object.keys(filters).every((key) => {
          if (!filters[key]) return true; // Skip if no filter is set

          const value = row[key]?.toString().toLowerCase();
          const filterValue = filters[key]?.toString().toLowerCase();

          if (Array.isArray(filters[key])) {
            return filters[key].includes(row[key]);
          }

          return value && value.includes(filterValue);
        });
      });
    }, [data, filters]);

    return (
      <div>
        {/* Table */}
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="position-relative">
                  <div className="d-flex justify-content-between align-items-center">
                    <span onClick={() => col.sortable && handleSort(col.key)} style={{ cursor: 'pointer' }}>
                      {col.label} {col.sortable && (sortKey === col.key ? (sortOrder === 'asc' ? '▲' : '▼') : '↕')}
                    </span>
                    {/* Filter Dropdown */}
                    {col.filterType && (
                      <Dropdown show={showFilterDropdown === col.key} onToggle={() => setShowFilterDropdown(col.key)}>
                        <Dropdown.Toggle variant="light" size="sm">
                          🔍
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="p-3" style={{ minWidth: '250px' }}>
                          <Form>
                            {/* Dynamic Filter Fields */}
                            {col.filterType === 'text' && (
                              <Form.Control
                                type="text"
                                placeholder={`Filter ${col.label}`}
                                onChange={(e) => handleColumnFilterChange(col.key, e.target.value)}
                              />
                            )}

                            {col.filterType === 'select' && col.options && (
                              <Form.Select onChange={(e) => handleColumnFilterChange(col.key, e.target.value)}>
                                <option value="">All</option>
                                {col.options.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </Form.Select>
                            )}

                            {col.filterType === 'date' && (
                              <Form.Control type="date" onChange={(e) => handleColumnFilterChange(col.key, e.target.value)} />
                            )}

                            {col.filterType === 'number-range' && (
                              <div className="d-flex">
                                <Form.Control
                                  type="number"
                                  placeholder="Min"
                                  onChange={(e) => handleColumnFilterChange(`${col.key}_min`, e.target.value)}
                                />
                                <Form.Control
                                  type="number"
                                  placeholder="Max"
                                  className="ms-2"
                                  onChange={(e) => handleColumnFilterChange(`${col.key}_max`, e.target.value)}
                                />
                              </div>
                            )}

                            {/* Apply Button */}
                            <Button variant="primary" className="mt-2 w-100" onClick={() => fetchData()}>
                              Apply Filters
                            </Button>
                          </Form>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || extraActions) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center">
                  <Spinner animation="border" />
                </td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr key={index}>
                  {columns.map((col) => (
                    <td key={`${index}-${col.key}`}>{renderRow(col, row)}</td>
                  ))}
                  {(onEdit || onDelete || extraActions) && (
                    <td>
                      <div className="d-flex align-items-center">
                        {onEdit && (
                          <Button size="sm" variant="primary" className="me-1" onClick={() => onEdit(row)}>
                            <i className={'fa fa-pencil-alt'} />
                          </Button>
                        )}
                        {onDelete && (
                          <Button size="sm" variant="danger" className="me-1" onClick={() => onDelete(row)}>
                            <i className={'fa fa-trash'} />
                          </Button>
                        )}
                        {extraActions && (
                          <Dropdown>
                            <Dropdown.Toggle variant="light" size="sm">
                              <i className={'fa fa-ellipsis'} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>{extraActions(row)}</Dropdown.Menu>
                          </Dropdown>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Pagination */}
        <Pagination>
          <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} />
          <Pagination.Item active>{currentPage}</Pagination.Item>
          <Pagination.Next disabled={currentPage >= totalPages} onClick={() => setCurrentPage((prev) => prev + 1)} />
        </Pagination>
      </div>
    );
  }
);

export default DataTable;
